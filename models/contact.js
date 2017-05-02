var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);

	var Contact = sequelize.define('contact', {
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			},
			unique : 'userAndContact'
		},
		contactId: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			},
			unique : 'userAndContact'
		},
		isFavorite: {
			type: Sequelize.BOOLEAN,
		},
	}, {
		freezeTableName: true
	});

	return Contact;
};