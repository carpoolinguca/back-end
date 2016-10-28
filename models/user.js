//'CREATE TABLE users ( id serial primary key, email varchar(30) NOT NULL, password varchar(40) NOT NULL, name varchar(100) NOT NULL, lastname varchar(100) NOT NULL, ucaid char(10), sex char(10) NOT NULL);'

var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://carpooling:carpooling@localhost:5432/carpooling');

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
	}
}, {
	freezeTableName: true
});

User.sync({
	force: true
}).then(function() {
	User.create({
		email: 'juana@gmail.com',
		password: '1234',
		name: 'Juana',
		lastname: 'La Loca',
		ucaid: '020800233',
		sex: 'Femenino',
	}).then(function() {

		User.findOne().then(function(user) {
			console.log(user.dataValues);
		});
	});
});