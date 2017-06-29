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
- El pasajero en la busqueda de quién lo puede llevar, obtiene todos los viajes padres
que aún tienen asientos disponibles. (availableSeats > 0).
- El pasajero solicita al conductor que eligió según el viaje padre, que lo lleve.
(asignationStatus = pending)
- El conductor recibe la solicitud del pasajero y decide aceptar o rechazar pasarlo a
buscar. 
(asignationStatus = acepted) or (asignationStatus = rejected).
- El pasajero puede cancelar la solicitud, cuando esta en estado pendiente o aceptada.
(asignationStatus = canceled).
Una vez que el conductor comienza el viaje, la solicitud no puede cambiar de estado.

* Agregar estado de viaje.

- Una vez que el conductor crea el viaje, este comienza en estado planeado. 
(travelStatus = planed)
- Cuando el conductor comienza el viaje, pasa a en proceso.
(travelStatus = inProgress)
- Cuando el conductor indica que el viaje terminó, pasa a estado finalizado.
(travelStatus = ended)
- Cuando el conductor indica que tiene que cancelar el viaje.
(travelStatus = canceled)

2017-02-18
==========

* Mejora a los estados del viaje:
Los estados de viaje se podrían cambiar automáticamente siguiendo el movimiento del usuario por el gps.
Además se podría notificar a los pasajeros cuando el conductor esta cerca de llegar.

2017-02-19
==========

* Es necesario agregar el estado cancelado al estado del viaje.
El permitir la cancelación conlleva varios puntos a tener en consideración:

- El conductor puede cancelar su viaje en cualquier momento, excepto cuando el viaje terminó.
- La cancelación del viaje por el conductor, conllevará a tener una review de cero puntos, por cada pasajero que había prometido llevar. Se notificará a todos los pasajeros. 
Además se pasarán a estado cancelado los viajes de los pasajeros.
- La cancelación del viaje por el pasajero, conllevará a tener una review de cero puntos, por el conductor. Se notificará al conductor por lo sucedido.



2017-02-20
==========

* ¿Cómo actualizo una instancia desde la base de datos con sequelize?
http://docs.sequelizejs.com/en/v3/docs/instances/#reloading-instances

Reloading instances

If you need to get your instance in sync, you can use the method reload. It will fetch the current data from the database and overwrite the attributes of the model on which the method has been called on.

```js
Person.findOne({ where: { name: 'john' } }).then(function(person) {
  person.name = 'jane'
  console.log(person.name) // 'jane'
 
  person.reload().then(function() {
    console.log(person.name) // 'john'
  })
})
```

2017-02-27
==========

* Para facilitar la comunicación entre los conductores y los pasajeros sería conveniente que se comuniquen utilizando su correspondiente número celular. Por lo tanto es necesario agregar en el registro de usuarios ese campo.
El celular del pasajero sólo debería será visible para el conductor cuando este aceptó su solicitud de pasar a buscar.
De la misma forma, el celular del conductor será visible para el pasajero, cuando el conductor aceptó su solicitud de pasar a buscar.

Tareas:
- Modificar el registro, para que pida también el celular.
- Agregar un servicio de detalle de usuario que muestre toda la información, incluso su teléfono.(?)
- Analizar y crear/modificar el servicio de detalle de viaje para conductor.
- Además actualizar soapui con todos los cambios.

2017-02-28
==========

* Análisis del circuito de viaje a la vista del conductor. Se hace incapié en los servicios que se tienen que invocar al servidor.

- User sing up: POST /users
- User login: POST /users/user/login
- Create a driver travel: POST /travels 
- Travels for user: POST /travels/for/user (REVISAR)
- Reserved suits for parent travel: POST /travels/suits/find(FALTA AGREGAR PASSENGER REPUTATION)
- Reviews for passenger: POST /reviews/for/passenger/find (FALTA AGREGAR NOMBRE Y APELLIDO DE CADA USUARIO QUE HACE EL REVIEW)
- Reviews for driver: POST /reviews/for/driver/find (FALTA AGREGAR NOMBRE Y APELLIDO DE CADA USUARIO QUE HACE EL REVIEW)
- User phone: POST /users/user/phone
- Start travel: POST /travels/travel/start
- End travel: POST /travels/travel/end
- Cancel travel: POST /travels/travel/cancel 

