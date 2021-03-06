import * as fs from 'fs'

import * as restify from 'restify'
import * as mongoose from 'mongoose'
import {environment} from '../common/environment'
import { logger } from '../common/logger'
import {Router} from '../common/router'
import { mergePatchBodyParser } from './merge-patch.parser'
import { handlerError } from './error.handler';
import {tokenParser} from '../security/token.parser'

//servidor genérrico
export class Server {
    application: restify.Server

    //método conexão bd
    initializeDb(): mongoose.MongooseThenable{
        (<any>mongoose).Promise = global.Promise//promise nodejs
        return  mongoose.connect(environment.db.url, {
           useMongoClient: true//new connection 
        })
    }

    //método
    initRoutes(routers: Router[]): Promise<any>{
        return new Promise((resolve, reject) =>{
            try {
                const restify = require("restify");
                //criar server
                const options  = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0',
                    log: logger // instância do logger do bayner 
                });

                if(environment.security.enableHTTPS){
                    options.certificate = fs.readFileSync(environment.security.certificate),
                    options.key = fs.readFileSync(environment.security.key);
                }

                this.application = restify.createServer(options);
                this.application.pre(restify.plugins.requestLogger({
                    log: logger //log especifico
                }));
                this.application.use(restify.plugins.queryParser());//parse de parâmetros na url
                this.application.use(restify.plugins.bodyParser()); //parse body
                this.application.use(mergePatchBodyParser);
                this.application.use(tokenParser);

                //routers application

                    for (let router of routers){
                        router.applyRoutes(this.application)
                    }
                    
                //routers application

                this.application.listen(environment.server.port, () => {
                    // console.log('Api is runnig on http://localhost:3000')
                    resolve(this.application)//conexão ok
                })
                this.application.on('restifyError', handlerError) //error restify
                // this.application.on('error', (error)) //captura erro, finalizar sem erro
                // (req, resp, route, error)
               /* this.application.on('after', restify.plugins.auditLogger({
                    log: logger,
                    event: 'after', // imprimir informações no console
                    server: this.application
                })) //log 

                this.application.on('audit', data=>[

                ])*/
            } catch (error) {
                reject(error)
            }
        })
    }
    //array de routers, inicializar conexão com o bd
    bootstrap(routers: Router[] = []): Promise<Server>{
        return this.initializeDb().then(() => 
               this.initRoutes(routers).then(() => this))//retorna a própria instância do servidor
    }

    //desconectar
    shutdown(){
        return mongoose.disconnect().then(() => this.application.close())
    }
}