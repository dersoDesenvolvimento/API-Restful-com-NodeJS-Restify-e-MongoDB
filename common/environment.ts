export const environment ={
server: {port: process.env.SERVER_PORT || 3000 },//variável de ambiente
db: {url: process.env.DB_URL || 'mongodb://localhost/meat-api'},// url db
    security: { 
        saltRounds: process.env.SALT_ROUNDS || 10, //numbers out setRounds
        apiSecret: process.env.API_SECERT || 'meat-api-secret',
        enableHTTPS: process.env.ENABLE_HTTPS || false,
        certificate: process.env.CERTI_FILE || './security/keys/cert.pem',
        key: process.env.CERT_KEY_FILE || './security/keys/key.pem'
    }
} 