2017-03-03
==========

* Agenda: cada usuario podrá ver en su agenda, a todos los usuarios que por lo menos viajó alguna vez. Se parecería a algo así como los amigos de facebook, solo que la condición de amistad es si alguna vez viajaron juntos. 
En la agenda un usuario podrá ver el detalle de sus contactos, hacerles al menos un review y en caso de ser necesario, denunciarlos.
Se agregará una función de guardar contacto en memoria del teléfono, así este podrá ser accedido desde fuera de la aplicación.
Va a llegar un momento que se establecerá una relación entre los usuarios que a diario utilizan la aplicación y que viajan juntos, por lo tanto ya no la van a necesitar, porque ya van a conocer que coinciden en horarios y destino al lugar donde van. 
Si bien esto va a generar que dejen de usar la aplicación, en el comienzo de cada cuatrimestre, entrarían nuevos usuarios y esto probablemente compense y mantenga la cantidad promedio de usuarios activos de la aplicación.

Implementación:
---------------

Una vez que el conductor confirma que el viaje ha finalizado, los pasajeros se agregarán automáticamente a la agenda del conductor, y  el conductor será agregado automáticamente a la agenda de cada pasajero.

La relación es: userId -> contactId. Y almacena los contactos de cada usuario. De la busqueda de todos los contactos para un usuario, se obtiene la agenda de contactos de ese usuario (address book).

2017-03-09
==========
* Un review por usuario.
* Por cada denuncia se computa como una estrella.

* Url de google maps ejemplo de vaje pasando por tres lugares:

https://www.google.com.ar/maps/dir/Alsina+315,+Quilmes,+Buenos+Aires/Belgrano+280,+Bernal,+Buenos+Aires/-34.6130782,-58.3660879/@-34.6670236,-58.3820252,12z/data=!3m1!4b1!4m15!4m14!1m5!1m1!1s0x95a32e4001fc3619:0x5eaee984df1bb9cb!2m2!1d-58.2576438!2d-34.7212479!1m5!1m1!1s0x95a32e074791d0f1:0x3fd67a62469a4770!2m2!1d-58.2797534!2d-34.712581!1m0!3e0

* Direcciones ejemplo:

Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina

Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina

Almirante Brown 747, CABA

Alicia Moreau de Justo 1500, CABA


2017-03-11
==========

* Estandarizar todos los servicios en los que se envia el campo userId para que este como "userId" y no como "user_id". Listo!

2017-03-12
==========

* Mejorar servicio de busqueda de viajes para que devuelva los datos del usuario, su reputación y su cantidad de denuncias, para cada uno de los viajes encontrados. (Falta filtrar datos que no se requieren enviar).

2017-03-13
==========

* Que el servicio de busqueda de viajes, (travels/find) devuelva el viaje que origina la búsqueda, además de devolver los viajes encontrados. Listo!
* Que el servicio de reserva de viajes, (travels/suits/book) devuelva la reserva creada, incluyendo su id. Listo!

2017-03-24
==========

* En la respuesta de los servicios de Complaints y Reviews se agrega el nombre y apellido del usuario que se necesita mostrar en pantalla.
* En la respuesta del servicio /travels/find/suits se agrega el puntaje del usuario como pasajero y se agrega la cantidad de denuncias que tiene.
* Se modificó el registro de denuncias (complaints) para que incremente el contador de denuncias del usuario denunciado.

2017-03-25
==========

* Agregar en la respuesta de los servicios: reviews/for/passenger/find, reviews/for/driver/find, complaints/find nombre y apellido y cantidad de reviews o denuncias del usuario por el que se consulta.

