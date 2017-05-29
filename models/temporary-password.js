var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var TemporaryPassword = sequelize.define('temporary_password', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		password: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return TemporaryPassword;
};