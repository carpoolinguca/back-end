var express = require('express');
var router = express.Router();

var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
var bruteforce = new ExpressBrute(store);

var emailConfig = require('../emailAccountData.js');

if (emailConfig.enabled) {
	'use strict';
	const nodemailer = require('nodemailer');

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: emailConfig.service,
		auth: emailConfig.auth
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Ecotravel Carpooling - No responder" <' + emailConfig.auth.user + '>', // sender address
		to: 'user@gmail.com', // list of receivers
		subject: 'Bienvenido a Ecotravel - Carpooling', // Subject line
		text: 'Estamos muy contentos de que comience a formar parte de nuestra comunidad de carpooling. Saludos.', // plain text body
		//html: '<b>Hello world ?</b>' // html body
	};

	router.get('/', function(req, res, next) {
		if (emailConfig.enabled) {
			// send mail with defined transport object
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}
				console.log('Message %s sent: %s', info.messageId, info.response);
			});
		}
		res.send('Hola!');
	});

} else {
	router.get('/', function(req, res, next) {
		res.send('Hola!');
	});
}

module.exports = router;