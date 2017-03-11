var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Reputation = sequelize.define('reputation', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		drivingPoints: {
			type: Sequelize.INTEGER
		},
		passengerPoints: {
			type: Sequelize.INTEGER
		}
	}, {
		freezeTableName: true
	});

	return Reputation;
};