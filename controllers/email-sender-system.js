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
			subject: 'Bienvenido a Ecotravel - Carpooling',
			text: text
		}, function(error, info) {
			if (error) {
				return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
		});
	}
	callback(null);
};

EmailSenderSystem.prototype.sendNewPassword = function(user, newPassword, callback) {
	var body = '<p> ' + user.name + ':</p><p> Si usted ha expresado que se olvidó la contraseña, puede ingresar con la siguiente contraseña: </p><p>' + newPassword + '</p><p> Esta nueva contraseña tiene una validez de 24hs. Al ingresar nuevamente le rogamos que asigne una nueva contraseña. </p><p> En caso de no haber olivado su contraseña, desestime este mensaje. </p><p> Saludos.</p>';
	if (emailConfig.enabled) {
		transporter.sendMail({
			from: '"Ecotravel Carpooling - No responder" <' + emailConfig.auth.user + '>',
			to: user.email,
			subject: 'Cambio de contraseña en Ecotravel - Carpooling',
			html: body
		}, function(error, info) {
			if (error) {
				callback(new Error('No se ha podido enviar el email'));
				console.log(error);
				return;
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
		});
	}
	callback(null);
};

module.exports = EmailSenderSystem;