2017-03-26
==========

* Continuar con el servicio de contactos.


Agregar varios contactos al mismo tiempo, handleando errores:

```js
it('Register contact', function(done) {
    Contact.bulkCreate(contacts).catch(function(errors) {
      console.log(errors);
    }).then(function() {
      Contact.findAll().then(function(createdContacts) {
        console.log(createdContacts);
        contacts = createdContacts;
        done();
      });
    });
  });
```

Para evitar intentar guardar contactos que ya existen usaremos:

```js
var contact = {
        userId: students[0].id,
        contactId: students[1].id
      };

Contact.findCreateFind({
      where: contact,
      defaults: contact
    }).catch(function(errors) {
      console.log(errors);
    }).then(function(result) {
    //instancia:
      console.log(result[0]);
    //si se hizo el insert devuelve true:
      console.log(result[1]);
    });
```

Nota:
Esta función es más performante que findOrCreate porque no usa transacciones, que para este caso no son necesarias.

2017-03-28
==========

Se corrije el script sql que calcula las reservas de usuarios para un sumarse a un viaje.
* Script erróneo:

```sql
select s.id, s."parentTravel", s."childTravel", s.status, t."userId", u.email, u.name, u.lastname, u.sex, t.origin, t.destination, r."passengerPoints", r.complaints from reputation as r inner join seat_assignation as s on (r."userId"= s."childTravel") inner join travel as t on (s."childTravel" = t.id) inner join "user" as u on (t."userId" = u.id) where s."parentTravel" = ' + parentTravelId + '
```

* Script corregido:

```sql
SELECT s.id, s.status, s."parentTravel", s."childTravel", t.origin, t.destination, t."userId", u.name, u.lastname, u.email, r."passengerPoints", r.complaints FROM seat_assignation AS s INNER JOIN travel AS t ON (s."childTravel"=t.id) INNER JOIN "user" AS u ON (t."userId"=u.id) INNER JOIN reputation AS r ON (u.id=r."userId") WHERE s."parentTravel" =  
```
2017-03-30
==========
TO DO:

* Quitar los campos de "isDriver" y "driverId" de los objetos review, y agregar "driverId" al objeto "userReviewed" en la consulta de reviews de conductores (/reviews/for/driver/find).

* Quitar los campos de "isDriver" y "passengerId" de los objetos review, y agregar "passengerId" al objeto "userReviewed" en la consulta de reviews de conductores (/reviews/for/driver/find).

* Separar el servicio de viajes para un usuario en dos servicios diferentes:
- /travels/for/user/passenger
- /travels/for/user/driver

* Actualizar la forma en que se hacen las busquedas de viajes para que no aparezcan los que estan en estado ended. 

*  /reviews/for/passenger podría devolverme algo como "receibed": "Ok" para poder controlar si se guardo bien el review

2017-04-02
==========

* Se quitaron los campos de "isDriver" y "driverId" de los objetos review, y se agregó el "id" al "userReviewed" en la consulta de reviews de conductores (/reviews/for/driver/find).

* Se quitaron los campos de "isDriver" y "passengerId" de los objetos review, y agregó el "id" al "userReviewed" en la consulta de reviews de conductores (/reviews/for/driver/find).

2017-04-05
==========

* Se separa el servicio de viajes para un usuario en dos servicios diferentes:

/travels/for/user/passenger

Consulta:

{
	"userId": 2
}

Respuesta:

[{
   "id": 2,
   "origin": "Avenida Alicia Moreau de Justo 1100, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
   "destination": "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
   "arrivalDateTime": "2016-10-21T17:05:06.000Z",
   "travelStatus": "planed",
   "seatAssignationStatus": "pending",
   "observations": "De la biblio a la facu.",  (las observaciones son las del viaje padre)
   "driverId": 1 (La consulta se me vuelve más complicada si muestro todos los datos del usuario como me pedís. Debería poderse consultar estos datos a partir de otro servicio que todavía no esta implementado jaja. O revisar si lo puedo agregar. Por el momento solo muestra el driverId).
}]

