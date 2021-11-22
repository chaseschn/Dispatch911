/*
Sends post request to login a user and redirect to home page
*/
function login(){
  $.ajax({
    url: '/login',
    method: 'POST',
    data: {
      email: $('#email').val(),
      password: $('#pass1').val()
    },
    success: (response) => {
      window.location.pathname = "home.html"
      $('#login-msg').html(msg); //add message later
    }
  });
}
