function UserRouter(sequelize) {
    var express = require('express');
    var router = express.Router();

    var ExpressBrute = require('express-brute');
    var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 

    var failCallback = function(req, res, next, nextValidRequestDate) {
        res.send({
            receibed: 'Error',
            error: "Has hecho demasiados intentos fallidos. Podrás volver a intentar dentro de algunas horas."
        });
    };

    var handleStoreError = function(error) {
        log.error(error); // log this error so we can figure out what went wrong 
        // cause node to exit, hopefully restarting the process fixes the problem 
        throw {
            message: error.message,
            parent: error.parent
        };
    };

    // Start slowing requests after 5 failed attempts to do something for the same user 
    var userBruteforce = new ExpressBrute(store, {
        freeRetries: 5,
        minWait: 5 * 60 * 1000, // 5 minutes 
        maxWait: 60 * 60 * 1000, // 1 hour, 
        failCallback: failCallback,
        handleStoreError: handleStoreError
    });
    // No more than 1000 login attempts per day per IP 
    var bruteforce = new ExpressBrute(store, {
        freeRetries: 1000,
        attachResetToRequest: false,
        refreshTimeoutOnRequest: false,
        minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time) 
        maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time) 
        lifetime: 24 * 60 * 60, // 1 day (seconds not milliseconds) 
        failCallback: failCallback,
        handleStoreError: handleStoreError
    });

    var UserSystem = require('../controllers/user-administration-system');
    var userSystem = new UserSystem(sequelize);
    var CarSystem = require('../controllers/car-administration-system');
    var carSystem = new CarSystem(sequelize);
    var TravelAdministrationSystem = require('../controllers/travel-administration-system');
    var travelAdministrationSystem = new TravelAdministrationSystem(sequelize);
    var PhotoSystem = require('../controllers/profile-photo-administration-system');
    var photoSystem = new PhotoSystem(sequelize);
    var AuthorizationSystem = require('../controllers/authorization-system.js');
    var authorizationSystem = new AuthorizationSystem(sequelize);
    var ReputationSystem = require('../controllers/reputation-system');
    var reputationSystem = new ReputationSystem(sequelize);

    router.route('/').post(bruteforce.prevent, function(req, res) {
        userSystem.register(req.body, function(err, user) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
                return;
            }
            res.json({
                user: user,
                receibed: 'Ok'
            });
        });
    });

    router.route('/user/login').post(bruteforce.prevent,
        userBruteforce.getMiddleware({
            key: function(req, res, next) {
                next(req.body.email);
            }
        }),
        function(req, res) {
            userSystem.validateEmailAndPassword(req.body.email, req.body.password,
                function(err, user) {
                    if (err) {
                        var errorResponse = {
                            receibed: 'Error',
                            error: err.message,
                        };
                        if (err.message == 'Incorrect email')
                            errorResponse.message = {
                                email: 'Incorrect email'
                            };
                        if (err.message == 'Incorrect password')
                            errorResponse.message = {
                                password: 'Incorrect password'
                            };
                        res.status(401).send(errorResponse);
                        return;
                    }
                    var token = authorizationSystem.createTokenFor(user);
                    req.brute.reset(function() {
                        res.send({
                            token: token,
                            user: user,
                            receibed: 'Ok'
                        });
                    });

                });
        });


    router.route('/user/update').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
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

    router.route('/user/changePassword').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.changePassword(req.body.id, req.body.password, req.body.newPassword, function(err) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
                return;
            }
            res.send({
                receibed: 'Ok',
                error: ''
            });
        });
    });

    router.route('/user/sendNewPassword').post(bruteforce.prevent, userBruteforce.prevent, function(req, res) {
        userSystem.sendNewPassword(req.body.email, function(err) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
                return;
            }
            res.send({
                email: req.body.email,
                receibed: 'Ok',
                error: ''
            });
        });
    });

    router.route('/user/phone').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.userIdentifiedBy(req.body.userId, function(foundUser) {
            res.send({
                userId: foundUser.id,
                phone: foundUser.phone
            });
        });
    });

    router.route('/user/profile').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        userSystem.userIdentifiedBy(req.body.userId, function(foundUser) {
            carSystem.carsForUserById(foundUser.id, function(foundCars) {
                photoSystem.profilePhotoForUserById(foundUser.id, function(foundPhoto) {
                    reputationSystem.reputationForUserId(foundUser.id, function(foundReputation) {
                        var fileName = '';
                        if (foundPhoto) {
                            fileName = foundPhoto.fileName;
                        }
                        res.send({
                            id: foundUser.id,
                            name: foundUser.name,
                            lastname: foundUser.lastname,
                            sex: foundUser.sex,
                            ucaid: foundUser.ucaid,
                            phone: foundUser.phone,
                            email: foundUser.email,
                            cars: foundCars,
                            photo: fileName,
                            drivingPoints: foundReputation.drivingPoints,
                            passengerPoints: foundReputation.passengerPoints,
                            complaints: foundReputation.complaints
                        });
                    });
                });
            });
        });
    });

    router.route('/user/cars').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
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

    router.route('/user/cars/car/delete').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        travelAdministrationSystem.unregisterCar(req.body.id, function(err, registeredCar) {
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

    router.route('/user/cars/car/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        carSystem.carsForUserById(req.body.userId, function(cars) {
            res.send(cars);
        });
    });

    router.route('/user/cars/car/update').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
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