var express = require('express');
var router = express.Router();

var UserPersistenceManager = require('../controllers/user-persistence-manager.js');
var userPersistenceManager = new UserPersistenceManager();

/* GET users listing. */
router.get('/', function(req, res) {
	userPersistenceManager.read(function(users){
		res.json(users);
	});
});

router.post('/', function(req, res) {
	userPersistenceManager.create(req.body , function(){
		res.json({user : req.body , receibed : 'Ok'});
	});
});

module.exports = router;
