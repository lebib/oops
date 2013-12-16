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
var defaultIcon;

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
    defaultIcon = L.icon({iconUrl: '/js/leaflet/images/marker-icon.png',  iconSize: [25, 41], className: 'customIcon'});
    mapObj = new L.Map('map', {
        center: new L.LatLng(myCoords.lat, myCoords.lon),
        zoom: 15
    });
    var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    marker = new L.marker([myCoords.lat, myCoords.lon], {
        draggable: true
    })
        .addTo(mapObj);
    marker.on('dragstart', function(evt) {
        if (currentPopup) {
            mapObj.closePopup();
        }
    });
    marker.on('dragend', function(evt) {
        var latlng = this.getLatLng();
        oops.checkPlace(latlng.lat, latlng.lng);
    });
    //marker.setIcon(defaultIcon);
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
            //console.log(result);
            var html;
            var t = result.tarif;
            if (!result.tarif) {
                html = '<div class="popupNoInfo">Cette rue est interdite au stationnement.</div>';
            } else if (result.ratio) {
                if (result.ratio > 99) result.ratio = 99;
                var tColor = t || 'gris';
                var indice = result.incide || 1;
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
                html += '<div class="popupProba"><div class="title">Risque de passage<br />d\'une pervenche<br />dans l\'heure qui suit</div><div class="proba">'+Math.round(result.ratio*100)+'%</div><div class="indice">('+Math.round(result.indice+1)+'/5)</div><div class="label">Indice<br />de confiance</div><div class="clearfix"></div></div>';

                html += '<div class="clearfix"></div>';
                if (result.racketmachine && result.racketmachine.distance) {
                    html += '<div class="popupDistance"><div class="metres">'+Math.round(result.racketmachine.distance)+' m</div><div class="label">Distance de l\'horodateur le plus proche</div><div class="clearfix"></div></div>'
                }
            } else {
                html = '<div class="popupNoInfo">Nous n\'avons aucune information pour cette tranche horaire.</div>';
            }
            var style = {
                weight: 5,
                opacity: 0.8,
                color: "#777777"
            }
            var price = 2.5;
            var betterPay = false;
            if (!currentPopup) {
                currentPopup = L.popup({
                    minWidth: 381,
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
            if (result.ratio > 0) {
                betterPay = (price < (result.ratio * 17));
            }
            if (result.tarif) {
                if (betterPay) {
                    var icon = L.icon({iconUrl: '/images/pinpoint_risky.png',  iconSize: [35, 41], className: 'customIcon'})
                } else {
                    var icon = L.icon({iconUrl: '/images/pinpoint_safe.png',  iconSize: [35, 41], className: 'customIcon'})
                }
            } else {
                    var icon = defaultIcon;
            }
            marker.setIcon(icon);
                currentLayer = L.geoJson(JSON.parse(result.geojson), {
                    style: style
                })
                    .addTo(mapObj);

            var markerLatLng = marker.getLatLng();
            console.log(markerLatLng);
            var bounds = mapObj.getBounds();
            var tmp = (bounds._northEast.lat-bounds._southWest.lat)/14;
            currentPopup.setLatLng([markerLatLng.lat+tmp, markerLatLng.lng]);
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
    var date = $('input[id=pvdate]').val();
    var time = $('input[id=pvtime]').val();
    if (date == undefined || time == undefined || date == '' || time == '') {
        toast("Veuillez renseigner tous les champs");
        return;
    }
    var datetime = date+' '+time + ":00" ;
    //console.log("Datetime : " + datetime);
    $.ajax({
        url: "/addPrune",
        method: "post",
        data: {
            lat: myCoords.lat,
            lon: myCoords.lon, 
            date : datetime,
            comment: ''
        }
    })
        .done(function(data) {
            $('input[id=pvdate]').val('');
            $('input[id=pvtime]').val('');
            toast('La contravention a bien été ajoutée.')
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
            * % probabilité d'allumage par une pervenche
            * 
         */
        // Render the image.
        plot.draw();
    }
}

var launchFullScreen = function(element) {
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
}

var toast = function(msg){
    $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
    .css({ display: "block", 
        opacity: 0.90, 
        position: "fixed",
        padding: "7px",
        "text-align": "center",
        width: "270px",
        left: ($(window).width() - 284)/2,
        top: $(window).height()/2 })
    .appendTo( $.mobile.pageContainer ).delay( 1500 )
    .fadeOut( 400, function(){
        $(this).remove();
    });
}