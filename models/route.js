var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var Travel = require('./travel')(sequelize);
	
	var Route = sequelize.define('route', {
		travelId: {
			type: Sequelize.INTEGER,
			model: Travel,
			key: 'id',
			field: 'travel_id'
		},
		origin: Sequelize.STRING,
		destination: Sequelize.STRING,
		polyline: {
			type: Sequelize.GEOMETRY('LINESTRING')
		},
		distance: Sequelize.INTEGER,
		duration: Sequelize.STRING,
		summary: Sequelize.STRING
	}, {
		freezeTableName: true
	});

	return Route;
};