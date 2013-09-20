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
        .done(function(data) {
            if (console && console.log) {
                console.log("Sample of data:", data);
            }
        });
}

oops.addPrune = function(lat, lon) {
        $.ajax({
        url: "/checkPlace",
        data: {lat: lat, lon: lon}
    })
        .done(function(data) {
            if (console && console.log) {
                console.log("Sample of data:", data);
            }
        });
}