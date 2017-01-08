var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Reputation = sequelize.define('reputation', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				field: 'user_id'
			}
		},
		drivingPoints: {
			type: Sequelize.INTEGER,
			field: 'driving_points'
		},
		passengerPoints: {
			type: Sequelize.INTEGER,
			field: 'passenger_points'
		}
	}, {
		freezeTableName: true
	});

	return Reputation;
};