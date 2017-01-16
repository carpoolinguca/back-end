function UserRouter(sequelize) {
    var express = require('express');
    var router = express.Router();
    var userSystem = require('../models/user')(sequelize);
    //var userSystem = new UserSystem();
    var AuthorizationSystem = require('../controllers/authorization-system.js');
    var authorizationSystem = new AuthorizationSystem(sequelize);

    router.route('/').get(function(req, res) {
        userSystem.findAll().then(function(users) {
            res.json(users);
        });
    }).post(function(req, res) {
        userSystem.create(req.body).then(function(user) {
            res.json({
                user: user,
                receibed: 'Ok'
            });
        });
    });

    router.route('/login').post(function(req, res) {
        userSystem.findOne({
            where: {
                email: req.body.email
            }
        }).then(function(user) {
            if (!user) {
                return res.status(401).send({
                    message: {
                        email: 'Incorrect email'
                    }
                });
            }

            if (req.body.password == user.password) {
                var token = authorizationSystem.createTokenFor(user);
                res.send({
                    token: token,
                    user: user
                });
            } else {
                return res.status(401).send({
                    message: {
                        password: 'Incorrect password'
                    }
                });
            }
        });
    });

    return router;
}

module.exports = UserRouter;