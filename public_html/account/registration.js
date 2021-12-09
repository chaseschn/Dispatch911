/*
Adds a user to the DB.
*/
//TO FIX: Function saves as undefined
function login() {
  let email = $('#emailLogin').val();
  let password = $('#passwordLogin').val();
  $.get( //not sure how to do this better
   '/account/login/' + encodeURIComponent(email) + '/' + encodeURIComponent(password),
    (data, status) => {
      if (data == 'Login Successful') {
        window.location.href = '/home.html';
      }
  });
}

function createAccount() {
  let fname = $('#fname').val();
  let lname = $('#lname').val();
  let email = $('#email').val();
  let password = $('#password').val();
  let phone = $('#phone').val();
  let functionVar = $('#functionVar').val();
  let unit = $('#unit').val();
  $.post( //not sure how to do this better
   '/account/create/' + fname + '/' + lname + '/' + encodeURIComponent(email) + '/' + encodeURIComponent(password) + '/' + encodeURIComponent(phone)+ '/' + functionVar + '/' + encodeURIComponent(unit),
    (data, status) => {
      alert(data);
      if (data == 'Account Created') {
        window.location.href = '/account/index.html';
      }
  });
  
}
