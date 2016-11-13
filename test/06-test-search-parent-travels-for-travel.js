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

	User.create(userJuana).then(function() {
		User.create(userJacinta).then(function() {
			next();
		});
	});
};

var createTravels = function(next) {

};


describe('Find closestRoute', function() {
	before(function(done) {
		createUsers(done);
	});



	it('should return the closestRoute for a point', function(endingFunction) {
		User.findAll({
			attributes: [
				[sequelize.fn('COUNT', sequelize.col('email')), 'email_count']
			]
		}).then(function(results) {
			assert.equal(2, results[0].get('email_count'));
			endingFunction();
		});
	});
	after(function(done) {
		User.destroy({
			truncate: true
		}).then(function() {
			done();
		});
	});
});