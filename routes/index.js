var express = require('express');
var router = express.Router();

var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production 
var bruteforce = new ExpressBrute(store);

router.get('/',bruteforce.prevent, function(req, res, next) {
  res.render('Hola! Hello!', { title: 'Hola' });
});

module.exports = router;
