function ContactRouter(sequelize) {
    var express = require('express');
    var router = express.Router();

    var ExpressBrute = require('express-brute');
    var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
    var bruteforce = new ExpressBrute(store, {freeRetries: 1000});

    var ContactAdministrationSystem = require('../controllers/contact-administration-system');
    var contactSystem = new ContactAdministrationSystem(sequelize);
    var AuthorizationSystem = require('../controllers/authorization-system.js');
    var authorizationSystem = new AuthorizationSystem(sequelize);

    router.route('/acquaintances/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        contactSystem.acquaintancesForUserIdentifedBy(req.body.userId, function(acquaintances) {
            res.send(acquaintances);
        });
    });

    router.route('/acquaintances').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        contactSystem.becomeAcquaintance(req.body.id, function(err, acquaintance) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
            } else {
                res.send({
                    car: acquaintance,
                    receibed: 'Ok',
                    error: ''
                });
            }
        });
    });

    router.route('/favorites/find').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        contactSystem.favoritesForUserIdentifedBy(req.body.userId, function(favorites) {
            res.send(favorites);
        });
    });

    router.route('/favorites').post(bruteforce.prevent, authorizationSystem.isAuthenticated, function(req, res) {
        contactSystem.becomeFavorite(req.body.id, function(err, favorite) {
            if (err) {
                res.send({
                    receibed: 'Error',
                    error: err.message
                });
            } else {
                res.send({
                    car: favorite,
                    receibed: 'Ok',
                    error: ''
                });
            }
        });
    });

    return router;
}

module.exports = ContactRouter;