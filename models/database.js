//createdb -O carpooling -E UTF8 carpooling
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

var client = new pg.Client(connectionString);
client.connect();
var query1 = client.query(
	'CREATE TABLE users ( id serial primary key, username varchar(20), password varchar(20) ); CREATE TABLE clients ( name varchar(20), id varchar(20), secret varchar(20), userId varchar(20) );');
query1;
console.log('Table users created.');
