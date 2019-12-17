$(function() {
  $.ajax({
    url: "/users/read/weather-forecast",
    type: "GET",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    dataType: "json"
  })
    .done(getForecastDataSuccess)
    .fail(getForecastDataError);
});

function getForecastDataSuccess(weatherForecastdata, textStatus, jqXHR) {
  // UV index for opean weather map api has a separate endpoint, so we fetch uv index now from our server
  $.ajax({
    url: "/users/read/uv-forecast",
    type: "GET",
    headers: { "x-auth": window.localStorage.getItem("authToken") },
    dataType: "json"
  })
    .done(function(uvForecastData, textStatus, jqXHR) {
      console.log(uvForecastData);
      populateWeatherForecastTable(
        weatherForecastdata.forecastDays,
        uvForecastData
      );
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    });
}

function getForecastDataError(jqXHR, textStatus, errorThrown) {
  console.log(errorThrown);
}

// Create tables to display the forecast for each weekday
function populateWeatherForecastTable(weatherForecastdata, uvForecastData) {
  // Create header row
  let outerDocumentFragment = document.createDocumentFragment();
  for (day in weatherForecastdata) {
    let headerTemplateRow = $(".header_row");
    let header = document.createElement("tr");
    header.innerHTML = headerTemplateRow.html();
    let documentFragment = document.createDocumentFragment();
    documentFragment.appendChild(header);

    let i = 0;
    weatherForecastdata[day].forEach(dayTime => {
      let date = new Date(dayTime.dt_txt);
      let time = formatAMPM(date);
      let description = dayTime.weather[0].description;
      let temperature = dayTime.main.temp;
      let humidity = dayTime.main.humidity;

      // Alternate rows color
      if (i % 2 != 0) {
        $("td").css("backgroundColor", "#fcf4ac");
      } else {
        $("td").css("backgroundColor", "initial");
      }

      // Populate Table
      $(".time").html(
        time +
          "<br>" +
          `<span style="color:#f1c40f;">${day.toUpperCase().slice(0, 3)}</span>`
      );
      $(".description").html(description);
      $(".temperature").html(temperature + "&#176; K");
      $(".humidity").html(humidity);
      $(".uv").html(uvForecastData[day][0].value);

      let dataTemplateRow = $(".data_row");
      let dataRow = document.createElement("tr");
      dataRow.innerHTML = dataTemplateRow.html();
      documentFragment.appendChild(dataRow);
      i++;
    });

    let table = document.createElement("table");
    table.appendChild(documentFragment);
    outerDocumentFragment.appendChild(table);
  }

  $(".daily-forecast").html("");
  $(".daily-forecast").append(outerDocumentFragment);
}

// Given a Date object, returns the time in am/pm format
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
