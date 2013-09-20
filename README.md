OOPS

# INSTALL

Install described for Debian, too lazy so update for your distro.

/!\ Do each next lines as usr postgres /!\

- Create postgres database

[postgres@biatch ~]$ createdb oops

- Inject postgis datas into the database

  * With postgis 2.0
	[postgres@biatch ~]$ psql -d oops -c "CREATE EXTENSION postgis;"

- CWD inside the OOPS project and inject Montpellier opendata:
	[postgres@biatch BIB]$ psql oops -f resources/sql/opendata_MTP.sql

- Create role:
[postgres@biatch BIB]$  psql -c "CREATE USER oops WITH PASSWORD 'pouet';"

- Change database owner
[postgres@biatch BIB]$  psql -c "ALTER DATABASE oops OWNER TO oops;"

- Change tables owner
[postgres@biatch BIB]$  psql  oops -c "ALTER Table opennodata OWNER TO oops;"
[postgres@biatch BIB]$  psql  oops -c "ALTER Table spatial_ref_sys OWNER TO oops;"
