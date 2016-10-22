var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

function TravelPersistenceManager() {

}

TravelPersistenceManager.prototype.create = function (travel, callback){
  
  pg.connect(connectionString, function (err, client, done) {

    var query;
    if (err) {
      done();
    }
    var sql;
    sql = "INSERT INTO travels( userid, origin, destination, seats, arrivalDateTime, observations) values($1, $2, $3, $4, $5, $6);";
    query = client.query(sql, [travel.userid, travel.origin, travel.destination, travel.seats, travel.arrivalDateTime, travel.observations]);
    query.on('end', function() {
      done();
      callback();
    });
  });
};

TravelPersistenceManager.prototype.read = function (callback
  ){
  
  pg.connect(connectionString, function (err, client, done) {

    if (err) {
      done();
    }
    var results = [];
    var query = client.query("SELECT * FROM travels;");

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      done();
      callback(results);
    });
  } );
};

TravelPersistenceManager.prototype.update = function(travel,travelUpdate, callback) {

  pg.connect(connectionString, function(err, client, done) {
    var query;
    if (err) {
      done();
    }
    var sqlQuery = "UPDATE travels SET userid=$1, origin=$2, destination=$3, seats=$4, arrivalDateTime=$5, observations=$6 WHERE userid=$7";
    query = client.query(sqlQuery, [travelUpdate.userid, travelUpdate.origin, travelUpdate.destination, travelUpdate.seats, travelUpdate.arrivalDateTime, travelUpdate.observations , travel.userid]);
    query.on('end', function() {
      done();
      callback(travelUpdate);
    });
  });
};

TravelPersistenceManager.prototype.delete = function(travel, callback) {

  pg.connect(connectionString, function(err, client, done) {

    var query;
    if (err) {
      done();
    }

    query = client.query("DELETE FROM travels WHERE userid=($1)", [travel.userid]);

    query.on('end', function() {
      done();
      callback();
    });
  });
};

TravelPersistenceManager.prototype.findOne = function (userid , callback){
  
  pg.connect(connectionString, function (err, clie, done) {

    if (err) {
      done();
    }
    var results = [];

    var query = clie.query("Select * from travels where userid =($1);",[userid]);

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function(result){
      done();
      if (result.rowCount === 0)
        callback(false);
      else
        callback(results[0]);
    });

  } );
  
};

module.exports = TravelPersistenceManager;