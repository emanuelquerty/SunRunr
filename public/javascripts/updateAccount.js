var inputErrors = document.querySelectorAll(".input-errors");
var email = document.querySelector("#email");
var password = document.querySelector("#password");
var add_device = document.querySelector("#add-device");
var replace_device = document.querySelector("#replace-device");

$(document).ready(function() {
  $(".sidenav").sidenav();
  $(".dropdown-trigger").dropdown();
  $("select").formSelect();
});

// Update account information
$(function() {
  // If authToken does not exists, redirect user to
  if (!window.localStorage.getItem("authToken")) {
    // Redirect user to account.html page
    window.location.replace("/");
  }

  // Fetch user Info
  sendReqForAccountInfo();

  addUpdateAccountButtonEvents();

  // Handle logout
  $(".logout-btn").click(function() {
    window.localStorage.removeItem("authToken");
    window.location.replace("/");
  });
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
  let devices = data.devices;
  //   console.log(data);

  $("#welcome-username-btn").html(`Welcome @${username}`);
  $(".info-update-displayed-email").html(email);

  // Attach all devices number to the select button options (Hidden initially)
  let oldDeviceSelect = document.querySelector(".old-device-select");
  let fragment = document.createDocumentFragment();
  devices.forEach(deviceId => {
    let option = document.createElement("option");
    option.value = deviceId;
    option.innerHTML = deviceId;
    fragment.appendChild(option);
  });

  oldDeviceSelect.appendChild(fragment);
  $("select").formSelect();
}
function accountInfoError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}

function addUpdateAccountButtonEvents() {
  // Open the update email, password, add-device or replace-device box
  var collection_item = document.querySelectorAll(".collection-item");

  for (let i = 0; i < collection_item.length; i++) {
    collection_item[i].addEventListener("click", e => {
      showUpdateForm(i);
    });
  }

  // Hide the update email box if user presses cancel btn
  $(".info-update-cancel-btn").click(function() {
    hideUpdateForms();
    resetElementsValue();
  });

  // Register the handler for the submit button
  $(".info-update-submit-btn").click(function(e) {
    let id = e.target.className.split(" ");
    validateInput(id[id.length - 1]);
  });
}

function showUpdateForm(index) {
  let infoUpdateContainer = document.querySelectorAll(".info-update-container");
  infoUpdateContainer[index].style.display = "block";
}

function hideUpdateForms() {
  $(".info-update-container").hide();
  $(".replace-device-btn").hide();
}

function resetElementsValue() {
  inputErrors.forEach(inputError => {
    inputError.innerHTML = "";
    email.style.borderBottom = "1px solid #000";
    password.style.borderBottom = "1px solid #000";
    add_device.style.borderBottom = "1px solid #000";
    replace_device.style.borderBottom = "1px solid #000";
  });
  email.value = "";
  password.value = "";
  add_device.value = "";
  replace_device.value = "";
}

