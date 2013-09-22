var tpl;
define = function(jade, cb) {
    tpl = cb();
}

var oops = {};
var currentLayer = null
var currentPopup = null;
var plot = null;
var mapObj;
var myCoords = {lat: 43.6024, lon: 3.87414};
var marker;

oops.loadTemplate = function(name) {
    $("#content")
        .html(tpl(name));
    $('#content')
        .trigger('create');
}

oops.initMap = function() {
    mapObj = new L.Map('map', {
        center: new L.LatLng(myCoords.lat, myCoords.lon),
        zoom: 18
    });
    var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    marker = new L.marker([myCoords.lat, myCoords.lon], {
        draggable: true
    })
        .addTo(mapObj);
    marker.on('dragend', function(evt) {
        var latlng = this.getLatLng();
        oops.checkPlace(latlng.lat, latlng.lng);
    });
    mapObj.addLayer(osm);
    var popup = L.popup();

   $(window)
        .on("pagechange", function(event, ui) {
            if ($.mobile.activePage.attr('id') == 'mappage') {
                $('#map').height($(window).height() - 43);
                mapObj.invalidateSize(false);
            } else {
                $('div[data-rolo=content]').height($(window).height() - 43);
            }
        });

}

onError = function(error) {
    console.log("Error setting map position: "+error);
    oops.initMap();
}

oops.setPosition = function (position) {
    if (position.coords.latitude) {
        myCoords = {lat: position.coords.latitude, lon: position.coords.longitude}
    }
    oops.initMap();
}

oops.checkPlace = function(lat, lon, date) {
    $.ajax({
        url: "/checkPlace",
        data: {
            lat: lat,
            lon: lon,
	    date: date
        }
    })
        .done(function(result) {
            console.log(result);
	    console.log('Yo!');
            var prunesList = [];
            var html = '<div class="popupTitle">Contraventions relevées dans cette rue</div>';
            var style = {
                weight: 5,
                opacity: 0.8,
                color: "#777777"
            }
	    var price;
	    var betterPay = FALSE;
            if (!currentPopup) {
                currentPopup = L.popup();
            }
            if (currentLayer) {
                mapObj.removeLayer(currentLayer);
            }
	    console.log('here ?');
            result.forEach(function(line) {
                switch (line.tarif) {
                case 'jaune':
                    style.color = "#FFFF00";
                    price = 4;
		    break;
                case 'orange':
                    style.color = "#FFBF00";
		    price = 2.60; 
                    break;
                case 'vert':
                    style.color = "#01DF01";
		    price = 1.20;
                    break;
                }
		if(line.stats.lenght()>0){
		    betterPay = (price < (line.stats * 17));
		}
		line.betterPay = betterPay;
		console.log(line.betterPay);
		console.log('dafuQ');
                if (line.prunes.length) {
                    line.prunes.forEach(function(p) {
                        var n = p.prune_date.match(/([0-9]+)/g);
                        var day = n[0] + '/' + n[1] + '/' + n[2];
                        var hour = n[3] + 'h ' + n[4] + 'min';
                        prunesList.push('Le ' + day + ' à ' + hour);
                    })
                }
                html += prunesList.join("<br />");
                //prunesList.push(JSON.parse(line.prunes));
                currentLayer = L.geoJson(JSON.parse(line.geojson), {
                    style: style
                })
                    .addTo(mapObj);
            });

            var markerLatLng = marker.getLatLng();
            currentPopup.setLatLng([markerLatLng.lat, markerLatLng.lng]);
            currentPopup.setContent(html);
            currentPopup.openOn(mapObj);
            oops.showGraph(result[0]);
        });
}

oops.getRoadStat = function(lat, lon, date, cb) {
    $.ajax({
        url: "/getRoadStat",
        data: {
            lat: lat,
            lon: lon,
            date: date
        }
    })
        .done(function(result) {
            cb(result);
        });
}

oops.addPrune = function(lat, lon) {
    $.ajax({
        url: "/addPrune",
        data: {
            lat: lat,
            lon: lon
        }
    })
        .done(function(data) {
            if (console && console.log) {
                console.log("Sample of data:", data);
            }
        });
}

oops.showGraph = function(datas) {
    //console.log(datas);
    var grapharray = [];
    var i = 0;
    if (plot) {

        $("#graphz")
            .empty();
    }
    if (datas) {
        datas.prunes.forEach(function(prune) {
            i++;
            //console.log(prune);
            //build array
            grapharray.push({
                x: i,
                y: (i * prune.pid / 10000) - i
            });
            //console.log(prune.prune_date);
        });

        plot = xkcdplot();
        var paramz = {
            title: "test",
            xlabel: "derp",
            ylabel: "herp",
            xlim: [-100, 100],
            ylim: [-100, 100]
        };
        // console.log(grapharray);
        // console.log(paramz);
        plot('#graphz', paramz);
        /*
            TODO GRAPHZ:
            * prunes par heures 
            * % probabilité d'allumage par une pervanche
            * 
         */
        // Render the image.
        plot.draw();
    }
}