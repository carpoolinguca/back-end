var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

function UserPersistenceManager() {

}

UserPersistenceManager.prototype.create = function (user, callback){
  
  pg.connect(connectionString, function (err, client, done) {

    var query;
    if (err) {
      done();
    }
    var sql;
    sql = "INSERT INTO users( username, password) values($1, $2);";
    query = client.query(sql, [user.username, user.password]);
    query.on('end', function() {
      done();
      callback();
    });
  });
};

UserPersistenceManager.prototype.read = function (callback){
  
  pg.connect(connectionString, function (err, client, done) {

    if (err) {
      done();
    }
    var results = [];
    var query = client.query("SELECT * FROM users;");

    query.on('row', function(row) {
      results.push(row);
    });

    query.on('end', function() {
      done();
      callback(results);
    });
  } );
};

UserPersistenceManager.prototype.update = function(user,updateUser, callback) {

  pg.connect(connectionString, function(err, client, done) {
    var query;
    if (err) {
      done();
    }
    var sqlQuery = "UPDATE users SET password=$1 WHERE username=$2";
    query = client.query(sqlQuery, [updateUser.password , updateUser.username]);
    query.on('end', function() {
      done();
      callback(updateUser);
    });
  });
};

UserPersistenceManager.prototype.delete = function(user, callback) {

  pg.connect(connectionString, function(err, client, done) {

    var query;
    if (err) {
      done();
    }

    query = client.query("DELETE FROM users WHERE username=($1)", [user.username]);

    query.on('end', function() {
      done();
      callback();
    });
  });
};


module.exports = UserPersistenceManager;