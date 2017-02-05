module.exports = function(User, Travel) {

	var createUsers = require('./createUsers')(User);

	var createTravels = function(next) {
		createUsers(function(users) {
			var id1 = users[0].id;
			var id2 = users[1].id;
			var travelFromLibrary = {
				userId: id1,
				origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
				destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
				userIsDriver: false,
				seats: 0,
				arrivalDateTime: "2016-10-21 14:05:06",
				observations: "De la biblio a la facu."
			};
			var travelToPurmamarca = {
				userId: id2,
				origin: "Avenida Alicia Moreau de Justo 1300, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
				destination: "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
				userIsDriver: true,
				seats: 1,
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
	return createTravels;
};