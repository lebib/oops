var tpl;
define = function(jade, cb) {
    tpl = cb();
}

var oops = {};
var currentLayer = null
var currentPopup = null;
var plot = null;
var mapObj;
var myCoords = {
    lat: 43.6024,
    lon: 3.87414
};
var marker;

var oTarifs = {
    jaune: ['Limité à 2 heures', {
        "1ère demi-heure": 1,
        "45 minutes": "1.50",
        "1 heure": "2",
        "1 heure 15": "2.50",
        "1 heure 30": "3",
        "1 heure 45": "3.50",
        "2 heures": "4"
    }],
    orange: ['Limité à 5 heures', {
        "1": "1.30",
        "2": "2.60",
        "3": "3.10",
        "4": "3.60",
        "5": "4"
    }],
    vert: ['Limité à 9 heures', {
        "1": "0.80",
        "2": "1.20",
        "3": "1.40",
        "4": "1.50",
        "5": "1.60",
        "6": "1.70",
        "7": "1.80",
        "8": "1.90",
        "9": 2
    }]
};

oops.loadTemplate = function(name) {
    $("#content")
        .html(tpl(name));
    $('#content')
        .trigger('create');
};

oops.initMap = function() {
    mapObj = new L.Map('map', {
        center: new L.LatLng(myCoords.lat, myCoords.lon),
        zoom: 17
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
                $('#map')
                    .height($(window)
                        .height() - 43);
                mapObj.invalidateSize(false);
            } else {
                $('div[data-rolo=content]')
                    .height($(window)
                        .height() - 43);
            }
        });

};

onError = function(error) {
    oops.initMap();
};

oops.setPosition = function(position) {
    if (position.coords.latitude) {
        myCoords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }
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
            var html;
            var t = result.tarif;
            if (result.stats) {
                tColor = t || 'gris';
                html = '<div class="popupPrices '+tColor+'">';
                if (t) {
                    html += '<div class="popupTarifTitle">';
                        html += oTarifs[t][0] + '</div><div class="popupPricesList">';
                    for (var key in oTarifs[t][1]) {
                        html += '<div class="popupPriceLine">' + key + ': ' + oTarifs[t][1][key] + ' €</div>';
                    }
                    html += '</div>';
                } else {
                    html += '<div class="popupNoPrice">Aucun<br />tarif</div>';
                }
                html += '</div>';
                html += '<div class="popupProba"></div>';
                html += '<div class="clearfix"></div><div class="distance"></div><button id="popupButton" class="ui-btn">Plus d\'informations</button>';
            } else {
                html = '<div class="popupNoInfo">Nous n\'avons aucune information pour cette rue à cet horaire.</div>';
            }
            $("#popupButton")
                .button();
            var style = {
                weight: 5,
                opacity: 0.8,
                color: "#777777"
            }
            var price = 2.5;
            var betterPay = false;
            if (!currentPopup) {
                currentPopup = L.popup({
                    minWidth: 420,
                    closeButton: false
                });
            }
            if (currentLayer) {
                mapObj.removeLayer(currentLayer);
            }
            switch (result.tarif) {
                case 'jaune':
                    style.color = "#e9e100";
                    price = 4;
                    break;
                case 'orange':
                    style.color = "#ff6600";
                    price = 2.60;
                    break;
                case 'vert':
                    style.color = "#3dbb25";
                    price = 1.20;
                    break;
            }
            if (result.stats > 0) {
                betterPay = (price < (result.stats * 17));
            }
            currentLayer = L.geoJson(JSON.parse(result.geojson), {
                style: style
            })
                .addTo(mapObj);

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

oops.getChartDataz = function(lat, lon, date, cb){
    $.ajax({
	url: "/getChartDataz",
	data: {
	    lat: lat,
	    lon: lon,
	    date: date
	}
    })
	.done(function(result){
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

function launchFullScreen(element) {
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
}