/travels/for/user/driver

Consulta:

{
	"userId": 1
}

Respuesta:

[{
   "id": 1,
   "origin": "Avenida Alicia Moreau de Justo 1000, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
   "destination": "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
   "arrivalDateTime": "2017-02-15T17:05:06.000Z",
   "status": "planed",
   "maximumSeats": 4,
   "availableSeats": 3,
   "observations": "De la biblio a la facu."
}]

2017-04-08
==========

* Se agrega a la consulta /travels/for/user/passenger los campos name, lastname, drivingPoints y complaints.

2017-04-09
==========

* Se cambia la respuestas de review, para que muestren recibido Ok:

POST /reviews/for/driver

{
   "receibed": "Ok",
   "error": "",
   "driverReview":    {
      "id": 68,
      "driverId": 1,
      "points": 5,
      "passengerId": 2,
      "reviewTitle": "Exelente conductor",
      "detailReview": "Fue muy amable conmigo y llegó a la hora que habíamos acordado. Muy crack"
   }
}

POST /reviews/for/passenger

{
   "receibed": "Ok",
   "error": "",
   "passengerReview":    {
      "id": 69,
      "driverId": 1,
      "points": 5,
      "passengerId": 2,
      "reviewTitle": "Exelente acompañante",
      "detailReview": "Muy buena onda."
   }
}

* Agregado de nuevas tareas:

- Agregar servicio de consulta del perfil del usuario:
/users/user/profile

Consulta:

{
	userId: 2
}

Respuesta:

{
	id: 2,
	name: "Quique",
	lastname: "Quien",
	ucaid: "020900847",
	phone: "1148674837",
	email: "quique@gmail.com",
	cars: [
			{
				id: 1,
				model: "Volkswagen Up!",
				color: "Blanco",
				licensePlate: "AG759LH",
				hasAirConditioner: true,
			}
		  ]
}

- Agregar servicio de modificación del perfil del usuario:
/users/user/profile/update

Consulta:

{
	id: 2,
	name: "Quique",
	lastname: "Quien",
	ucaid: "020900847",
	phone: "1148674837",
	email: "quique@gmail.com"
}

Respuesta

{
	receibed: "Ok",
	error: ""
}

- Agregar servicio de agregado de autos:
/users/user/cars/

Consulta:

{
	userid: 2,
	model: "Volkswagen Up!",
	color: "Blanco",
	licensePlate: "AG759LH",
	hasAirConditioner: true,
}

Respuesta:

{
	receibed: "Ok",
	error: ""
}

- Agregar servicio de modificación de auto:
(Sólo se puede cambiar modelo, color y aire acondicionado)
/users/user/cars/car/update

Consulta:

{
	id: 1
	userid: 2,
	model: "Volkswagen Up!",
	color: "Blanco",
	licensePlate: "AG759LH",
	hasAirConditioner: true,
}

Respuesta:

{
	receibed: "Ok",
	error: ""
}

- Agregar servicio de eliminar auto:
/users/user/cars/car/delete

Consulta:

{
	id: 1
}

Respuesta:

{
	receibed: "Ok",
	error: ""
}

(Sólo se debería permitir eliminar, si no se ha realizado ningún viaje con ese auto)

- Agregar servicio para buscar contactos agendados
/contacts/favorites/find

Consulta:

{
	userId: 1
}

Respuesta:

[{
	id: 1
	userId:
	name:
	lastname:
	passengerPoints:
	drivingPoints:
	complaints:
	phone:
},{
	id: 2
	userId:
	name:
	lastname:
	passengerPoints:
	drivingPoints:
	complaints:
	phone:
}]

Ordenados primero por nombre y luego por apellido.

- Agregar un contacto a los favoritos de la agenda:
/contacts/favorites

