var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth.js');

var ClientPersistenceManager = require('../controllers/client-persistence-manager.js');
var clientPersistenceManager = new ClientPersistenceManager();

router.route('/').get(authController.isAuthenticated, function(req, res) {
	console.log(req.query.userId);
	clientPersistenceManager.findByUserId(req.query.userId , function (clients) {
		res.json(clients);
	});
}).post(function(req, res) {
	clientPersistenceManager.create(req.body , function(){
		res.json({user : req.body , receibed : 'Ok'});
	});
});

module.exports = router;
