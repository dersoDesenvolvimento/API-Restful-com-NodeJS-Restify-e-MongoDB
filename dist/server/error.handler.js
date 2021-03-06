"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerError = (req, resp, err, done) => {
    console.log(err);
    //error restify
    err.toJSON = () => {
        return {
            message: err.message
        };
    };
    //error servidor mongod
    switch (err.name) {
        case 'MongoError':
            if (err.code === 11000) {
                err.statusCode = 400;
            }
            break;
        case 'ValidationError':
            err.statusCode = 400;
            //array de messagens
            const messages = [];
            for (let name in err.errors) {
                messages.push({ message: err.errors[name].message });
            }
            err.toJSON = () => ({
                errors: messages //retorna a lista de erro
            });
            break;
    }
    done();
};
