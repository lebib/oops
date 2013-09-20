$ = jQuery;
var tpl;
define = function(jade, cb) {
    tpl = cb();
}

var oops = {};

oops.loadTemplate = function(name) {
    $("div#content")
        .html(tpl(name));
}

oops.checkPlace = function(lat, lon) {
    $.ajax({
        url: "/checkPlace",
        data: {lat: lat, lon: lon}
    })
        .done(function(result) {
            var style = {
                weight: 5,
                opacity: 0.8,
                color: "#777777"
            }
            result.forEach(function(line) {
                switch(line.tarif) {
                   case 'jaune':
                    style.color = "#FFFF00";
                    break;
                    case 'orange':
                    style.color = "#FFBF00";
                    break;
                    case 'vert':
                    style.color = "#01DF01"
                    break;
                } 
                L.geoJson(JSON.parse(line.geojson), {style: style}).addTo(map);
            });
        });
}

oops.addPrune = function(lat, lon) {
        $.ajax({
        url: "/addPrune",
        data: {lat: lat, lon: lon}
    })
        .done(function(data) {
            if (console && console.log) {
                console.log("Sample of data:", data);
            }
        });
}