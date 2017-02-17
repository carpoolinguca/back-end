var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Review = sequelize.define('review', {
		isDriver: {
			type: Sequelize.BOOLEAN
		},
		driverId: {
			type: Sequelize.INTEGER,
			field: 'driver_id',
			references: {
				model: User
			}
		},
		points: {
			type: Sequelize.INTEGER
		},
		passengerId: {
			type: Sequelize.INTEGER,
			field: 'passenger_id',
			references: {
				model: User
			}
		},
		reviewTitle: {
			type: Sequelize.STRING
		},
		detailReview: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return Review;
};