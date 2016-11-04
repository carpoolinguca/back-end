//'CREATE TABLE travels ( id serial primary key, userid integer, origin varchar(200), destination varchar(200), seats integer, arrivalDateTime timestamp, observations varchar(200));'

var Sequelize = require('sequelize');

module.exports = function(sequelize) {

	var User = require('./user')(sequelize);
	
	var Travel = sequelize.define('travel', {
		user_id: {
			type: Sequelize.INTEGER,
			model: User,
			key: 'id'
		},
		origin: {
			type: Sequelize.STRING
		},
		destination: {
			type: Sequelize.STRING
		},
		seats: {
			type: Sequelize.INTEGER
		},
		arrival_date_time: {
			type: Sequelize.STRING
		},
		observations: {
			type: Sequelize.STRING
		}
	}, {
		freezeTableName: true
	});

	return Travel;
};