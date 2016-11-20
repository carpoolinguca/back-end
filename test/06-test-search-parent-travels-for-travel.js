// Defino parent travel a todos los travels que puedan contener al viaje determinado.
// Tengo que buscar entre todos los viajes que al menos tengan un lugar libre, que coincidan con el mismo destino, que tengan el día de la fecha, opcional para buscar otro día y a una hora determinada. Y que sean viajes con usuario diferente al que realiza la consulta.


var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var Travel = require('../models/travel')(sequelize);

var createUsers = function(next) {
	var userJuana = {
		email: 'juana@gmail.com',
		password: '1234',
		name: 'Juana',
		lastname: 'La Loca',
		ucaid: '020800233',
		sex: 'Femenino',
	};
	var userJacinta = {
		email: 'jacinta@gmail.com',
		password: '4321',
		name: 'Jacinta',
		lastname: 'La Cinta',
		ucaid: '020800234',
		sex: 'Femenino',
	};
	var users = [userJuana, userJacinta];

	User.create(userJuana).then(function(anUser) {
		users[0] = anUser;
		User.create(userJacinta).then(function(anotherUser) {
			users[1] = anotherUser;
			next(users);
		});
	});
};

var createTravels = function(next) {
	createUsers(function(users) {
		var id1 = users[0].id;
		var id2 = users[1].id;
		var travelFromLibrary = {
			userId: id1,
			origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			seats: 1,
			arrivalDateTime: "2016-10-21 14:05:06",
			observations: "De la biblio a la facu."
		};
		var travelToPurmamarca = {
			userId: id2,
			origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			seats: 0,
			arrivalDateTime: "2016-10-21 14:05:06",
			observations: "De la biblio a la Purmamarca."
		};
		var travels = [];
		Travel.create(travelFromLibrary).then(function(travel) {
			travels[0] = travel;
			Travel.create(travelToPurmamarca).then(function(anotherTravel) {
				travels[1] = anotherTravel;
				next(users, travels);
			});
		});
	});
};

var students = [];
var studyTravels = [];
describe('Find closestRoute', function() {
	before(function(done) {
		createTravels(function(users, travels) {
			students = users;
			studyTravels = travels;
			done();
		});
	});

	it('Should exist two users.', function(endingFunction) {
		User.findAll({
			attributes: [
				[sequelize.fn('COUNT', sequelize.col('email')), 'email_count']
			]
		}).then(function(results) {
			assert.equal(2, results[0].get('email_count'));
			endingFunction();
		});
	});

	it('Should exist two travels.', function(endingFunction) {
		User.findAll({
			attributes: [
				[sequelize.fn('COUNT', sequelize.col('id')), 'id_count']
			]
		}).then(function(results) {
			assert.equal(2, results[0].get('id_count'));
			endingFunction();
		});
	});

	it('Should return the closest travels', function(endingFunction) {
		studentId = students[1].id;
		Travel.findAll({
			where: {
				userId: {
					$not: studentId
				},
				seats: {
					$gte: 1
				},
				destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
				arrivalDateTime: {
					$between: ["2016-10-21 00:00:00", "2016-10-21 23:59:59"]
				}
			}
		}).then(function(results) {
			assert.equal(1, results.length);
			endingFunction();
		});
	});

	after(function(done) {
		Travel.destroy({
			truncate: true
		}).then(function() {
			done();
		});
		User.destroy({
			truncate: false,
			where: {
				sex: 'Femenino'
			}
		});
	});
});