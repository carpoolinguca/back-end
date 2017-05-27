var express = require('express');
var router = express.Router();

var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
var bruteforce = new ExpressBrute(store);

router.get('/', function(req, res, next) {
	res.send('Hola!');
});

module.exports = router;