

var tpl;
define = function(jade, cb) {
    tpl = cb();
}

var oops = {};
var currentLayer = null
var currentPopup = null;
var plot = null;

oops.loadTemplate = function(name) {
    $("div#content")
        .html(tpl(name));
}

 
oops.checkPlace = function(lat, lon) {
    $.ajax({
        url: "/checkPlace",
        data: {
            lat: lat,
            lon: lon
        }
    })
        .done(function(result) {
            console.log(result);
            var prunesList = [];
            var html = '<div class="popupTitle">Contraventions relevées dans cette rue</div>';
            var style = {
                weight: 5,
                opacity: 0.8,
                color: "#777777"
            }
            if (!currentPopup) {
                currentPopup = L.popup();
            }
            if (currentLayer) {
                map.removeLayer(currentLayer);
            }
            result.forEach(function(line) {
                switch (line.tarif) {
                    case 'jaune':
                        style.color = "#FFFF00";
                        break;
                    case 'orange':
                        style.color = "#FFBF00";
                        break;
                    case 'vert':
                        style.color = "#01DF01";
                        break;
                }
                if (line.prunes.length) {
                    line.prunes.forEach(function(p) {
                            var n=p.prune_date.match(/([0-9]+)/g);
                            var day = n[0]+'/'+n[1]+'/'+n[2];
                            var hour = n[3]+'h '+n[4] +'min';
                            prunesList.push('Le '+day+' à '+hour);
                    })
                }
                html += prunesList.join("<br />");
                //prunesList.push(JSON.parse(line.prunes));
                currentLayer = L.geoJson(JSON.parse(line.geojson), {
                    style: style
                })
                    .addTo(map);
            });

            var markerLatLng = marker.getLatLng();
            currentPopup.setLatLng([markerLatLng.lat, markerLatLng.lng]);
            currentPopup.setContent(html);
            currentPopup.openOn(map);
            oops.getRoadStat(43.6024, 3.87414, '2012-09-10', function(rez) {
                console.log(" --- TRACE getRoadStat --- ");
                console.log(rez);
            });
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

        $("#graphz").empty();
    }
    if (datas) {
        datas.prunes.forEach(function(prune) {
            i++;
            //console.log(prune);
            //build array
            grapharray.push({x: i, y: (i*prune.pid/10000) - i});
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
