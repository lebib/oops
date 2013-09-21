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
    getNearRoad(lat, lon, 1, function(result) {
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
        addPruneForRoad(result.gid, date, comment, cb); // corrigé data en date, arg 2
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
    console.log('insert -> ' + date);
    knex("prunes")
        .insert({
            gid: roadGid,
            prune_date: date,
            comment: comment
        })
        .then(function() {
            console.log('done.');
        }, function(err) {
            console.log('rly?');
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
                for (var i = 0; i < 3; i++) {
                    var jour = Math.floor((Math.random() * 29) + 1);
                    var h = Math.floor(Math.random() * 10 + 9);
                    if (h < 10) {
                        h = '0' + h;
                    } 
                    var min = Math.floor(Math.random() * 60);
                    if (min < 10) {
                        min = '0' + min;
                    }
                    var heure = h + ':' + min;
                    // console.log("Data : 2012-09-" + jour + ' ' + heure)
                    addPruneForRoad(res.gid, "2012-09-" + jour + ' ' + heure + ':00.0000', '', function(err) {
                        if (err) {
                            console.log("Error creating Prune: " + err);
                        }
                    });
                }
                console.log('fucking done.');
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

exports.getRoadStat = getRoadStat = function(lat, lon, date, cb) {
    getNearRoad(lat, lon, 1, function(result){
        date = date || new Date();
        date_left = date.getTime()/1000;
        date_right = date;
        date_right.setHours(date.getHours() + 1);
        date_right = date_right.getTime()/1000;
        dow = date.getDay() + 1;
        hour = date.getHours();
        total_tranche = 0;
        total_jour = 0;
        where_dow = 'EXTRACT(DOW FROM prune_date) = ' + dow;
        where_date = 'EXTRACT(EPOCH FROM prune_date) BETWEEN ' + date_left + ' AND ' + date_right;
        knex("prunes")
           .select(knex.raw('count(1) as total_tranche'))                      
           .where(knex.raw(where_dow))
           /*.andWhere('gid', '=', result.gid)
           .andWhere(function(){
            this.whereBetween(knex.raw('EXTRACT(EPOCH FROM prune_date)'), [date_left, date_right])
           })
           .groupBy('gid')*/
           /*.toString()); */
           .then(function(result) {
                console.log(result);
                result.forEach(function(res){
                    knex("prunes")
                       .select(knex.raw('count(1) as total_jour'))
                       .where(knex.raw(where_dow))
                       .andWhere('gid', '=', res.gid)
                       .groupBy('gid').toString();
                        console.log(res);
                        cb(total_jour/total_tranche);
                        
                    }, function(err) {
                        console.log("SQL Error: " + err);
                   });
                });
 
        // console.log(knex("prunes")
        //    .select(knex.raw('count(1) as total_jour'))
        //    .where(knex.raw(where_dow))
        //    .andWhere('gid', '=', result.gid)
        //    .groupBy('gid').toString());
           // .then(function(result) {
           //      total_jour = result.total_jour;
           //          }, function(err) {
           //      console.log("SQL Error: " + err);
           // });
        cb(res);
    })
}

