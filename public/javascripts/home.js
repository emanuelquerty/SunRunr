// Activate the sidenav and drop down from materialize
$(document).ready(function() {
  $(".sidenav").sidenav();
  $(".dropdown-trigger").dropdown();
});

if (!window.localStorage.getItem("authToken")) {
  // If authToken does not exists, redirect user to
  window.location.replace("/");
}

$(function() {
  // Handle logout
  $(".logout-btn").click(function() {
    window.localStorage.removeItem("authToken");
    window.location.replace("/");
  });

  // Fetch user Info
  sendReqForAccountInfo();
});

// Get a user's information to display in home page
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
  let email = data.email;
  let username = email.split("@")[0];

  $("#welcome-username-btn").html(`Welcome @${username}`);
}
function accountInfoError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}
