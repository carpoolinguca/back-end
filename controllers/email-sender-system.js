var emailConfig = require('../emailAccountData.js');
var nodemailer = require('nodemailer');
var sparkPostTransport = require('nodemailer-sparkpost-transport');
var transporter;
var mailOptions;

if (emailConfig.enabled) {
	transporter = nodemailer.createTransport(sparkPostTransport({
		sparkPostApiKey: emailConfig.apiKey
	}));

	mailOptions = {
		from: '"Ecotravel Carpooling - No responder" <' + emailConfig.auth.user + '>', // sender address
		to: 'usuario@gmail.com', // list of receivers
		subject: 'Bienvenido a Ecotravel - Carpooling', // Subject line
		text: 'Estamos muy contentos de que comience a formar parte de nuestra comunidad de carpooling. Saludos.', // plain text body
		//html: '<b>Hello world ?</b>' // html body
	};
}

function EmailSenderSystem() {}

EmailSenderSystem.prototype.sendWelcome = function(user, callback) {
	var text = user.name + ': Estamos muy contentos de que comience a formar parte de nuestra comunidad de carpooling. Saludos.';
	if (emailConfig.enabled) {
		transporter.sendMail({
			from: '"Ecotravel Carpooling - No responder" <' + emailConfig.auth.user + '>', // sender address
			to: user.email,
			subject: 'Bienvenido a Ecotravel - Carpooling ',
			text: text
		}, function(error, info) {
			if (error) {
				return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
		});
	}
};

module.exports = EmailSenderSystem;