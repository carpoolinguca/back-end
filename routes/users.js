function UserRouter(sequelize) {
    var express = require('express');
    var router = express.Router();

    var UserSystem = require('../controllers/user-administration-system');
    var userSystem = new UserSystem(sequelize);
    var CarSystem = require('../controllers/car-administration-system');
    var carSystem = new CarSystem(sequelize);
    var PhotoSystem = require('../controllers/profile-photo-administration-system');
    var photoSystem = new PhotoSystem(sequelize);
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

    router.route('/user/profile').post(authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.userIdentifiedBy(req.body.userId, function(foundUser) {
            carSystem.carsForUserById(foundUser.id, function(foundCars) {
                photoSystem.profilePhotoForUserById(foundUser.id, function(foundPhoto){
                    var fileName = '';
                    if(foundPhoto){
                        fileName = foundPhoto.fileName;
                    } 
                    res.send({
                            id: foundUser.id,
                            name: foundUser.name,
                            lastname: foundUser.lastname,
                            ucaid: foundUser.ucaid,
                            phone: foundUser.phone,
                            email: foundUser.email,
                            cars: foundCars,
                            photo: fileName
                    });
                });
            });
        });
    });

    router.route('/user/cars').post(authorizationSystem.isAuthenticated, function(req, res) {
        carSystem.register(req.body, function(err, registeredCar) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
            } else {
                res.send({
                    car: {
                        id: registeredCar.id,
                        userId: registeredCar.userId,
                        model: registeredCar.model,
                        color: registeredCar.color,
                        licensePlate: registeredCar.licensePlate,
                        hasAirConditioner: registeredCar.hasAirConditioner
                    },
                    receibed: 'Ok',
                    error: ''
                });
            }
        });
    });

    router.route('/user/cars/car/delete').post(authorizationSystem.isAuthenticated, function(req, res) {
        carSystem.unregister(req.body.id, function(err, registeredCar) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
            } else {
                res.send({
                    receibed: 'Ok',
                    error: ''
                });
            }
        });
    });

    router.route('/user/cars/car/update').post(authorizationSystem.isAuthenticated, function(req, res) {
        carSystem.update(req.body, function(err, updatedCar) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
            } else {
                res.send({
                    car: {
                        id: updatedCar.id,
                        userId: updatedCar.userId,
                        model: updatedCar.model,
                        color: updatedCar.color,
                        licensePlate: updatedCar.licensePlate,
                        hasAirConditioner: updatedCar.hasAirConditioner
                    },
                    receibed: 'Ok',
                    error: ''
                });
            }
        });
    });

    return router;
}

module.exports = UserRouter;