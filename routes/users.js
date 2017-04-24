function UserRouter(sequelize) {
    var express = require('express');
    var router = express.Router();

    var UserSystem = require('../controllers/user-administration-system');
    var userSystem = new UserSystem(sequelize);
    var AuthorizationSystem = require('../controllers/authorization-system.js');
    var authorizationSystem = new AuthorizationSystem(sequelize);

    router.route('/').post(function(req, res) {
        userSystem.register(req.body, function(user) {
            res.json({
                user: user,
                receibed: 'Ok'
            });
        });
    });

    router.route('/user/login').post(function(req, res) {
        userSystem.validateEmailAndPassword(req.body.email, req.body.password,
            function() {
                return res.status(401).send({
                    message: {
                        email: 'Incorrect email'
                    }
                });
            },
            function() {
                return res.status(401).send({
                    message: {
                        email: 'Incorrect password'
                    }
                });
            },
            function(user) {
                var token = authorizationSystem.createTokenFor(user);
                res.send({
                    token: token,
                    user: user
                });
            });
    });

    router.route('/user/update').post(authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.update(req.body, function(updatedUser) {
                res.send({
                    user: updatedUser,
                    receibed: 'Ok',
                    error: ''
                });
            },
            function() {
                res.send({
                    receibed: 'Error',
                    error: 'No se ha encontrado un usuario con ese id'
                });
            });
    });

    router.route('/user/changePassword').post(authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.changePassword(req.body.id, req.body.password, req.body.newPassword, function() {
                res.send({
                    receibed: 'Ok',
                    error: ''
                });
            },
            function(errorDescription) {
                res.send({
                    receibed: 'Error',
                    error: errorDescription
                });
            });
    });

    router.route('/user/phone').post(authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.userIdentifiedBy(req.body.userId, function(foundUser) {
            res.send({
                userId: foundUser.id,
                phone: foundUser.phone
            });
        });
    });

    return router;
}

module.exports = UserRouter;