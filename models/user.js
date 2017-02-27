//'CREATE TABLE users ( id serial primary key, email varchar(30) NOT NULL, password varchar(40) NOT NULL, name varchar(100) NOT NULL, lastname varchar(100) NOT NULL, ucaid char(10), sex char(10) NOT NULL);'

var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = sequelize.define('user', {
		email: {
			type: Sequelize.STRING
		},
		password: {
			type: Sequelize.STRING
		},
		name: {
			type: Sequelize.STRING
		},
		lastname: {
			type: Sequelize.STRING
		},
		ucaid: {
			type: Sequelize.STRING
		},
		sex: {
			type: Sequelize.STRING
		},
		phone: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return User;
};