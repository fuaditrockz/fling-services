const admin           = require('firebase-admin');
const express         = require('express');
const firebaseHelper  = require('firebase-functions-helper');
const NesthydrationJS = require('nesthydrationjs')();
var _                 = require('lodash');
var uuidV4            = require('uuid/v4');

const { errorResponse, successResponseWithData, successResponseWithoutData } = require('./responsers');

const { users_definition } = require('./definition');

const app = express();
const db = admin.firestore();
const auth = admin.auth();

db.settings({ timestampsInSnapshots: true });

app.get('/users', (req, res) => {
    firebaseHelper.firestore
        .backup(db, 'users')
        .then(snapshot => {

            let data = _.toArray(snapshot.users);
            
            return data;
        })
        .then(data => {
            const response = successResponseWithData(
                data,
                "Success to GET users data",
                200
            );
            res.status(200).send(response)
            /* res.status(200).send(data) */
        })
        .catch(error => {
            const response = errorResponse(
                "Failed to GET users data",
                500
            );
            res.status(500).send(response)
            console.log(`Cannot get contacts: ${error}`)
        });
})

app.post('/register', async (req, res) => {

    const user_id = uuidV4();

    const form = {
        first_name: req.body['first_name'],
        last_name: req.body['last_name'],
        email: req.body['email'],
        password: req.body['password']
    };

    function registerUser(data) {
        auth.createUser(data)
          .then(userRecord => {
              return userRecord;
          })
          .catch(error => {
              res.status(500).send(errorResponse(
                  "Failed to register user",
                  500
              ))
          })
    }

    async function addUsertoDB(data, responseAuth) {
        const dataCombination = {
            id: user_id,
            ...form,
            email_auth: responseAuth.uid
        }
        firebaseHelper.firestore
              .createNewDocument(db, 'users', data[0])
              .then(response => {

              })
    } 

    try {
        await auth.createUser(form)
            .then(response => {
                const data = NesthydrationJS.nest(form, users_definition);
                firebaseHelper,firestore.createNewDocument(db, 'users', data[0]);
                res.status(200).send(response);
                console.log('Success: ', response.uid);
            })
            .catch(error => {
                console.log('Error: ', error)
            });
    } catch(error) {
        console.log(error);
        res.status(500).send(error);
    }

});

app.post('/users', async (req, res) => {
    const form = {
        first_name: req.body['first_name'],
        last_name: req.body['last_name'],
        email: req.body['email'],
        phone_number: req.body['phone_number'],
        is_premium: false
    };

    try {
        const data = await NesthydrationJS.nest(form, users_definition);
        console.log(data);
        const newDoc = await firebaseHelper.firestore
            .createNewDocument(db, 'users', data[0]);

        res.status(201).send(`Created a new contact: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`Contact should only contains firstName, lastName and email!!!`)
        console.log(error);
    } 
});

module.exports = app;