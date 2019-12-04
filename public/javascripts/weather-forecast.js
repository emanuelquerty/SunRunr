$(function() {
  getMostRecentActivityLocation();
});

// Get a user's information to display in home page
function getMostRecentActivityLocation() {
  $.ajax({
    url: "/users/get-most-recent-activity-location",
    type: "GET",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    dataType: "json"
  })
    .done(mostRecentActivityLocationSuccess)
    .fail(mostRecentActivityLocationError);
}

function mostRecentActivityLocationSuccess(data, textStatus, jqXHR) {
  getLocationForecast(data.lat, data.lon);
}
function mostRecentActivityLocationError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}

function getLocationForecast(lat, lon) {
  let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=045d7a604186991f3a06dfec6589cee1`;
  fetch(forecastUrl)
    .then(res => res.json())
    .then(res => {
      let forecastDays = getForecastDays(res);
      populateWeatherForecastTable(forecastDays);
      console.log(forecastDays);
    })
    .catch(error => {
      console.log(error);
    });
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getForecastDays(rawResponse) {
  let data = rawResponse.list;

  let forecastDays = {};
  for (let i = 0; i < data.length; i++) {
    let date = new Date(data[i].dt_txt);
    let dayOfWeek = getDayOfWeek(date.getDay());

    switch (dayOfWeek) {
      case "Monday":
        if (!forecastDays.hasOwnProperty("Monday")) {
          forecastDays.Monday = [];
        }
        forecastDays.Monday.push(data[i]);
        break;
      case "Tuesday":
        if (!forecastDays.hasOwnProperty("Tuesday")) {
          forecastDays.Tuesday = [];
        }
        forecastDays.Tuesday.push(data[i]);
        break;
      case "Wednesday":
        if (!forecastDays.hasOwnProperty("Wednesday")) {
          forecastDays.Wednesday = [];
        }
        forecastDays.Wednesday.push(data[i]);
        break;
      case "Thursday":
        if (!forecastDays.hasOwnProperty("Thursday")) {
          forecastDays.Thursday = [];
        }
        forecastDays.Thursday.push(data[i]);
        break;
      case "Friday":
        if (!forecastDays.hasOwnProperty("Friday")) {
          forecastDays.Friday = [];
        }
        forecastDays.Friday.push(data[i]);
        break;
      case "Saturday":
        if (!forecastDays.hasOwnProperty("Saturday")) {
          forecastDays.Saturday = [];
        }
        forecastDays.Saturday.push(data[i]);
        break;
      case "Sunday":
        if (!forecastDays.hasOwnProperty("Sunday")) {
          forecastDays.Sunday = [];
        }
        forecastDays.Sunday.push(data[i]);
        break;
    }
  }

  // Delete Empty Days
  for (let day in forecastDays) {
    if (forecastDays[day].length == 0) {
      delete forecastDays[day];
    }
  }

  return forecastDays;
}

function getDayOfWeek(dayOfWeek) {
  return isNaN(dayOfWeek)
    ? null
    : [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ][dayOfWeek];
}

function populateWeatherForecastTable(forecastDays) {
  // Create header row
  let outerDocumentFragment = document.createDocumentFragment();
  for (day in forecastDays) {
    let headerTemplateRow = $(".header_row");
    let header = document.createElement("tr");
    header.innerHTML = headerTemplateRow.html();
    let documentFragment = document.createDocumentFragment();
    documentFragment.appendChild(header);
    // console.log(documentFragment);
    forecastDays[day].forEach(dayTime => {
      let date = new Date(dayTime.dt_txt);
      let time = formatAMPM(date);
      let description = dayTime.weather[0].description;
      let temperature = dayTime.main.temp;
      let humidity = dayTime.main.humidity;

      //   console.log(day);
      //   console.log(time);
      //   console.log(description);
      //   console.log(temperature);
      //   console.log(humidity);
      //   console.log("__________________");

      // Populate Table
      $(".time").html(
        time +
          "<br>" +
          `<span style="color:#f1c40f;">${day.toUpperCase().slice(0, 3)}</span>`
      );
      $(".description").html(description);
      $(".temperature").html(temperature + "&#176; K");
      $(".humidity").html(humidity);

      let dataTemplateRow = $(".data_row");
      let dataRow = document.createElement("tr");
      dataRow.innerHTML = dataTemplateRow.html();
      documentFragment.appendChild(dataRow);
    });

    let table = document.createElement("table");
    table.style.marginTop = "4rem";
    table.appendChild(documentFragment);
    outerDocumentFragment.appendChild(table);
  }

  $(".daily-forecast").html("");
  $(".daily-forecast").append(outerDocumentFragment);
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
