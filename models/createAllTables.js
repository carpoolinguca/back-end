//createdb -O carpooling -E UTF8 carpooling
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

var client = new pg.Client(connectionString);
client.connect();
var query1 = client.query(

	'CREATE TABLE users ( id serial primary key, email varchar(30) NOT NULL, password varchar(40) NOT NULL, name varchar(100) NOT NULL, lastname varchar(100) NOT NULL, ucaid char(10), sex char(10) NOT NULL); CREATE TABLE clients ( name varchar(20) NOT NULL, id integer NOT NULL ,secret char(20) NOT NULL , userid integer NOT NULL ); CREATE TABLE codes ( value char(20) NOT NULL , redirectUri varchar(50) NOT NULL , userid integer NOT NULL , client_id integer NOT NULL ); CREATE TABLE tokens ( value char(20) NOT NULL , userid integer NOT NULL , client_id integer NOT NULL ); CREATE TABLE travels ( id serial primary key, userid integer, origin varchar(200), destination varchar(200), seats integer, arrivalDateTime timestamp, observations varchar(200));');
query1;
console.log('All tables created. Press control+c for exit.');
