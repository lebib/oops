var Knex = require('knex');

var knex;

exports.init = function(config, cb) {

    knex = Knex.initialize({
        client: config.database.protocol,
        connection: {
            host: config.database.host,
            user: config.database.user,
            password: config.database.user.password,
            database: config.database.database,
            charset: config.database.charset
        }
    });
    cb();
};

exports.checkPlace = function(lat, lon, cb) {
    getNearRoad(lat, lon, function(result) {
        cb(result);
    })
}

exports.addPrune = function(lat, lon) {
    console.log(lat + " -- " + lon);
}

var getNearRoad = function(lat, lon, cb) {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    knex("opennodata").select(knex.raw("gid, tarifs2011 as tarif, ST_AsGeoJson(ST_Transform(geom, 4326)) as geojson")).orderBy(knex.raw("ST_Transform(ST_SetSRID(ST_MakePoint("+lon+", "+lat+"), 4326), 2154) <-> geom")).limit(8).then(function(result) {
        cb(result);
    }, function(err) {
        console.log("SQL Error: "+err);
    });
}
