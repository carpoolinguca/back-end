var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Car = sequelize.define('car', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			},
			unique: 'userAndLicensePlate'
		},
		model: {
			type: Sequelize.STRING
		},
		color: {
			type: Sequelize.STRING
		},
		licensePlate: {
			type: Sequelize.STRING,
			unique: 'userAndLicensePlate'
		},
		hasAirConditioner: {
			type: Sequelize.BOOLEAN
		}
	}, {
		freezeTableName: true
	});

	return Car;
};