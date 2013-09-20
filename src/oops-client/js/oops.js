$ = jQuery;
var tpl;
define = function(jade, cb) {
    tpl = cb();
}

var oops = {};
var currentLayer = null
var currentPopup = null;

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
                            var hour = n[4]+'h '+n[5]+'min';
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
            console.log(currentPopup);
            currentPopup.setLatLng(marker.getLatLng());
            currentPopup.setContent(html);
            currentPopup.openOn(map);
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