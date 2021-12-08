function buildMsgHist(result) {
  console.log(result);
  // Creates JSON format of message
  displayMsg = '';
  let recordsArray = JSON.parse(result);
  // Iterates all messages
  for (i in recordsArray) {
    // Selects message
    let msg = recordsArray[i];
    // Adds to box
    displayMsg += `${msg.title}: ${msg.lat} ${msg.long} ${msg.department} ${msg.time}<br> ${msg.description}<br>`
  }
  $('#content2').html(displayMsg); 
}

/*
Executes every second to check for new messages
*/
function update() {
  $.ajax({
    url: '/get/pins',
    method: 'GET',
    success: (result) => buildMsgHist(result)
  });
}
