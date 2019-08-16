const admin           = require('firebase-admin');
const functions = require('firebase-functions');
const express         = require('express');
const firebaseHelper  = require('firebase-functions-helper');
const NesthydrationJS = require('nesthydrationjs')();
const _               = require('lodash');
const uuidV4          = require('uuid/v4');
const moment          = require('moment-timezone');
const jwt             = require('jsonwebtoken');
const platform        = require('platform');

const { errorResponse, successResponseWithData, registerResponse } = require('./responsers');

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
				console.log(data);
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
	const generatedToken = jwt.sign(
		{
			username: req.body['username'],
			email: req.body['email'],
			full_name: req.body['first_name'] + ' ' + req.body['last_name']
		},
		'fling-application'
	)
	const form = {
		id: user_id,
		username: req.body['username'],
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
		token: generatedToken,
		created_at: now,
		updated_at: now
	};

	const REGISTER_USER = data => {
		return new Promise((resolve, reject) => {
			data
			? resolve(data)
			: reject(res.status(412).send(errorResponse(
				'Fields cannot be null. Please make sure if you have been fill all of inputs.',
				412
			)))
		})
	}

	function formValidation(data) {
		switch (true) {
			case !form.first_name || !form.last_name:
				res.status(402).send(errorResponse(
					"Please make sure to fill your first name or last name completely.",
					402
				));
				break;
			case !form.email:
				res.status(402).send(errorResponse(
					"Please make sure to fill your email.",
					402
				));
				break;
			case !form.password:
				res.status(402).send(errorResponse(
					"Please make sure to fill your correct password",
					402
				));
				break;
			case !form.username:
				res.status(402).send(errorResponse(
					"Please make sure to fill your username",
					402
				));
				break;
			default:
				return data;
		}
	}

	function emailChecking(data) {
		let checkResult = db.collection('users').where('contact.email', '==', data.email).get()
		    .then(response => {
				for ( let doc of response.docs ) {
					console.log(doc.ref.id);
					return doc.ref.id;
				}
			})
		return checkResult;
	}

	/* function usersAuthentication(is_exist, data) {
		if (is_exist) {
			auth.createCustomToken(data.username)
			.then(response => {
				console.log(response);
				res.send(response);
			})
			.catch(error => {
				console.log(error);
				res.status(500).send(errorResponse(
					`Failed to get access token: ${error}`,
					500
				))
			});
		} else {
			res.send(errorResponse(
				`We're sorry, this user is already exists. Please make sure if you have another email.`,
				412
			));
		}
	} */

	function registerUser(data) {
		auth.createUser(data)
			.then(userRecord => {
				console.log(`Successfully created new user: ${userRecord}`);
				res.status(201).send(registerResponse(
					`Successfully created new user.`,
					201,
					userRecord
				))
				res.send(userRecord);
			})
			.catch(error => {
				console.log(`'registerUser()': ${error}`);
				res.status(500).send(errorResponse(
					`${error}`,
					500
				))
			})
	}

	function addUsertoDB(input) {
		const finalData = NesthydrationJS.nest(input, users_definition);
		console.log(finalData);
		firebaseHelper.firestore
		.createDocumentWithID(db, 'users', finalData[0].username, finalData[0])
		.then(response => {
				console.log(response)
				res.status(201).send(
					registerResponse(
						response.id,
						"Welcome to Fling! You've succed to make an account.",
						201
					)
				);
		})
		.catch(error => {
			console.log(`Error at 'addUsertoDB' : ${error}`);
			res.status(401).send(errorResponse(
				"Failed to add user to DB",
				401
			))
		});
	} 

	REGISTER_USER(form)
	  .then(res => formValidation(res))
	  .then(res => emailChecking(res))
	  .then(() => registerUser(form))
	  .catch(err => res.send(err));

});

app.get('/test_platform', (req, res) => {
	var ua = req.headers['user-agent'];

	var info = platform.parse(ua);
	let platformSpec = {
		name: info.name,
		version: info.version,
		layout: info.layout,
		os: info.os,
		description: info.description
	}

	res.send(platformSpec);
})

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