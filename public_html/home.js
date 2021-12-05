/*
File: home.js
Purpose: General users can report and view
reports on the map.
Supports home.html functions. 

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
        move: updateMap,
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
            deparment: $("input[type='radio'][name='department']:checked").val(),
            time: new Date()
        },
    });
    updateMap();
};
/*
This function displays the pin information on the map
Result is the JSON of pins from the server/db
*/
function displayPin(result) {
    var map = $("#map").geomap({
        cursors: {
            find: "point",
        },
        move: function (e, geo) {
            // search for a pin under the cursor
            var monument = map.geomap("find", geo, 12);
            if (monument.length > 0) {
                // if found, show its label
                $("." + monument[0].properties.id).closest(".geo-label").show();
            } else {
                // otherwise, hide all labels
                $(".geo-label").hide();
            }
        }
    });
    let pinArray = JSON.parse(result);
    let pins = []
    //Creates a JSONgeo pin to display information on the page
    for (i in pinArray) {
        let pin = pinArray[i]
        var monuments = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [pin.long, pin.lat]
            },
            properties: {
                id: pin.id,
                title: pin.title,
                description: pin.description,
                department: pin.department,
                time: pin.time,
                color: pin.color,
            }
        };
        pins.push(monuments);
    };
    $.each(pins, function () {
        // label has a class that matches the pin's id
        // false (at the end) stops jQuery Geo from trying to refresh after each append
        map.geomap("append", this, '<span class="' + this.properties.id + '"> Title: ' + this.properties.title +
            '<br>id: ' + this.properties.id + '<br>Description: ' + this.properties.description + '<br>Department: '
            + this.properties.department + '<br>Time Reported: ' + this.properties.time + '</span>', false);
    });
    //refresh the map
    map.geomap("refresh");
};
//Calls for pin updates from the server/db. 
function updateMap() {
    $.ajax({
        url: '/get/pins',
        method: 'GET',
        success: (result) => displayPin(result)
    });
}
//Interval to check for pin updates
//setInterval(() => updateMap(), 10000);
