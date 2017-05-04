var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var UserPhoto = sequelize.define('user_photo', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		fileName: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return UserPhoto;
};