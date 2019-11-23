var submit = document.querySelector("#submit");
var deviceId = document.querySelector("#deviceId");
var email = document.querySelector("#email");
var password = document.querySelector("#password");
var passwordConfirm = document.querySelector("#passwordConfirm");
var formErrors = document.querySelector("#formErrors");
var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;

submit.addEventListener("click", validateInput);
passwordConfirm.addEventListener("keypress", function(event) {
  if (event.which === 13) {
    validateInput(event);
  }
});

function validateInput(event) {
  var errors = [];
  formErrors.innerHTML = "";

  // Reset all fields to initial border style
  deviceId.style.borderBottom = "4px solid #00c853";
  email.style.borderBottom = "4px solid #00c853";
  password.style.borderBottom = "4px solid #00c853";
  passwordConfirm.style.borderBottom = "4px solid #00c853";

  if (deviceId.value < 1) {
    errors.push("Missing device ID.");
    deviceId.style.borderBottom = "4px solid #d35400";
  }

  if (!re.test(email.value)) {
    errors.push("Invalid or missing email address.");
    email.style.borderBottom = "4px solid #d35400";
  }

  if (password.value.length < 10 || password.value.length > 20) {
    errors.push("Password must be between 10 and 20 characters.");
    password.style.borderBottom = "4px solid #d35400";
  }

  if (!/[a-z]/.test(password.value)) {
    errors.push("Password must contain at least one lowercase character.");
    password.style.borderBottom = "4px solid #d35400";
  }

  if (!/[A-Z]/.test(password.value)) {
    errors.push("Password must contain at least one uppercase character.");
    password.style.borderBottom = "4px solid #d35400";
  }

  if (!/[0-9]/.test(password.value)) {
    errors.push("Password must contain at least one digit.");
    password.style.borderBottom = "4px solid #d35400";
  }

  if (password.value != passwordConfirm.value) {
    errors.push("Password and confirmation password don't match.");
    passwordConfirm.style.borderBottom = "4px solid #d35400";
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
      "deviceId=" +
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
