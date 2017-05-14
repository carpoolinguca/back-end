var assert = require('chai').assert;

describe('Build an google maps url', function() {
  var origin = 'Plaza Italia, 1425 CABA';
  var destination = 'Plaza de Mayo, Av. Hipólito Yrigoyen s/n, 1087 CABA'

  describe('Google maps url builder', function() {

    it('Replace white spaces by +', function() {
      var replacedOrigin = origin.replace(/\s/g, "+");
      assert.equal(replacedOrigin,'Plaza+Italia,+1425+CABA');
    });

/*
https://nodejs.org/api/querystring.html

    it('Build url from origin to destination', function(){
      var baseUrl = 'https://www.google.com.ar/maps/dir/';
      var urlBuilt = baseUrl + origin.replace(/\s/g, "+") + '/' + destination.replace(/\s/g, "+");
      assert.equal(urlBuilt,'https://www.google.com.ar/maps/dir/Plaza+Italia,+1425+CABA/Plaza+de+Mayo,+Av.+Hip%C3%B3lito+Yrigoyen+s%2Fn,+1087+CABA/');
    });
*/

  });
});