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
    displayMsg += `Title: ${msg.title}<br>
      Location: ${msg.lat}, ${msg.long}<br>
      Department: ${msg.department}<br>
      Time: ${msg.time}<br>
      Description: ${msg.description}<br><br> `
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

setInterval(() => update(), 1000);
