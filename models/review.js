var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Review = sequelize.define('review', {
		isDriver: {
			type: Sequelize.BOOLEAN
		},
		driverId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		points: {
			type: Sequelize.INTEGER
		},
		passengerId: {
			type: Sequelize.INTEGER,
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