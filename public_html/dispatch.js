//dispatch.js

$(function getMap() {
    // create a basic map centered on Tucson
    // at zoom-level 11
    $("#map").geomap({
        center: [-110.911789, 32.253460], //long, lat in decimal form
        zoom: 11,

        cursors: {
          find: "point",
      },
      mode: "drawpoint",
      move: updateMap,
  });
  updateMap();
});

//This displays all of the current pins on the map. 
function displayPin(result) {
  var map = $("#map").geomap({
      cursors: {
          find: "point",
      },
      click: function (e, geo) {//click to open a new div to edit pin
          var pin = map.geomap('find', geo, 12);
          if (pin.length > 0) {
              updatePin(pin[0]); // pin is JSONgeo Object
          }
      },
      move: function (e, geo) {
          // search for a pin under the cursor
          var monument = map.geomap("find", geo, 12);
          console.log(monument);
          if (monument.length > 0) {
              // if found, show its label
              console.log(monument[0])
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
              coordinates: [pin.long, pin.lat],

          },
          properties: {
              id: pin.id,
              title: pin.title,
              description: pin.description,
              department: pin.department,
              time: pin.time,
              color: pin.color,
              endTime: pin.endTime,
          },

      };
      pins.push(monuments);
  };
  $.each(pins, function () {
      // label has a class that matches the pin's id
      // false (at the end) stops jQuery Geo from trying to refresh after each append
      map.geomap("append", this, { color: this.properties.color }, '<span class="' + this.properties.id + '"> Title: ' + this.properties.title +
          '<br>id: ' + this.properties.id + '<br>Description: ' + this.properties.description + '<br>Department: '
          + this.properties.department + '<br>Time Reported: ' + this.properties.time + '<br>Time Ended: ' + this.properties.endTime + '</span>', false);
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
//This creates a div to edit and option to close the incident
function updatePin(pinObj) {
  console.log(pinObj.geometry.coordinates)
  elements = "<div id='temporay_display'><b>Coordinates:</b> </br><label>Latitude: " + pinObj.geometry.coordinates[1] +
      " </label><br><label>Longitude: " + pinObj.geometry.coordinates[0] + "</label><br><label>Description: </label><br><textarea id='description' rows='10' cols='30'>"
      + pinObj.properties.description + "</textarea><br><label><input type='button' onclick='updateReport();' value='Close Incident'><input type='hidden' id='pinId' value=" +
      pinObj.properties.id + "><label><input type='button' onclick='closeWindow();' value='Cancel'>"
  $('#updatePins').html(elements)
};
//This updates the pin information and closes the incident
function updateReport() {
  console.log('update Report')
  $.ajax({
      url: '/update/pin',
      method: 'POST',
      data: {
          id: $('#pinId').val(),
          description: $('#description').val(),
          endTime: new Date()
      }
  });
  closeWindow();
};
//This removes the edit box. 
function closeWindow() {
  $('#updatePins').html('')
}


function buildMsgHist(result) {
  console.log(result);
  let msgBoxAll = '';
  let msgBoxPolice = '';
  let msgBoxFire = '';
  let msgBoxEMS = '';
  // Creates JSON format of message
  let messageArray = JSON.parse(result);
  // Iterates all messages
  for (i in messageArray) {
    // Selects message
    let msg = messageArray[i];
    // Adds to box
    if(msg.department == 'Police'){
      msgBoxPolice += `<b>${msg.alias}</b>: ${msg.message}<br>`;
    } else if(msg.department == 'Fire'){
      msgBoxFire += `<b>${msg.alias}</b>: ${msg.message}<br>`;
    } else if(msg.department == 'EMS'){
      msgBoxEMS += `<b>${msg.alias}</b>: ${msg.message}<br>`;
    } else {
      msgBoxAll += `<b>${msg.alias}</b>: ${msg.message}<br>`;
    }
  }
  $('#all_chat_box').html(msgBoxAll); // Add to html
  $('#police_chat_box').html(msgBoxPolice);
  $('#fire_chat_box').html(msgBoxFire);
  $('#ems_chat_box').html(msgBoxEMS);
}

/*
Executes every second to check for new messages
*/
function update() {
  $.ajax({
    url: '/chat',
    method: 'GET',
    success: (result) => buildMsgHist(result)
  });
}

/*
This function posts new messages to the chat box.
*/
function send() {
  console.log(department)
  $.ajax({
    url: '/chat/post',
    method: 'POST',
    data: {
      msg: $('#chat_message').val(),
      department: $(".chat_tab:checked").val()
    }
  });
}
// Update interval
setInterval(() => update(), 1000);
setInterval(() => updateMap(), 10000);