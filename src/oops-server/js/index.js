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
    getNearRoad(lat, lon, 8, function(result) {
        if (!result) {
            cb("No road found found");
        } else {
            getPrunes(result, function(err, prunes) {
                if (err) {
                    console.log(err);
                }
                cb(prunes);
            }, 0)
        }
    })
}

exports.addPrune = addPrune = function(lat, lon, date, comment, cb) {
    getNearRoad(lat, lon, 1, function(result) {
        addPruneForRoad(result.gid, data, comment, cb);
    })
}

exports.getPrunes = getPrunes = function(arr, cb, i, ret) {
    var ret = ret || [];
    var recursive = false;
    var gid = null;
    var geojson = null;
    if (typeof(arr) == 'string') {
        gid = arr.gid;
        geojson = arr.geojson;
        tarif = arr.tarif;
    } else {
        gid = arr[i].gid;
        geojson = arr[i].geojson;
        tarif = arr[i].tarif;
        recursive = true;
    }
    knex("prunes")
        .select(['pid', 'prune_date', 'comment'])
        .where({
            gid: gid
        })
        .then(function(prunes) {
            if ((i || i === 0) && recursive) {
                ret[i] = {};
                ret[i].geojson = geojson;
                ret[i].prunes = prunes;
                ret[i].tarif = tarif;
                i++;
                if (i < arr.length) {
                    getPrunes(arr, cb, i, ret);
                } else {
                    cb(null, ret)
                }
            } else {
                ret['geojson'] = geojson;
                ret['prunes'].push(prunes);
            }
        }, function(err) {
            cb(err);
        })
}


exports.addPruneForRoad = addPruneForRoad = function(roadGid, date, comment, cb) {
    if (!roadGid) {
        cb("Road gid cannot be null");
    }
    comment = comment || '';
    date = date || 'now()';
    knex("prunes")
        .insert({
            gid: roadGid,
            prune_date: date,
            comment: comment
        })
        .then(function() {

        }, function(err) {
            cb(err);
        })
}

exports.injectFakeDatas = function() {
    // Get all Roads
    console.log("Import fake datas");
    knex("opennodata")
        .select('gid')
        .then(function(result) {
            result.forEach(function(res) {
                var num = Math.floor((Math.random() * 10) + 1);
                for (var i = 0; i < num; i++) {
                    addPruneForRoad(res.gid, "2012-09-" + num, '', function(err) {
                        if (err) {
                            console.log("Error creating Prune: " + err);
                        }
                    });
                }
            });
        }, function(err) {
            console.log("SQL Error: " + err);
        });
}

var getNearRoad = function(lat, lon, limit, cb) {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    limit = parseInt(limit) || 1;
    knex("opennodata")
        .select(knex.raw("gid, tarifs2011 as tarif, ST_AsGeoJson(ST_Transform(geom, 4326)) as geojson"))
        .orderBy(knex.raw("ST_Transform(ST_SetSRID(ST_MakePoint(" + lon + ", " + lat + "), 4326), 2154) <-> geom"))
        .limit(limit)
        .then(function(result) {
            cb(result);
        }, function(err) {
            console.log("SQL Error: " + err);
        });
}