function validateInput(id) {
  var data;
  var errors = [];
  inputErrors.forEach(inputError => {
    inputError.style.color = "#ff5400";
  });

  if (id == "email") {
    data = { email: $(`#${id}`).val() };

    var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;

    if (!re.test(email.value)) {
      errors.push("Invalid or missing email address.");
      email.style.borderBottom = "2px solid #d35400";
    }
  } else if (id == "password") {
    data = { password: $(`#${id}`).val() };

    if (password.value.length < 10 || password.value.length > 20) {
      errors.push("Password must be between 10 and 20 characters.");
      password.style.borderBottom = "2px solid #d35400";
    }

    if (!/[a-z]/.test(password.value)) {
      errors.push("Password must contain at least one lowercase character.");
      password.style.borderBottom = "2px solid #d35400";
    }

    if (!/[A-Z]/.test(password.value)) {
      errors.push("Password must contain at least one uppercase character.");
      password.style.borderBottom = "2px solid #d35400";
    }

    if (!/[0-9]/.test(password.value)) {
      errors.push("Password must contain at least one digit.");
      password.style.borderBottom = "2px solid #d35400";
    }
  } else if (id == "add-device") {
    data = { newDeviceId: $(`#${id}`).val() };
    if (!add_device.value) {
      errors.push("Missing Device Number");
      add_device.style.borderBottom = "2px solid #d35400";
    }
  } else if (id == "replace-device") {
    let oldDeviceId = document.querySelector(".old-device-select").value;
    data = { oldDeviceId: oldDeviceId, newDeviceId: $(`#${id}`).val() };
    if (!replace_device.value) {
      errors.push("Missing Device Number");
      replace_device.style.borderBottom = "2px solid #d35400";
    }
  }

  if (errors.length > 0) {
    var htmlStr = "<ul>";
    errors.forEach(error => {
      htmlStr += "<li>" + error + "</li>";
    });
    htmlStr += "</ul>";

    inputErrors.forEach(inputError => {
      inputError.style.display = "block";
      inputError.style.fontSize = "9.5pt";
      inputError.innerHTML = htmlStr;
    });
  } else {
    hideUpdateForms();
    resetElementsValue();
    inputErrors.forEach(inputError => {
      inputError.style.display = "none";
    });

    // TODO: send the data to the server
    if (id == "email") {
      sendNewEmail(data);
    } else if (id == "password") {
      sendNewPassword(data);
    } else if (id == "add-device") {
      addNewDevice(data);
    } else if (id == "replace-device") {
      replaceDeviceWithNew(data);
    }
  }
}

// Send the new email to the server
function sendNewEmail(data) {
  $.ajax({
    url: "/users/update",
    type: "PUT",
    contentType: "application/json",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    data: JSON.stringify(data),
    dataType: "json"
  })
    .done(emailUpdateSuccess)
    .fail(emailUpdateError);
}

function emailUpdateSuccess(data, textStatus, jqXHR) {
  // Store Token
  window.localStorage.setItem("authToken", data.authToken);

  // Refresh the page
  window.location = "/users/update";
}

function emailUpdateError(jqXHR, textStatus, errorThrown) {}

// Send the new password to the server
function sendNewPassword(data) {
  $.ajax({
    url: "/users/update",
    type: "PUT",
    contentType: "application/json",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    data: JSON.stringify(data),
    dataType: "json"
  })
    .done(passwordUpdateSuccess)
    .fail(passwordUpdateError);
}

function passwordUpdateSuccess(data, textStatus, jqXHR) {
  console.log(data);

  $(".new-password-update").show();

  $(".keep-me-signed-in-btn").click(() => {
    $(".new-password-update").hide();
  });

  $(".log-me-out-btn").click(() => {
    window.localStorage.removeItem("authToken");
    window.location = "/";
  });
}

function passwordUpdateError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}

// Send the new device to add in the list of devices
function addNewDevice(data) {
  $.ajax({
    url: "/devices/update",
    type: "PUT",
    contentType: "application/json",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    data: JSON.stringify(data),
    dataType: "json"
  })
    .done(addNewDeviceSuccess)
    .fail(addNewDeviceError);
}

function addNewDeviceSuccess(data, textStatus, jqXHR) {
  $(".add-new-device-update").html("<p>New Device Added successfully</p>");
  $(".add-new-device-update").show();

  setTimeout(function() {
    $(".add-new-device-update").hide();
  }, 3000);
}

function addNewDeviceError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}

// Replace a device with a new one
function replaceDeviceWithNew(data) {
  $.ajax({
    url: "/devices/update",
    type: "PUT",
    contentType: "application/json",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    data: JSON.stringify(data),
    dataType: "json"
  })
    .done(replaceDeviceSuccess)
    .fail(replaceDeviceError);
}

function replaceDeviceSuccess(data, textStatus, jqXHR) {
  $(".add-new-device-update").html(`<p>${data.msg}</p>`);
  $(".add-new-device-update").show();

  setTimeout(function() {
    $(".add-new-device-update").hide();
  }, 3000);
}

function replaceDeviceError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}