Envio el id del contacto:
Consulta:
{
	id: 1 
}

Respuesta:
{
	receibed: "Ok",
	error
}

- Eliminar contacto de los favoritos de la agenda:

Envio el id del contacto:
Consulta:
{
	id: 1
}

Respuesta:
{
	receibed: "Ok",
	error
}

- Agregar servicio para buscar contactos no agendados (contactos conocidos)
/contacts/acquaintances/find

Consulta:

{
	userId: 1
}

Respuesta:

[{
	id: 3
	userId:2
	name:
	lastname:
	email:
	phone:
	passengerPoints:
	drivingPoints:
	complaints:
},{
	id: 4
	userId:3
	name:
	lastname:
	email:
	phone:
	passengerPoints:
	drivingPoints:
	complaints:
}]

2017-04-18
==========

* Almacenar contraseñas de forma segura en la base de datos.

http://stackoverflow.com/questions/1054022/best-way-to-store-password-in-database
http://stackoverflow.com/questions/947618/how-to-best-store-user-information-and-user-login-and-password

Don't store passwords. If it's ever sitting on a disk, it can be stolen. Instead, store password hashes. Use the right hashing algorithm, like bcrypt (which includes a salt).

https://security.stackexchange.com/questions/211/how-to-securely-hash-passwords
https://coderwall.com/p/1pn7cg/correct-way-to-store-passwords-in-node-js
https://codahale.com/how-to-safely-store-a-password/


* Implementación de bcrypt en Nodejs:

https://www.npmjs.com/package/bcrypt

Uso:

var bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  // Store hash in your password DB. 
});

// Load hash from your password DB. 
bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
    // res == true 
});
bcrypt.compare(someOtherPlaintextPassword, hash, function(err, res) {
    // res == false 
});

2017-04-19
==========
* Se modifica el almacenamiento y validación de passwords para usar bcrypt.
* Se elimina el servicio que respondía todos los usuarios.

2017-04-22
==========
* En el sistema rutas, se separa el cálculo de la ruta de su persistencia. Gracias a esto, se modifica el sistema de viajes para que cuando busca viajes padres para un hijo, no almacene las rutas del viaje hijo, innecesariamente.
* Se corrije el error invalidante que se producía al no encontrar nínguna ruta posible para ir de un origen a un destino.
* Se mejora la consulta SQL, para que busque en un radio de 500m dentro del destino seleccionado, para poder obtener mejores resultados en la busqueda.

2017-04-23
==========
* Se agregó el servicio de modificación de usuarios:
/users/user/update

Consulta:
{
	"id": 3,
	"email" : "vicky@gmail.com",
	"name" : "Victoria",
	"lastname" : "Collins",
	"ucaid" : "021555331",
	"sex" : "Femenino",
	"phone": "1569867499"
}
Respuesta:
{
   "user":    {
      "id": 3,
      "email": "vicky@gmail.com",
      "name": "Victoria",
      "lastname": "Collins",
      "ucaid": "021555331",
      "sex": "Femenino",
      "phone": "1569867499"
   },
   "receibed": "Ok",
   "error": ""
}

* Se agregó el servicio de cambio de contraseña:
/users/user/changePassword

Consulta:
{
	"id": 3,
	"password": "1234",
	"newPassword": "5678"
}

Respuesta:
{
   "receibed": "Ok",
   "error": ""
}

Respuesta por contraseña incorrecta:
{
   "receibed": "Error",
   "error": "Contraseña incorrecta."
}

Respuesta por usuario no encontrado:
{
   "receibed": "Error",
   "error": "No se encontró el usuario."
}

TODO: expirar todos los tokens, luego de efectuarse el cambio de contraseña.

2017-04-23
==========

* Buenas prácticas de manejo de errores en node.js

https://fernetjs.com/2012/12/manejando-errores/
https://engineering.gosquared.com/node-js-error-handling-callbacks-vs-promises
http://fredkschott.com/post/2014/03/understanding-error-first-callbacks-in-node-js/

