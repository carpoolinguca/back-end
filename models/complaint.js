/*
complaints
----------
user_from	INTEGER
user_to		INTEGER
reason 		STRING
*/

var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Complaint = sequelize.define('complaint', {
		userFrom: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				field: 'user_from'
			}
		},
		userTo: {
			type: Sequelize.INTEGER,
			references: {
				model: User,
				field: 'user_to'
			}
		},
		reason: {
			type: Sequelize.STRING,
			field: 'reason'
		}
	}, {
		freezeTableName: true
	});

	return Complaint;
};