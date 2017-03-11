dropdb carpooling
createdb -O carpooling -E UTF8 carpooling
psql --dbname=carpooling --command='CREATE EXTENSION POSTGIS;'