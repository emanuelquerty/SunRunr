var submit = document.querySelector("#submit");
var email = document.querySelector("#email");
var password = document.querySelector("#password");
var formErrors = document.querySelector("#formErrors");
var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;

submit.addEventListener("click", validateInput);
password.addEventListener("keypress", function(event) {
  if (event.which === 13) {
    validateInput(event);
  }
});

function validateInput(event) {
  var errors = [];
  formErrors.innerHTML = "";

  // Rest all fields to initial border style
  email.style.borderBottom = "4px solid #00c853";
  password.style.borderBottom = "4px solid #00c853";

  if (!re.test(email.value)) {
    errors.push("Invalid or missing email address.");
    email.style.borderBottom = "4px solid #d35400";
  }

  if (password.value.length == 0) {
    errors.push("Invalid or missing password");
    password.style.borderBottom = "4px solid #d35400";
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

    let loginInfo = {
      email: email.value,
      password: password.value
    };

    $.ajax({
      url: "/users/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(loginInfo),
      dataType: "json"
    })
      .done(loginSuccess)
      .fail(loginError);
  }
}

function loginSuccess(data, textStatus, jqXHR) {
  if (data.success) {
    // Store Token
    window.localStorage.setItem("authToken", data.authToken);

    // Redirect user to account page
    window.location = "/home";
  } else {
    let errors = [];
    errors.push(data.msg);
    var htmlStr = "<ul>";
    errors.forEach(error => {
      htmlStr += "<li>" + error + "</li>";
    });
    htmlStr += "</ul>";

    formErrors.style.display = "block";
    formErrors.style.fontSize = "9.5pt";
    formErrors.classList.add("errors");
    formErrors.innerHTML = htmlStr;
    formErrors.style.display = "block";
  }
}

function loginError(jqXHR, textStatus, errorThrown) {
  console.log(jqXHR);
}
