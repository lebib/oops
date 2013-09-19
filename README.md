OOPS

# INSTALL

Install described for Debian, too lazy so update for your distro.

- Create postgres database as user postgres

[postgres@biatch ~]$ createdb oops

- Inject postgis datas into the database
  * With postgis 2.0
	[postgres@biatch ~]$ psql -d oops -c "CREATE EXTENSION postgis;"

- CWD inside the OOPS project and inject Montpellier opendata:
	[postgres@biatch BIB]$ psql oops -f resources/sql/opendata_MTP.sql
	