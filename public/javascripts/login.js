var submit = document.querySelector("#submit");
var email = document.querySelector("#email");
var password = document.querySelector("#password");
var formErrors = document.querySelector("#formErrors");
var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;

submit.addEventListener("click", validateInput);

function validateInput(event) {
  var errors = [];
  formErrors.innerHTML = "";

  // Rest all fields to initial border style
  email.style.border = "1px solid #aaa";
  password.style.border = "1px solid #aaa";

  if (!re.test(email.value)) {
    errors.push("Invalid or missing email address.");
    email.style.border = "2px solid red";
  }

  if (password.value.length == 0) {
    errors.push("Invalid or missing password");
    password.style.border = "2px solid red";
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
    // window.location = "/home";
    console.log(data);
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
