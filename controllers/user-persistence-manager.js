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
    sql = "INSERT INTO users( email, password, name, lastname, ucaid, sex) values($1, $2, $3, $4, $5, $6);";
    query = client.query(sql, [user.email, user.password, user.name, user.lastname, user.ucaid, user.sex]);
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
    var sqlQuery = "UPDATE users SET password=$1 WHERE email=$2";
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

    query = client.query("DELETE FROM users WHERE email=($1)", [user.email]);

    query.on('end', function() {
      done();
      callback();
    });
  });
};

UserPersistenceManager.prototype.findOne = function (email , callback){
  
  
  pg.connect(connectionString, function (err, clie, done) {

    if (err) {
      done();
    }
    var results = [];

    var query = clie.query("Select * from users where email =($1);",[email]);

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

module.exports = UserPersistenceManager;