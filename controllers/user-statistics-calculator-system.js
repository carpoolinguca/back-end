var Sequelize;
var User;
var UserStatistics;

function UserStatisticsSystem(sequelize) {
	User = require('../models/user')(sequelize);
	UserStatistics = require('../models/user-statistics')(sequelize);
	Sequelize = sequelize;
}


UserStatisticsSystem.prototype.initializeUserStatisticsFor = function(user, callback) {
	userStatistics = {
		userId: user.id,
		passengerTravels: 0,
		driverTravels: 0,
		totalTravels: 0,
		distanceAsPassenger: 0,
		distanceAsDriver: 0,
		totalDistance: 0,
		passengersTransported: 0,
		driverCarbonFootprint: 0,
		driverSavedCarbonFootprint: 0,
		passengerSavedCarbonFootprint: 0,
		totalSavedCarbonFootprint: 0
	};
	UserStatistics.create(userStatistics).then(function(userStatisticsCreated) {
		callback(userStatisticsCreated);
	});
};

UserStatisticsSystem.prototype.userStatisticsForUserById = function(userId, callback) {
	UserStatistics.findOne({
		where: {
			userId: userId
		},
		attributes: ['id', 'userId', 'passengerTravels', 'driverTravels', 'totalTravels', 'distanceAsPassenger', 'distanceAsDriver', 'totalDistance', 'passengersTransported', 'driverCarbonFootprint', 'driverSavedCarbonFootprint', 'passengerSavedCarbonFootprint', 'totalSavedCarbonFootprint']
	}).then(function(userStatistics) {
		callback(userStatistics);
	});
};

UserStatisticsSystem.prototype.calculateStatisticsForRoute = function(route){
	var carbonFootPrint = route.distance * 0.000223;
	var distance = route.distance / 1000;
	return {distance: distance, carbonFootPrint: carbonFootPrint};
};

UserStatisticsSystem.prototype.calculateStatisticsForParentTravel = function(parentTravel, route, callback){
	var routeStatistics = this.calculateStatisticsForRoute(route);
	var passengers = parentTravel.maximumSeats - parentTravel.availableSeats;
	var savedCarbonFootPrint = routeStatistics.carbonFootPrint * passengers;
	return {distance: routeStatistics.distance,
			carbonFootPrint: routeStatistics.carbonFootPrint,
			passengers: passengers,
			savedCarbonFootPrint: savedCarbonFootPrint};
};

UserStatisticsSystem.prototype.updateUsingParentTravelAndRoute = function(parentTravel, route, callback) {
	var self = this;
	var userId = parentTravel.userId;
	UserStatistics.findOne({
		where: {
			userId: userId
		}
	}).then(function(userStatistics) {
		if (!userStatistics) {
			console.log('error');
			callback(new Error('No se encontró una estadistica para el userId: ' + parentTravel.userId));
			return;
		}
		travelStatistics = self.calculateStatisticsForParentTravel(parentTravel,route);
		userStatistics.driverTravels = userStatistics.driverTravels + 1;
		userStatistics.totalTravels = userStatistics.totalTravels + 1;
		userStatistics.distanceAsDriver = userStatistics.distanceAsDriver + travelStatistics.distance;
		userStatistics.totalDistance = userStatistics.totalDistance + travelStatistics.distance;
		userStatistics.passengersTransported = userStatistics.passengersTransported + travelStatistics.passengers;
		userStatistics.driverCarbonFootprint = userStatistics.driverCarbonFootprint + travelStatistics.carbonFootPrint;
		userStatistics.driverSavedCarbonFootprint = userStatistics.driverSavedCarbonFootprint + travelStatistics.savedCarbonFootPrint;
		userStatistics.totalSavedCarbonFootprint = userStatistics.totalSavedCarbonFootprint + travelStatistics.savedCarbonFootPrint;
		userStatistics.save().then(function(){
			userStatistics.reload().then(function(){
				callback(null, userStatistics);
			})
		}); 
	});
};

UserStatisticsSystem.prototype.updateUsingChildTravelAndRoute = function(childTravel, route, callback) {
	var self = this;
	var userId = childTravel.userId;
	UserStatistics.findOne({
		where: {
			userId: userId
		}
	}).then(function(userStatistics) {
		if (!userStatistics) {
			console.log('error');
			callback(new Error('No se encontró una estadistica para el userId: ' + childTravel.userId));
			return;
		}
		routeStatistics = self.calculateStatisticsForRoute(route);
		userStatistics.passengerTravels = userStatistics.passengerTravels + 1;
		userStatistics.totalTravels = userStatistics.totalTravels + 1;
		userStatistics.distanceAsPassenger = userStatistics.distanceAsPassenger + routeStatistics.distance;
		userStatistics.totalDistance = userStatistics.totalDistance + routeStatistics.distance;
		userStatistics.passengerSavedCarbonFootprint = userStatistics.passengerSavedCarbonFootprint + routeStatistics.carbonFootPrint;
		userStatistics.totalSavedCarbonFootprint = userStatistics.totalSavedCarbonFootprint + routeStatistics.carbonFootPrint;
		userStatistics.save().then(function(){
			userStatistics.reload().then(function(){
				callback(null, userStatistics);
			})
		}); 
	});
};

UserStatisticsSystem.prototype.destroyUserStatisticsFor = function(user, callback) {
	UserStatistics.destroy({
		where: {
			userId: user.id
		}
	}).then(function(numberOfDeleted) {
		callback();
	});
};

module.exports = UserStatisticsSystem;