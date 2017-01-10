/*
reviews
-------
id 				SECUENTIAL INTEGER KEY
is_driver		CHAR
driver_id		INTEGER
points 			INTEGER
passenger_id	INTEGER
review 			STRING
detail_review	STRING

*/

var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Review = sequelize.define('review', {
		isDriver: {
			type: Sequelize.BOOLEAN,
			references: {
				field: 'is_driver'
			}
		}
		driverId: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				field: 'driver_id'
			}
		},
		driverId: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				field: 'driver_id'
			}
		},
		points: {
			type: Sequelize.INTEGER,
			field: 'driving_points'
		},
		passengerId: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				field: 'driver_id'
			}
		},
		review: {
			type: Sequelize.INTEGER,
			field: 'review'
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