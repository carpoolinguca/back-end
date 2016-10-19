//createdb -O carpooling -E UTF8 carpooling
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

var client = new pg.Client(connectionString);
client.connect();
var query1 = client.query(
	'CREATE TABLE users ( id serial primary key, email varchar(30) NOT NULL, varchar char(40) NOT NULL, name varchar(100) NOT NULL, lastname varchar(100) NOT NULL, ucaid char(10), sex char(10) NOT NULL); CREATE TABLE clients ( name varchar(30), id char(30), secret char(30), userId char(30) );');
query1;
console.log('Table users created.');



/user/register?name={name}&lastname={lastname}&email={email}&password={password}&ucaid={ucaid}&sex={sexo}