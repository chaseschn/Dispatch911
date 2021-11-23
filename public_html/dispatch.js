//dispatch.js 

$(function getMap() {
    // create a basic map centered on Tucson
    // at zoom-level 11
    $("#map").geomap({
        center: [-110.911789, 32.253460], //long, lat in decimal form
        zoom: 11,
    });
});
