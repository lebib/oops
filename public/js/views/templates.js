define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

return function anonymous(locals) {
var buf = [];
buf.push("<link type=\"text/css\" rel=\"stylesheet\" href=\"js/leaflet/leaflet.css\"/><script src=\"/js/leaflet/leaflet.js\"></script><script>var map = new L.Map('map', {center: new L.LatLng(43.6100, 3.8742), zoom: 13});\nvar osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');\nmap.addLayer(osm);\n\nvar marker = L.marker([43.6100, 3.8742]).addTo(map);\nvar popup = L.popup();\n\nfunction onMapClick(e) {\n    oops.checkPlace(e.latlng.lat, e.latlng.lng);\n    popup\n     .setLatLng(e.latlng)\n        .setContent(\"You clicked the map at \" + e.latlng.toString())\n        .openOn(map);\n}\nmap.on('click',onMapClick);\n</script><div id=\"map\"></div>");;return buf.join("");
}

});