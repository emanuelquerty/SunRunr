// $(document).ready(function() {
//   $(".sidenav").sidenav();
// });

if (!window.localStorage.getItem("authToken")) {
  // Redirect user to account.html page
  window.location.replace("/");
}

$(function() {
  // If authToken does not exists, redirect user to
  if (!window.localStorage.getItem("authToken")) {
    // Redirect user to account.html page
    window.location.replace("/");
  }

  // Handle logout
  $("#logout-btn").click(function() {
    // alert("hello");
    window.localStorage.removeItem("authToken");
    window.location.replace("/");
  });

  // Fetch user Info
  sendReqForAccountInfo();
});

function sendReqForAccountInfo() {
  $.ajax({
    url: "/users/read",
    type: "GET",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    dataType: "json"
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function accountInfoSuccess(data, textStatus, jqXHR) {
  console.log(data);
  let email = data.email;
  let username = email.split("@")[0];
  console.log(username);

  $("#welcome-username-btn").html(`Welcome @${username}`);
}
function accountInfoError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}
