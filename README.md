OOPS

# Environment installation [Debian]

  # Install Node 

sudo apt-get install python g++ make checkinstall
mkdir ~/src && cd $_	
wget -N http://nodejs.org/dist/node-latest.tar.gz
tar xzvf node-latest.tar.gz && cd node-v* #(remove the "v" in front of the version number in the dialog)
./configure
checkinstall 
sudo dpkg -i node_*


  # Install Postgresql + PostGis

sudo apt-get install postgresql libxml2-dev libgeos-3.3.3 libgeos-c1 libproj0 proj-data libgeos-dev libproj-dev libgdal-dev    
wget http://download.osgeo.org/postgis/source/postgis-2.1.1.tar.gz # Check latest version on http://postgis.net/source
tar xzvf postgis-2.1.1.tar.gz && cd postgis-2.1.1
./configure
make
cd extensions
cd postgis
make clean
make 
make install
cd ..
cd postgis_topology
make clean
make 
make install


     # Install NPM + GRUNT

curl https://npmjs.org/install.sh | sudo sh
sudo npm install -g grunt grunt-cli


     # Get Latest sources for OOPS

git clone https://github.com/lebib/oops 
cd oops
git checkout 


# OOPS installation

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
- Create & Inject racketmachine
  	[postgres@biatch oops]$ psql oops -f resources/sql/racketmachines.sql

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
  	 [postgres@biatch oops]$ psql oops -f resources/sql/fake_prunes.sql

- Install node dependencies 
  	 [user@biatch oops]$ npm install
  	  
- Configure da project :
  	 [user@biatch oops]$ cp config/config.json.dist  config/config.json
	 [user@biatch oops]$ vim config/config.json # Edit the file to suite your configuration



# Launch the application : 
  	 [user@biatch oops]$ grunt



====
oops
====

Projet OOPS!
