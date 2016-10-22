var express = require('express');
var router = express.Router();

var authController = require('../controllers/auth.js');

var UserPersistenceManagery = require('../controllers/user-persistence-manager.js');
var userPersistenceManagery = new UserPersistenceManagery();

var TokenCreator = require('../controllers/token-creator.js');
var tokenCreator = new TokenCreator();

router.route('/').get( function(req, res) {
	userPersistenceManagery.read(function (users) {
		res.json(users);
	});
}).post(function(req, res) {
	userPersistenceManagery.create(req.body , function(){
		res.json({user : req.body , receibed : 'Ok'});
	});
});

router.route('/login').post(function(req, res) {
	userPersistenceManagery.findOne(req.body.email , function(user){
	if (!user) {
      return res.status(401).send({ message: { email: 'Incorrect email' } });
    }

    if (req.body.password == user.password) {

    	//delete user.password;

    	var token = tokenCreator.create(user);
    	res.send({ token: token, user: user });
    } 
    else {
    	return res.status(401).send({ message: { password: 'Incorrect password' } });
    }});
});
module.exports = router;
