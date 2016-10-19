var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth.js');

var UserPersistenceManagery = require('../controllers/user-persistence-manager.js');
var userPersistenceManagery = new UserPersistenceManagery();

router.route('/').get( function(req, res) {
	userPersistenceManagery.read(function (users) {
		res.json(users);
	});
}).post(function(req, res) {
	userPersistenceManagery.create(req.body , function(){
		res.json({user : req.body , receibed : 'Ok'});
	});
});

module.exports = router;
