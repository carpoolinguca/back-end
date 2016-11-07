* How do I list all databases and tables using psql?

    \list or \l: list all databases
    \dt: list all tables in the current database

To switch databases:

\connect database_name

* How to prit an object:

	JSON.stringify(object);

2016-10-21
==========
* ¿Como manejo el dateTime del horario de viaje?
- Uso el paquete node-datetime
https://www.npmjs.com/package/node-datetime

* ¿Y cómo lo guardo en la base de datos?
- Reviso la documentación de postgresql.
Valid input for the time stamp types consists of a concatenation of a date and a time, followed by an optional time zone, followed by an optional AD or BC. (Alternatively, AD/BC can appear before the time zone, but this is not the preferred ordering.) Thus

1999-01-08 04:05:06

and

1999-01-08 04:05:06 -8:00

are valid values, which follow the ISO 8601 standard.

https://www.postgresql.org/docs/8.2/static/datatype-datetime.html

* ¿PostgreSQL es case sensitive en los nombres de las columnas?
Si son case sensitive si se ponen los nombres entre comillas dobles.
Si no se usan comillas dobles, se traduce a minúsculas.


All identifiers (including column names) that are not double-quoted are folded to lower case in PostgreSQL. Column names that were created with double-quotes and thereby retained upper-case letters (and/or other syntax violations) have to be double-quoted for the rest of their life. So, yes, PostgreSQL column names are case-sensitive:

SELECT * FROM persons WHERE "first_Name" = 'xyz';

Also fix the incorrect double-quotes around 'xyz'. Values (string literals) are enclosed in single quotes.

Read the manual here.

My standing advice is to use legal, lower-case names exclusively so double-quoting is not needed.

http://stackoverflow.com/questions/20878932/are-postgresql-column-names-case-sensitive
https://www.postgresql.org/docs/current/static/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS 

2016-10-30
==========
* ¿Cómo pasar variables entre diferentes módulos?

http://stackoverflow.com/questions/10306185/nodejs-best-way-to-pass-common-variables-into-separate-modules

Nodejs. Best way to pass common variables into separate modules

I have found using dependency injection, to pass things in, to be the best style. It would indeed look something like you have:

// App.js
module.exports = function App() {
};

// Database.js
module.exports = function Database(configuration) {
};

// Routes.js
module.exports = function Routes(app, database) {
};

// server.js: composition root
var App = require("./App");
var Database = require("./Database");
var Routes = require("./Routes");
var dbConfig = require("./dbconfig.json");

var app = new App();
var database = new Database(dbConfig);
var routes = new Routes(app, database);

// Use routes.
This has a number of benefits:

It forces you to separate your system into components with clear dependencies, instead of hiding the dependencies somewhere in the middle of the file where they call require("databaseSingleton") or worse, global.database.
It makes unit testing very easy: if I want to test Routes in isolation, I can inject it with fake app and database params and test only the Routes code itself.
It puts all your object-graph wiring together in a single place, namely the composition root (which in this case is server.js, the app entry point). This gives you a single place to look to see how everything fits together in the system.
One of the better explanations for this that I've seen is an interview with Mark Seeman, author of the excellent book Dependency Injection in .NET. It applies just as much to JavaScript, and especially to Node.js: require is often used as a classic service locator, instead of just a module system.

2016-11-06
==========
* ¿Qué hace ST_GeomFromGeoJSON?
http://www.postgis.org/docs/ST_GeomFromGeoJSON.html

ST_GeomFromGeoJSON — Takes as input a geojson representation of a geometry and outputs a PostGIS geometry object

-- a 3D linestring
SELECT ST_AsText(ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[1,2,3],[4,5,6],[7,8,9]]}')) As wkt;

wkt
-------------------
LINESTRING(1 2,4 5,7 8)