https://nodejs.org/dist/latest-v7.x/docs/api/errors.html

Node.js style callbacks
#

Most asynchronous methods exposed by the Node.js core API follow an idiomatic pattern referred to as a "Node.js style callback". With this pattern, a callback function is passed to the method as an argument. When the operation either completes or an error is raised, the callback function is called with the Error object (if any) passed as the first argument. If no error was raised, the first argument will be passed as null.

```js
const fs = require('fs');

function nodeStyleCallback(err, data) {
  if (err) {
    console.error('There was an error', err);
    return;
  }
  console.log(data);
}

fs.readFile('/some/file/that/does-not-exist', nodeStyleCallback);
fs.readFile('/some/file/that/does-exist', nodeStyleCallback);

```

2017-04-25
==========
* Se agregan el servicio de consulta de perfil de usuario y el servicio de creación de auto.

2017-04-29
==========
* Se agregan el servicio eliminación y modificación de auto.

2017-04-30
==========
* Se agrega la información del auto, en los servicios:
- Creación de viaje
- Busqueda de viaje
- Consulta de viajes como pasajero
- Consulta de viajes como conductor
* Se agrega en el login, que se devuelva al usuario incluyendo todos los autos que tiene registrados.
* Se agrega el servicio de modificación de auto para el viaje como conductor.

2017-05-01
==========
* ¿Cómo hago para evaluar un callback cuando todos los callbacks dentro de un foreach fueron ejecutados?

https://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed/18983245

Array.forEach does not provide this nicety (oh if it would) but there are several ways to accomplish what you want:

Using a simple counter

```js
function callback () { console.log('all done'); }

var itemsProcessed = 0;

[1, 2, 3].forEach((item, index, array) => {
  asyncFunction(item, () => {
    itemsProcessed++;
    if(itemsProcessed === array.length) {
      callback();
    }
  });
});
```
TODO: Estudiar ES6 y sobre todo como define promisses.

* Cómo se modifica el timeout de un test:
this.timeout(15000);

2017-05-03
==========
¿Cómo hacer para subir archivos a traves de node.js?

To upload images using Node.js and Express, I've enlisted the help of the Formidable module. So lets get started in creating our image upload application using Node.js, Express, Formidable and Quickthumb. 

https://tonyspiro.com/uploading-resizing-images-fly-node-js-express/

2017-05-06
==========

* Se agregaron handleos de errores de comunicación con el servidor de google directions.
- Durante la creación de viajes y sus rutas.
- Durante la busqueda de viajes y sus rutas.
* Se modificaron todas las raw queries para bindeen los parametros o utilicen replacements.

2017-05-09
==========

* Se agrega al servicio userProfile su reputación y sus denuncias.
* Se agrega servicio de consulta de autos por id de usuario.

2017-05-14
==========
¿Cómo remplazo los espacios en blanco por otro caracter?
http://stackoverflow.com/questions/6507056/replace-all-whitespace-characters

You want \s

    Matches a single white space character, including space, tab, form feed, line feed.

Equivalent to

[ \f\n\r\t\v​\u00A0\u1680​\u180e\u2000​\u2001\u2002​\u2003\u2004​\u2005\u2006​\u2007\u2008​\u2009\u200a​\u2028\u2029​\u2028\u2029​\u202f\u205f​\u3000]

in Firefox and [ \f\n\r\t\v] in IE.

str = str.replace(/\s/g, "X");

2017-05-14
==========

Para prevenir ataques por fuerza bruta, se agrega el módulo express-brute. En la configuración por default solo permite hacer 2 request sin tener que esperar. 
Por lo que se configura el módulo para que no sea tan restrictivo y permita el uso común de la apliación sin problemas.

