# Carpooling Back-end
Back end in node.js for carpooling application

La aplicación de front-end conectada a este back-end permite a los usuarios, compartir parte de su viaje, en el mismo vehículo, si las rutas que deben
realizar son similares.

Instalación:
------------
Se necesita tener instalado:
npm install mocha -g

dentro de la carpeta back-end ejecutar
npm install

Se necesita tener creada la base de datos de carpooling.
Nos logueamos como usuario postgres
sudo su
su postgres

Desde el usuario de postgres ejecutamos:
createdb -O carpooling -E UTF8 carpooling
psql --dbname=carpooling --command='CREATE EXTENSION POSTGIS;'

Referencias
-----------
Se tomaron como referencia estos tutoriales:
* PostgreSQL and NodeJS
	http://mherman.org/blog/2015/02/12/postgresql-and-nodejs/#.V4LjKu1XaMV
* Beer Locker: Building a RESTful API With Node
	http://scottksmith.com/blog/2014/05/02/building-restful-apis-with-node/
* StackOverflow: passport-local with node-jwt-simple
	http://stackoverflow.com/questions/20228572/passport-local-with-node-jwt-simple
* PostgreSQL Manual
	https://www.postgresql.org/files/documentation/pdf/9.6/postgresql-9.6-A4.pdf
* Sequelize Documentation
	http://docs.sequelizejs.com
* An Introduction to Sequelize.Js – Optimism
	https://milinaudara.wordpress.com/2014/05/24/an-introduction-to-sequelize-js/

To do:
------
* Agregar descripción a todos los servicios. (Ver ejemplos en proyecto de soapui)

En la creación de un viaje:
* Administración del tiempo: Se asume que se utiliza la hora local, Buenos Aires GMT-3. Revisar si más adelante es necesario agregar soporte para diferentes zonas horarias.
* Verificar si para trazar la trayectoria de la ruta, alcanza con utilizar overview_polyline o si es necesario utilizar polyline.

* Leer mejor sobre migrations.

## License / Licencia

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
Ver derechos de licencia y limitaciones (MIT) en el archivo: [LICENSE](LICENSE.md).
