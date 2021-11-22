/*
Adds a user to the DB.
*/
function addUser() {
  $.ajax({
    url: '/add/user',
    method: 'POST',
    data: {
      fname: $('#fname').val(),
      lname: $('#lname').val(),
      email: $('#email').val(),
      password: $('#email').val(),
      phone: $('#password').val(),
      function: $('#function').val(),
      unit: $('#unit').val()
    }
  });
}
