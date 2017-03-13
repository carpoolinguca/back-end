/*
complaints
----------
userFrom	INTEGER
userTo		INTEGER
reason 		STRING
*/

var Sequelize = require('sequelize');

module.exports = function(sequelize) {


	var User = require('./user')(sequelize);

	var Complaint = sequelize.define('complaint', {
		userFrom: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		userTo: {
			type: Sequelize.INTEGER,
			references: {
				model: User
			}
		},
		reason: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return Complaint;
};