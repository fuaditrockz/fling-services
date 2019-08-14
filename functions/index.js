require('dotenv').config();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp(firebaseConfig);

var firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    credential: admin.credential.cert(require('../key.json'))
};

const main = express();
const usersRouters = require('./src/users');

main.use('/v1', usersRouters);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

exports.api = functions.https.onRequest(main);
