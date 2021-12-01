/*
This creates pins and updates the map for the general users
*/

$(function getMap() {
    // create a basic map centered on Tucson
    // at zoom-level 11
    var map = $("#map").geomap({
        center: [-110.911789, 32.253460], //long, lat in decimal form
        zoom: 11,
        mode: "drawpoint",
        cursors: {
            find: "point",
        },
        click: positionEventHandler,



    });
    // This function displays the coordinates once user clicks
    function positionEventHandler(e, geo) {


        map.geomap("append", geo)
        var displayCoords = geo.coordinates;

        //updates the DOM with lat and long from clicking
        elements = "<div id='coords'> <b>Coordinates:</b> </br><label>Latitude<input id='lat' value=" + displayCoords[1] +
            "> </label><br><label>Longitude<input id='long' value=" + displayCoords[0] + "> " +
            "</label><br>"
        $('#coords').html(elements)

    }


});

/*
This functions creates a pin to the server and on the map
*/
function createReport() {
    $.ajax({
        url: '/post/pin',
        method: 'POST',
        data: {
            title: $('#title').val(),
            lat: $('#lat').val(),
            long: $('#long').val(),
            description: $('#report').val(),
            deparment: $('department').val(),
            time: Date.now()
        }
    });
}

