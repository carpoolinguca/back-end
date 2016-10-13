var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

function CodePersistenceManager() {

}

CodePersistenceManager.prototype.create = function (code, callback){
  
  pg.connect(connectionString, function (err, client, done) {

    var query;
    if (err) {
      done();
    }
    var sql;
    sql = "INSERT INTO codes( value, redirectUri, userId , clientId) values($1, $2, $3, $4);";
    query = client.query(sql, [code.value, code.id, code.secret, code.userId]);
    query.on('end', function() {
      done();
      callback();
    });
  });
};

CodePersistenceManager.prototype.read = function (callback){
  
  pg.connect(connectionString, function (err, client, done) {

    if (err) {
      done();
    }
    var results = [];
    var query = client.query("SELECT * FROM codes;");

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      done();
      callback(results);
    });
  } );
};



CodePersistenceManager.prototype.delete = function(code, callback) {

  pg.connect(connectionString, function(err, client, done) {

    var query;
    if (err) {
      done();
    }

    query = client.query("DELETE FROM codes WHERE value=$1", [code.name]);

    query.on('end', function() {
      done();
      callback();
    });
  });
};

CodePersistenceManager.prototype.findByUserId = function (userId , callback){
  
  
  pg.connect(connectionString, function (err, clie, done) {

    if (err) {
      done();
    }
    var results = [];

    var query = clie.query("Select * from codes where userid =($1);",[userId]);

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function(result){
      done();
      if (result.rowCount === 0)
        callback(false);
      else
        callback(results);
    });

  } );
  
};

CodePersistenceManager.prototype.findOneById = function (id , callback){
  
  
  pg.connect(connectionString, function (err, clie, done) {

    if (err) {
      done();
    }
    var results = [];

    var query = clie.query("Select * from codes where id =($1);",[id]);

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
module.exports = CodePersistenceManager;