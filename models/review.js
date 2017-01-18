var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Review = sequelize.define('review', {
		isDriver: {
			type: Sequelize.BOOLEAN,
			field: 'is_driver'
		},
		driverId: {
			type: Sequelize.INTEGER,
			field: 'driver_id',
			references: {
				model: User
			}
		},
		points: {
			type: Sequelize.INTEGER,
			field: 'driving_points'
		},
		passengerId: {
			type: Sequelize.INTEGER,
			field: 'passenger_id',
			references: {
				model: User
			}
		},
		reviewTitle: {
			type: Sequelize.STRING,
			field: 'review_title'
		},
		detailReview: {
			type: Sequelize.STRING,
			field: 'detail_review'
		}
	}, {
		freezeTableName: true
	});

	return Review;
};