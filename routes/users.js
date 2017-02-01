function UserRouter(sequelize) {
    var express = require('express');
    var router = express.Router();

    var UserSystem = require('../controllers/user-administration-system');
    var userSystem = new UserSystem(sequelize);
    var AuthorizationSystem = require('../controllers/authorization-system.js');
    var authorizationSystem = new AuthorizationSystem(sequelize);

    router.route('/').get(function(req, res) {
        userSystem.usersFilteredBy({}, function(users) {
            res.json(users);
        });
    }).post(function(req, res) {
        userSystem.register(req.body, function(user) {
            res.json({
                user: user,
                receibed: 'Ok'
            });
        });
    });

    router.route('/login').post(function(req, res) {
        userSystem.oneUserFilteredBy({
            where: {
                email: req.body.email
            }
        }, function(user) {
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