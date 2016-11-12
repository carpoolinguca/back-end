var Sequelize = require('sequelize');
var sequelize = new Sequelize('postgres://carpooling:carpooling@localhost:5432/carpooling');

module.exports = sequelize;