2017-05-23
==========
Hacer busqueda de viajes, con opción de buscar por fecha, y con opción de buscar por hora.
Si recibo nil en la fecha, no tengo en cuenta la fecha. Si recibo fecha busco por fecha y ordeno el resultado por la hora.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
https://www.postgresql.org/docs/9.2/static/functions-datetime.html 

2017-05-25
==========
* Se modifica el servicio de reserva de asiento, para que devuelva el viaje como pasajero con la fecha y hora del viaje del conductor.

En el servicio:
/travels/suits/book

Consulta:
{
    "parentTravel" : 18,
    "childTravel" : 19
}

Respuesta:
{
   "assignationCreated":    {
      "id": 6,
      "parentTravel": 18,
      "childTravel": 19,
      "status": "pending",
      "updatedAt": "2017-05-25T20:28:43.583Z",
      "createdAt": "2017-05-25T20:28:43.583Z"
   },
   "booked": true,
   "travel":    {
      "id": 19,
      "userId": 2,
      "origin": "Avenida Alicia Moreau de Justo 1100, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
      "destination": "Avenida Alicia Moreau de Justo 1500, Ciudad Autónoma de Buenos Aires, Buenos Aires, Argentina",
      "userIsDriver": false,
      "maximumSeats": 0,
      "availableSeats": 0,
      "carId": null,
      "arrivalDateTime": "2017-05-25T18:05:06.000Z",
      "observations": "De la biblio a la facu.",
      "status": "planed",
      "createdAt": "2017-05-25T20:25:50.334Z",
      "updatedAt": "2017-05-25T20:28:43.622Z"
   },
   "error": ""
}

* Envio de emails

Utilizaremos el modulo nodemailer:
https://nodemailer.com/about/

2017-05-27
==========
Se agrega sistema para envio de emails utilizando nodemailer y sparkpost.


2017-05-30
==========

¿Cómo filtro por los que se crearon en las últimas 24hs?
http://docs.sequelizejs.com/manual/tutorial/querying.html

{
  createdAt: {
    $lt: new Date(),
    $gt: new Date(new Date() - 24 * 60 * 60 * 1000)
  }
}
// createdAt < [timestamp] AND createdAt > [timestamp]

2017-06-02
==========

Se modifica la busqueda de viajes para que filtre también por viajes planeados.

2017-06-25
==========
Información estadística sobre la actividad del usuario: cantidad de viajes, distancia recorrida, pasajeros transportados, reducción de huella de carbono. Distinguiendo viajes como conductor y como pasajero. Y luego mostrando un totalizadores de ambos

Agregar a la información de perfil?
Totalizadores de los siguientes datos:

- Cantidad de viajes como conductor
- Cantidad de viajes como pasajero
- Cantidad de viajes totales
- Distancia recorrida como conductor
- Distancia recorrida como pasajero
- Distancia total
- Cantidad de pasajeros transportados
- Huella de carbono producida como conductor
- Ahorro de huella de carbono como pasajero
- Ahorro de huella de carbono como conductor

Para esto sería conveniente hacer el cálculo para cada viaje en particular, y luego sumarlo.

Estadisticas de viaje como conductor: driverTravelStatistics
{
	id: 1,
	travelId: 14,
	distance: 10.23,
	passengers: 3,
	carbonFootprint: 2.45,
	sabedCarbonFootprint: 1.45
}

Estadisticas de viaje como pasajero: passengerTravelStatistics
{
	id: 11,
	travelId: 15,
	distance: 9.12,
	sabedCarbonFootprint: 1.30
}

Estadisticas de usuario: userStatistics
{
	id: 2,
	userId: 14,
	passengerTravels: 20,
	driverTravels: 50,
	totalTravels: 70,
	distanceAsPassenger: 200,
	distanceAsDriver: 500,
	totalDistance: 700,
	passengersTransported: 100,
	driverCarbonFootprint: 222.20,
	driverSavedCarbonFootprint: 444.40,
	passengerSavedCarbonFootprint: 111.12,
	totalSavedCarbonFootprint: 555.52
}
