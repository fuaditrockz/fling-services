const admin           = require('firebase-admin');
const express         = require('express');
const firebaseHelper  = require('firebase-functions-helper');
const NesthydrationJS = require('nesthydrationjs')();
const _               = require('lodash');
const uuidV4          = require('uuid/v4');
const moment          = require('moment-timezone');
const jwt             = require('jsonwebtoken');
const platform        = require('platform');
const bcrypt          = require('bcrypt');

const private_key = require('../../key.json');

const { errorResponse, successResponseWithData, registerResponse } = require('./responsers');

const { users_definition, auth_definition } = require('./definition');

const app  = express();
const db   = admin.firestore();
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

	var ua = req.headers['user-agent'];

	const generatedToken = jwt.sign(
		{
			username: req.body['username'],
			email: req.body['email'],
			full_name: req.body['first_name'] + ' ' + req.body['last_name']
		},
		private_key.private_key,
		{ expiresIn: "1y", issuer: "Fling Corporation" },
		(err, token) => {
			if(token) {
				return token;
			} else {
				console.log(`Error when generate token: ${err}`);
				res.send('Error when generate token.');
			}
		}
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

	/* const REGISTER_USER = data => {
		return new Promise((resolve, reject) => {
			data
			? resolve(data)
			: reject(res.status(412).send(errorResponse(
				'Fields cannot be null. Please make sure if you have been fill all of inputs.',
				412
			)))
		})
	} */

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
		let result = db.collection('users').where('authentication.email', '==', data.email).get()
		.then(snapshot => {
			if (snapshot.empty) {
				console.log('No matching documents');
				return;
			}

			let list = [];

			snapshot.forEach(doc => {
				/* console.log(doc.id, '=>', doc.data()); */
				/* res.send(doc.data()); */
				list.push(doc.data());
			})
			return list;
		})
		.catch(err => {
			console.log(err);
			res.status(500).send(errorResponse(
				'Failed to get data from server',
				500
			))
		});

		return result;
	}

	function addUsertoDB(is_exist, input) {
		const result = [];
		if(!is_exist) {
			let hash = bcrypt.hashSync(input.password, 10);
			input.password = hash;
			const finalData = NesthydrationJS.nest(input, users_definition);
			firebaseHelper.firestore.createDocumentWithID(db, 'users', finalData[0].id, finalData[0])
			.then(response => {
				result.push(response);
			})
			.catch(err => {
				console.log(`Error at 'addUsertoDB' : ${err}`);
				res.status(401).send(errorResponse(
					"Failed to add user to DB",
					401
				))
			})
		} else {
			res.status(401).send(errorResponse(
				`Email: ${input.email} has been taken. Please make sure to register with correct email.`,
				401
			))
		}
		return result;
	} 

	async function createSessionLogin(data) {
		const ua = req.headers['user-agent'];
		const info = platform.parse(ua);
		let platformSpec = {
			name: info.name,
			version: info.version,
			layout: info.layout,
			os: info.os,
			description: info.description
		}
		const sessionLoginData = {
			user_id: data.id,
			deviceInfo: platformSpec,
			access_token: null,
			auth_type: "regular-email"
		}
		const finalData = NesthydrationJS.nest(sessionLoginData, auth_definition);

		await db.collection('auth').add(finalData[0])
		.then(ref => {
			res.send(ref);
		})
		.catch(err => res.send(err));
	}

	async function REGISTER_USER(data) {
		try {
			const formValidationResult = await formValidation(data);
			const emailCheckingResult = await emailChecking(formValidationResult);
			await addUsertoDB(emailCheckingResult, data);
			await createSessionLogin(data);
		} catch(error) {
			res.send(error);
		}
	}

	REGISTER_USER(form);

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