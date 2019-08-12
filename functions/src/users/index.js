const admin           = require('firebase-admin');
const express         = require('express');
const firebaseHelper  = require('firebase-functions-helper');
const NesthydrationJS = require('nesthydrationjs')();
const _               = require('lodash');
const uuidV4          = require('uuid/v4');
const moment          = require('moment-timezone');
const Promise        = require('bluebird');

const { errorResponse, successResponseWithData, successResponseWithoutData } = require('./responsers');

const { users_definition } = require('./definition');

const app  = express();
const db   = admin.firestore();
const auth = admin.auth();
const now  = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")

db.settings({ timestampsInSnapshots: true });

// GET ALL USERS
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

// REGISTER NEW USER
app.post('/register', (req, res) => {
	const user_id = uuidV4();
	const form = {
		id: user_id,
		first_name: req.body['first_name'],
		last_name: req.body['last_name'],
		email: req.body['email'],
		password: req.body['password'],
		phone_number: null,
		gender: null,
		avatar: null,
		birth_of_date: null,
		country: null,
		state: null,
		region: null,
		zipcode: null,
		address: null,
		is_premium: false,
		is_confirmed: false,	
		created_at: now,
		updated_at: now
	};

	function registerUser(data) {
		auth.createUser(data)
			.then(userRecord => {
				console.log(`Successfully created new user: ${userRecord}`);
			})
			.catch(error => {
				console.log(`Error at 'registerUser': ${error}`);
				res.status(500).send(errorResponse(
					"Failed to register user",
					500
				))
			})
	}

	function addUsertoDB(input) {
		const finalData = NesthydrationJS.nest(input, users_definition);
		console.log(finalData);
		firebaseHelper.firestore
			.createDocumentWithID(db, 'users', finalData[0].id, finalData[0])
			.then(response => {
				  console.log(response)
					res.status(201).send(
						successResponseWithData(
							response.id,
							"Welcome to Fling! You've succed to make an account.",
							201
						)
					);
			})
			.catch(error => {
				console.log(`Error at 'addUsertoDB' : ${error}`);
				res.status(500).send(errorResponse(
					"Failed to add user to DB",
					500
				))
			});
	} 

	Promise.try(() => registerUser(form))
	  .then(() => {
			addUsertoDB(form);
		})
		.catch(error => {
			console.log(`'/register is failed: ${error}`);
			res.status(500).send(errorResponse(
				"/register is failed",
				500
			));
		});

});

// TEST
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