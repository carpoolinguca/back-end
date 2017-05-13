var userAdministrationSystem;
var travelAdministrationSystem;
var UserTestResource = require('./user-test-resource');
var userTestResource;
// Sacar carSystem de algún lado, por ejemplo desde userAdministrationSystem
//var CarSystem = require('../controllers/car-administration-system');
//var carSystem = new CarSystem(sequelize);
var travels = [];

function TravelTestResource(anUserAdministrationSystem, aTravelAdministrationSystem) {
	travelAdministrationSystem = aTravelAdministrationSystem;
	userAdministrationSystem = anUserAdministrationSystem;
	userTestResource = new UserTestResource(userAdministrationSystem);
}

TravelTestResource.prototype.registerUsersAndTravels = function(callback) {
	self = this;
	userTestResource.registerUsers(function(users) {
		self.registerTravels(users, function(userResources, travelResources) {
			callback(userResources, travelResources);
		});
	});
}

TravelTestResource.prototype.registerCarForUserId = function(userId, callback) {
	userAdministrationSystem.registerCar({
			userId: userId,
			model: 'Volkswagen Up!',
			color: 'Blanco',
			licensePlate: 'AG759LH',
			hasAirConditioner: true,
		},
		function(err, registeredCar) {
			callback(registeredCar);
		});
};

TravelTestResource.prototype.registerTravels = function(users, callback) {
	var id1 = users[0].id;
	var id2 = users[1].id;
	this.registerCarForUserId(id2, function(car) {
		var travelFromLibrary = {
			userId: id1,
			origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			userIsDriver: false,
			maximumSeats: 0,
			availableSeats: 0,
			arrivalDateTime: "2016-10-21 14:05:06",
			observations: "De la biblio a la facu."
		};
		var travelToPurmamarca = {
			userId: id2,
			origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
			userIsDriver: true,
			carId: car.id,
			seats: 3,
			arrivalDateTime: "2016-10-21 14:05:06",
			observations: "De la biblio a la Purmamarca."
		};
		travelAdministrationSystem.startManaging(travelFromLibrary, function(travel) {
			travels[0] = travel;
			travelAdministrationSystem.startManaging(travelToPurmamarca, function(anotherTravel) {
				travels[1] = anotherTravel;
				callback(users, travels);
			});
		});
	});
};

TravelTestResource.prototype.destroy = function(callback) {
	travelAdministrationSystem.destroyWithoutRoutes(travels[0], function() {
		travelAdministrationSystem.destroyWithoutRoutes(travels[1], function() {
			userTestResource.destroy(function() {
				callback();
			});
		});
	});
};

module.exports = TravelTestResource;