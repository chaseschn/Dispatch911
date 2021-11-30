//dispatch.js

$(function getMap() {
    // create a basic map centered on Tucson
    // at zoom-level 11
    $("#map").geomap({
        center: [-110.911789, 32.253460], //long, lat in decimal form
        zoom: 11,
    });
});


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
