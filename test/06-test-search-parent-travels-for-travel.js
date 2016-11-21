// Defino parent travel a todos los travels que puedan contener al viaje determinado.
// Tengo que buscar entre todos los viajes que al menos tengan un lugar libre, que coincidan con el mismo destino, que tengan el día de la fecha, opcional para buscar otro día y a una hora determinada. Y que sean viajes con usuario diferente al que realiza la consulta.


var assert = require('chai').assert;
var sequelize = require('../sequelizeConfigured');
var User = require('../models/user')(sequelize);
var Travel = require('../models/travel')(sequelize);
var createTravels = require('./createTravels')(User, Travel);

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