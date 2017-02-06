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

2016-12-09
==========

* Caso de prueba:
Viaje de usuario con auto:
Alsina 200, Quilmes, Buenos Aires
Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina

Viaje de usuario sin auto:
9 de Julio 5, Bernal, Buenos Aires
Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina

Viaje de usuario con auto:
Brasil 10, B1868CAA Gerli, Buenos Aires
Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina


* ¿Cuales son los parámetros de ST_DWithin?

http://postgis.net/stuff/postgis-2.3.pdf

8.9.32
298 / 785
ST_DWithin
ST_DWithin — Returns true if the geometries are within the specified distance of one another. For geometry units are in those
of spatial reference and For geography units are in meters and measurement is defaulted to use_spheroid=true (measure around
spheroid), for faster check, use_spheroid=false to measure along sphere.
Synopsis
boolean ST_DWithin(geometry g1, geometry g2, double precision distance_of_srid);
boolean ST_DWithin(geography gg1, geography gg2, double precision distance_meters);
boolean ST_DWithin(geography gg1, geography gg2, double precision distance_meters, boolean use_spheroid);
Description
Returns true if the geometries are within the specified distance of one another.
For Geometries: The distance is specified in units defined by the spatial reference system of the geometries. For this function to
make sense, the source geometries must both be of the same coordinate projection, having the same SRID.
For geography units are in meters and measurement is defaulted to use_spheroid=true, for faster check, use_spheroid=false to
measure along sphere.

2016-12-18
==========

* Viaje padre y viaje hijo:

Para que sea más fácil la comprensión, se define viaje padre, al viaje que tiene que realizar el usuario en su propio auto.
Y se define viaje hijo, a los viajes que realizan los usuarios que no van en su propio auto.

* Asignación de asientos:

En primera instancia, se modela la asignación directa de asientos. En segunda instancia, debería tomarse en cuenta que la solicitud de pasar a buscar tendría que ser aceptada por la persona que maneja.

Para asignar un asiento, se valida que el viaje padre tenga asientos disponibles, se decrementa la cantidad de asientos disponibles y se realiza la asignación del asiento, relacionando el viaje padre con el viaje hijo, en la tabla.


```js
TravelAdministrationSystem.prototype.asignSeatWith = function(parentTravelId, childTravelId, callback) {
	Travel.findById(parentTravelId).then(function(parentTravel) {
		console.log(parentTravel.dataValues);
		if (parentTravel.seats > 0) {
			parentTravel.decrement('seats');
			SeatAsignation.create({
				parentTravel: parentTravelId,
				childTravel: childTravelId
			}).then(function(asignationCreated) {
				callback(true);
			});
		} else {
			callback(false);
		}
	});
};
```
Se consultó el manual de Sequelize:
* ¿Cómo encontrar un elemento por id?
sequelize/docs/docs/models-usage.md
* ¿Cómo decrementar un determinado valor de una instancia?
sequelize/docs/docs/instances.md#7


2016-12-18
==========

* Al usuario que maneja le gustaría saber a quienes va a llevar y por donde los tiene que pasar a buscar.

```js
TravelAdministrationSystem.prototype.seatsForParentTravel = function(parentTravelId, callback) {
	var queryString = 'select t.id, t."userId", u.email, u.name, u.lastname, u.sex, t.origin, t.arrival_date_time from "user" as u inner join travel as t on (u.id = t."userId") where t.id in (select "childTravel" from seat_asignation where "parentTravel" = ' + parentTravelId + ');';
	Sequelize.query(queryString).then(function(results) {
		callback(results[0]);
	});
};
```

2016-12-28
==========

* Caso de uso: Reportar a un usuario.
Un usuario solo puede reportar a otro usuario sólo si viajaron juntos.
Se podría agregar el concepto de agenda de usuario, en donde se podrían encontrar a todos los usuarios con los que viajó ese usuario.

Ejemplo de JSON enviado en el request:
{
	reportedUser : 105,
	fromUser : 104,
	why : "Durante el viaje me faltó el respeto."
}

A definir: que se hace luego de que un usuario es reportado? 
Es necesario tomar medidas, en casos de gravedad.

* Caso de uso: Asignar puntaje al usuario por el viaje realizado, esto es tanto para el pasajero como para el conductor.

2016-12-30
==========

* Creación de un sistema de administración de usuarios.
El usuario comienza con cero estrellas de reputación, la reputación del usuario se irá actualizando a medida que vaya realizando viajes.

* Creación de un sistema de reviews 

Toda la lógica de que calcula la reputación del usuario estará contenida en el sistema de cálculo de reputación.
Hay que tener en cuenta la puntuación como conductor y la puntuación como acompañante.
Un usuario puede tener una muy buena puntuación como acompañante, pero una muy mala como conductor, por eso, es que es necesario calcular dos reputaciones, una como conductor y una como acompañante.

El review podría o no estar ligada a un viaje específico. Por simplicidad vamos a tenerla de forma independiente al viaje.

Desde el punto de vista de la implementación el sistema de reputación administrará las siguientes tablas:

reputation
----------
id 					SEQUENTIAL INTEGER KEY
user_id 			INTEGER FOREIGN KEY
driving_points 		FLOAT
passenger_points	FLOAT

reviews
-------
id 				SECUENTIAL INTEGER KEY
is_driver		CHAR
driver_id		INTEGER
points 			INTEGER
passenger_id	INTEGER
review 			STRING
detail_review	STRING

complaints
----------
user_from	INTEGER
user_to		INTEGER
reason 		STRING


2017-01-15
==========
En stackoverflow.com
Call one prototype method inside another in javascript:
```js
Ob.prototype.add = function(){
	this.inc();
}

Ob.prototype.inc = function(){
	console.log('Inc called');
}
```


stackoverflow.com/questions/9263694/this-function-is-not-a-function-but-function-exists

La solución es:
var self = this;
y usar self en vez de this.


2017-02-05
==========

* Asignación de asientos

Cuando el conductor crea el viaje padre, define cuantos asientos disponibles tiene.
Es decir el número máximo de pasajeros que puede transportar. (maximumSeats > 0)
Por defecto tiene que ser un número mayor a cero.
El pasajero en la busqueda de quién lo puede llevar, obtiene todos los viajes padres
que aún tienen asientos disponibles. (availableSeats > 0).
El pasajero solicita al conductor que eligió según el viaje padre, que lo lleve.
(asignationStatus = pending)
El conductor recibe la solicitud del pasajero y decide aceptar o rechazar pasarlo a
buscar. (asignationStatus = acepted) or (asignationStatus = rejected).
El pasajero puede cancelar la solicitud, cuando esta en estado pendiente o aceptada.
(asignationStatus = canceled).
Una vez que el conductor comienza el viaje, la solicitud no puede cambiar de estado.

* Agregar estado de viaje.

Una vez que el conductor crea el viaje, este comienza en estado planeado. 
(travelStatus = planed)
Cuando el conductor comienza el viaje, pasa a en proceso.
(travelStatus = inProgress)
Cuando el conductor indica que el viaje terminó, pasa a estado finalizado.
(travelStatus = ended)
