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
su postgres

Desde el usuario de postgres ejecutamos:
createdb -O carpooling -E UTF8 carpooling

API REST
--------
Se utiliza Basic Authentication utilizando usuario y contraseña previamente cargado mediante el POST de usuario.

GET todos los usuarios: 
http://localhost:3000/users

POST un usuario: 
curl --data "username=Fangio&password=1111" http://localhost:3000/users

Referencias
-----------
Se tomaron como referencia estos tutoriales:
* PostgreSQL and NodeJS
	http://mherman.org/blog/2015/02/12/postgresql-and-nodejs/#.V4LjKu1XaMV
* Beer Locker: Building a RESTful API With Node
	http://scottksmith.com/blog/2014/05/02/building-restful-apis-with-node/

To do:
------
Revisar creación de tablas.
Guardar datos sensibles hasheados.
Agregar OAuth2.
Agregar servicios faltantes.
