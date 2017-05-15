var assert = require('chai').assert;
var querystring = require('querystring');

describe('Build an google maps url', function() {
  
  var origin = 'Plaza Italia, 1425 CABA';
  var destination = 'Plaza de Mayo, Av. Hipólito Yrigoyen s/n, 1087 CABA'
  var array = [origin, destination];

  describe('Google maps url builder', function() {

    it('Replace white spaces by +', function() {
      var replacedOrigin = origin.replace(/\s/g, "+");
      assert.equal(replacedOrigin,'Plaza+Italia,+1425+CABA');
    });

    it('Build url from origin to destination', function(){
      var baseUrl = 'https://www.google.com.ar/maps/dir/';
      var urlBuilt = baseUrl + encodeURIComponent(origin) + '/' + encodeURIComponent(destination);
      assert.equal(urlBuilt,'https://www.google.com.ar/maps/dir/Plaza%20Italia%2C%201425%20CABA/Plaza%20de%20Mayo%2C%20Av.%20Hip%C3%B3lito%20Yrigoyen%20s%2Fn%2C%201087%20CABA');
    });


  });
});