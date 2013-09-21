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
	[postgres@biatch oops]$ psql oops -f resources/sql/opendata_MTP.sql

- Create oops table
	[postgres@biatch oops]$ psql oops -f resources/sql/oops.sql


- Create role:
[postgres@biatch oops]$  psql -c "CREATE USER oops WITH PASSWORD 'pouet';"

- Change database owner
[postgres@biatch oops]$  psql -c "ALTER DATABASE oops OWNER TO oops;"

- Change tables owner
[postgres@biatch oops]$  psql  oops -c "ALTER Table opennodata OWNER TO oops;"
[postgres@biatch oops]$  psql  oops -c "ALTER Table spatial_ref_sys OWNER TO oops;"
[postgres@biatch oops]$  psql  oops -c "ALTER Table prunes OWNER TO oops;"
[postgres@biatch oops]$  psql  oops -c "ALTER Table racketmachines OWNER TO oops;"

- Inject fake prunes
[postgres@biatch oops] psql oops -f resources/sql/fake_prunes.sql

- Inject racketmachine
[postgres@biatch oops] psql oops -f resources/sql/racketmachines.sql