require('dotenv').config({ path: '.env' });

const cors = require('cors');
const dbHost = process.env.MONGODB_HOST;
const express = require('express');
const fs = require('fs');
const mongodb = require('mongodb');
const path = require('path');

const app = express();
const MongoClient = mongodb.MongoClient;

if (process.env.ENV === 'production') {
    const https = require('https');

    const sslCertificate = fs.readFileSync(process.env.SERVER_SSL_CERTIFICATE);

    const sslPrivateKey = fs.readFileSync(process.env.SERVER_SSL_PRIVATE_KEY);

    const sslClientCertificate = fs.readFileSync(
        process.env.SERVER_SSL_CLIENT_CERTIFICATE
    );

    https
        .createServer(
            {
                key: sslPrivateKey,
                cert: sslCertificate,
                ca: sslClientCertificate,
                requestCert: true,
                rejectUnauthorized: false
            },
            app
        )
        .listen(3002);
} else {
    app.listen(3002);
}

app.options('*', cors());

app.use(
    require('forest-express-mongoose').init({
        modelsDir: path.join(__dirname, '/models'),
        envSecret: process.env.FOREST_ENV_SECRET,
        authSecret: process.env.FOREST_AUTH_SECRET,
        mongoose: require('mongoose')
    })
);

MongoClient.connect(
    dbHost,
    process.env.ENV === 'production'
        ? {
              sslValidate: true,
              sslCA: [
                  fs.readFileSync(process.env.MONGO_SSL_CLIENT_CERTIFICATE)
              ],
              sslKey: fs.readFileSync(process.env.MONGO_SSL_PRIVATE_KEY),
              sslCert: fs.readFileSync(process.env.MONGO_SSL_CERTIFICATE),
              useNewUrlParser: true
          }
        : { useNewUrlParser: true },
    (err, client) => {
        if (err) throw err;

        client.db('linky');
    }
);

if (process.env.ENV === 'production') {
    app.get('/*', (req, res, next) => {
        if (!req.client.authorized) {
            return res.sendStatus(401).send('User is not authorized');
        }

        next();
    });
} else {
    app.get('/', (req, res) => {
        res.sendStatus(200);
    });
}
