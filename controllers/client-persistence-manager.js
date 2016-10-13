var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

function ClientPersistenceManager() {

}

ClientPersistenceManager.prototype.create = function (modelClient, callback){
  
  pg.connect(connectionString, function (err, client, done) {

    var query;
    if (err) {
      done();
    }
    var sql;
    sql = "INSERT INTO clients( name, id, secret , userId) values($1, $2, $3, $4);";
    query = client.query(sql, [modelClient.name, modelClient.id, modelClient.secret, modelClient.userId]);
    query.on('end', function() {
      done();
      callback();
    });
  });
};

ClientPersistenceManager.prototype.read = function (callback){
  
  pg.connect(connectionString, function (err, client, done) {

    if (err) {
      done();
    }
    var results = [];
    var query = client.query("SELECT * FROM clients;");

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      done();
      callback(results);
    });
  } );
};

ClientPersistenceManager.prototype.update = function(client,updateClient, callback) {

  pg.connect(connectionString, function(err, client, done) {
    var query;
    if (err) {
      done();
    }
    var sqlQuery = "UPDATE clients SET id=$1, secret=$2 , userId=$3 WHERE name=$4";
    query = client.query(sqlQuery, [ updateClient.id, updateClient.secret, updateClient.userId, updateClient.name ]);
    query.on('end', function() {
      done();
      callback(updateClient);
    });
  });
};

ClientPersistenceManager.prototype.delete = function(clientForDelete, callback) {

  pg.connect(connectionString, function(err, client, done) {

    var query;
    if (err) {
      done();
    }

    query = client.query("DELETE FROM clients WHERE name=$1", [clientForDelete.name]);

    query.on('end', function() {
      done();
      callback();
    });
  });
};

ClientPersistenceManager.prototype.findByUserId = function (userId , callback){
  
  
  pg.connect(connectionString, function (err, clie, done) {

    if (err) {
      done();
    }
    var results = [];

    var query = clie.query("Select * from clients where userid =($1);",[userId]);

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

ClientPersistenceManager.prototype.findOneById = function (id , callback){
  
  
  pg.connect(connectionString, function (err, clie, done) {

    if (err) {
      done();
    }
    var results = [];

    var query = clie.query("Select * from clients where id =($1);",[id]);

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
module.exports = ClientPersistenceManager;