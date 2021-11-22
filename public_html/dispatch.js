
function buildMsgHist(result) {
  let msgBox = '';
  // Creates JSON format of message
  let messageArray = JSON.parse(result);
  // Iterates all messages
  for (i in messageArray) {
    // Selects message
    let msg = messageArray[i];
    // Adds to box
    msgBox += `<b>${msg.alias}</b>: ${msg.message}<br>`;
  }
  $('#getDispatchMsg').html(msgBox); // Add to html
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
  $.ajax({
    url: '/chat/post',
    data: { alias: $('#alias').val(),
      msg: $('#message').val() },
    method: 'POST'
  });
}
// Update interval
setInterval(() => update(), 1000);
