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
