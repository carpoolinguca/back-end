//createdb -O carpooling -E UTF8 carpooling
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://carpooling:carpooling@localhost:5432/carpooling';

var client = new pg.Client(connectionString);
client.connect();
var query1 = client.query(

	'DROP TABLE users; DROP TABLE clients; DROP TABLE codes; DROP TABLE tokens; DROP TABLE travels;');
query1;
console.log('All tables dropped. Press control+c for exit.');
