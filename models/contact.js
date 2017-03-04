var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);

	var Contact = sequelize.define('contact', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		contactId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		}
	}, {
		freezeTableName: true
	});

	return Contact;
};