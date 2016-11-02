function UserRouter(sequelize){
    var express = require('express');
    var router = express.Router();
     
    var authController = require('../controllers/auth.js');

    var userSystem = require('../models/user')(sequelize);

    var TokenCreator = require('../controllers/token-creator.js');
    var tokenCreator = new TokenCreator();


    router.route('/').get( function(req, res) {
        userSystem.findAll().then(function (users) {
            res.json(users);
        });
    }).post(function(req, res) {
        userSystem.create(req.body).then(function(user){
            res.json({user : user , receibed : 'Ok'});
        });
    });

    return router;
}

module.exports = UserRouter;

/*
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

*/
