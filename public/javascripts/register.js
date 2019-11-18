var submit = document.querySelector("#submit");
var deviceId = document.querySelector("#deviceId");
var email = document.querySelector("#email");
var password = document.querySelector("#password");
var passwordConfirm = document.querySelector("#passwordConfirm");
var formErrors = document.querySelector("#formErrors");
var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;

submit.addEventListener("click", validateInput);

function validateInput(event) {
  var errors = [];
  formErrors.innerHTML = "";

  // Rest all fields to initial border style
  deviceId.style.border = "1px solid #aaa";
  email.style.border = "1px solid #aaa";
  password.style.border = "1px solid #aaa";
  passwordConfirm.style.border = "1px solid #aaa";

  if (deviceId.value < 1) {
    errors.push("Missing device ID.");
    deviceId.style.border = "2px solid red";
  }

  if (!re.test(email.value)) {
    errors.push("Invalid or missing email address.");
    email.style.border = "2px solid red";
  }

  if (password.value.length < 10 || password.value.length > 20) {
    errors.push("Password must be between 10 and 20 characters.");
    password.style.border = "2px solid red";
  }

  if (!/[a-z]/.test(password.value)) {
    errors.push("Password must contain at least one lowercase character.");
    password.style.border = "2px solid red";
  }

  if (!/[A-Z]/.test(password.value)) {
    errors.push("Password must contain at least one uppercase character.");
    password.style.border = "2px solid red";
  }

  if (!/[0-9]/.test(password.value)) {
    errors.push("Password must contain at least one digit.");
    password.style.border = "2px solid red";
  }

  if (password.value != passwordConfirm.value) {
    errors.push("Password and confirmation password don't match.");
    passwordConfirm.style.border = "2px solid red";
  }

  if (errors.length > 0) {
    var htmlStr = "<ul>";
    errors.forEach(error => {
      htmlStr += "<li>" + error + "</li>";
    });
    htmlStr += "</ul>";

    formErrors.style.display = "block";
    formErrors.style.fontSize = "9.5pt";
    formErrors.classList.add("errors");
    formErrors.innerHTML = htmlStr;
  } else {
    formErrors.style.display = "none";

    var ajax = new XMLHttpRequest();

    ajax.addEventListener("load", registerResponseHandler);
    ajax.responseType = "json";

    ajax.open("POST", "/users/register", true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(
      "deviceID=" +
        deviceId.value +
        "&email=" +
        email.value +
        "&password=" +
        password.value
    );
  }
}

function registerResponseHandler() {
  if (this.status == 200) {
    let response = this.response;

    if (!response.success) {
      var errors = [];
      errors.push(response.msg);
      ccc;
    } else {
      window.location = "../../users/login";
    }
  }
}
