/*
Sends post request to login a user and redirect to home page
*/
function login(){
  $.ajax({
    url: '/login',
    method: 'POST',
    data: {
      email: $('#username').val(),
      password: $('#password').val()
    },
    success: (response) => {
      window.location.pathname = "home.html"
      $('#login-msg').html(msg); //add message later
    }
  });
}
