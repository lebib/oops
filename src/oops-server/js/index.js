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

exports.checkPlace = function(lat, lon, date, cb) {
    date = date || new Date();
    getNearRoad(lat, lon, 1, function(result) {
        if (!result) {
            cb("No road found found");
        } else {
            getPrunes(result, date, function(err, prunes) {
                if (err) {
                    console.log(err);
                }

                getNearRacketMachines(result, function(err, racketmachine) {
                    if (err) {
                        console.log(err);
                    }
                    prunes.racketmachine = racketmachine;
                    cb(prunes);
                });
            }, 0)
        }
    })
}

exports.addPrune = addPrune = function(lat, lon, date, comment, cb) {
    getNearRoad(lat, lon, 1, function(result) {
        addPruneForRoad(result.gid, date, comment, cb); // corrigé data en date, arg 2
    })
}

exports.getPrunes = getPrunes = function(arr, date, cb, i, ret) {
    var ret = ret || [];
    var recursive = false;
    console.log('Get da prune !');
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
                _getRoadStatFromGid(gid, date, function(stats) {
                    console.log('Da statz below :');
		    console.log(stats);
		    ret[i].stats = stats;
                    i++;
                    if (i < arr.length) {
                        getPrunes(arr, cb, i, ret);
                    } else {
                        cb(null, ret)
                    }
                })
            } else {
                _getRoadStatFromGid(gid, date, function(stats) {
                    ret['geojson'] = geojson;
                    ret['prunes'].push(prunes);
                    cb(bull, ret);
                });
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
            console.log('...');
            cb();
        }, function(err) {
            console.log('rly?');
            cb(err);
        })
}

exports.deletePruneTable = deletePruneTable = function() {
    knex("prunes")
        .truncate()
        .then(function(res) {
            console.log('truncate done.');
            injectFakeDatas();
        }, function(err) {
            console.log('SQL Error : ' + err);
        });
};

exports.injectFakeDatas = injectFakeDatas = function() {
    // Get all Roads
    console.log("Import fake dataz");
    knex("opennodata")
        .select('gid')
        .then(function(roads) {
            console.log('Insertz done.');
            generateFakePrunes(roads, 0, function() {
                console.log("ici");
            })
        }, function(err) {
            console.log("injectFakeDatas SQL Error: " + err);
        });
}

var generateFakePrunes = function(roads, i, cb) {
    res = roads[i];
    var max = Math.floor((Math.random() * 100) + 10);
    console.log('Inserting ' + max + ' prunes to road id ' + res.gid + ' !');
    i++;
    if (i < roads.length) {
        insertFakePrunes(max, 0, function() {
            generateFakePrunes(roads, i, cb);
        })
    } else {
        cb();
    }
}

var insertFakePrunes = function(max, i, cb) {
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
    addPruneForRoad(res.gid, "2012-09-" + jour + ' ' + heure + ':00', '', function(err) {
        console.log(i+' -- '+max);
        if (err) {
            console.log("Error creating Prune: " + err);
        }
        if (i < max) {
            i++;
            insertFakePrunes(max, i, cb);
        } else {
            cb();
        }
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
            console.log("getNearRoad SQL Error: " + err);
        });
}

var getNearRacketMachines = function(lat, lon, limit, cb) {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    limit = parseInt(limit) || 1;
    knex("racketmachines")
        .select(knex.raw("numero, ST_AsGeoJson(ST_Transform(geom, 4326)) as geojson"))
        .orderBy(knex.raw("ST_Transform(ST_SetSRID(ST_MakePoint(" + lon + ", " + lat + "), 4326), 2154) <-> geom"))
        .limit(limit)
        .then(function(result) {
            cb(result);
        }, function(err) {
            console.log("getNearRacketMachines SQL Error: " + err);
        });
}

var _getRoadStatFromGid = function(gid, date, cb) {
    date = date || new Date();
    date_left = date.getTime() / 1000;
    date_right = date;
    date_right.setHours(date.getHours() + 1);
    date_right = date_right.getTime() / 1000;
    dow = date.getDay() + 1;
    //Heure fixe pour test (les pervenches ne sortent pas à l'heure de l'apéro !)
//hour = date.getHours();
    hour = 13;
    total_tranche = 0;
    total_jour = 0;
    where_dow = 'EXTRACT(DOW FROM prune_date) = ' + dow;
    where_hour = 'EXTRACT(HOUR FROM prune_date) = ' + hour;
    where_date = 'EXTRACT(EPOCH FROM prune_date) BETWEEN ' + date_left + ' AND ' + date_right;
    knex("prunes")
        .select(knex.raw('count(1) as total_tranche'))
        .where(knex.raw(where_dow))
	.andWhere('gid', '=', gid)
    // A peaufiner pour selectionner une tranche plus interessante. On sélectionne pour le moment l'heure courante
        /*.andWhere(function(){
            this.whereBetween(knex.raw('EXTRACT(HOUR FROM prune_date)'), [hour, hour + 1])
           })*/
	.andWhere(knex.raw(where_hour))
        .groupBy('gid')
	.then(function(result){
	    if(result.length > 0){
		total_tranche = result[0].total_tranche ;
		console.log('total_tranche below:');
		console.log( result[0].total_tranche) ;
		_getTotalJour(total_tranche,gid,where_dow,cb);
	    }
	}, function(err) {
            console.log("_getRoadStatFromGid SQL Error: " + err);
	});
}

var _getTotalJour = function(total_tranche,gid,where_dow,cb){
    knex("prunes")
	.select(knex.raw('count(1) as total_jour'))
	.where(knex.raw(where_dow))
	.andWhere('gid', '=', gid)
	.groupBy('gid')
	.then(function(result) {
            total_jour = result[0].total_jour;
	    console.log('total_jour below :');
	    console.log( result[0].total_jour);
	    cb(total_tranche/total_jour);
	}, function(err) {
	    console.log("_getTotalJour SQL Error: " + err);
	});    
}


