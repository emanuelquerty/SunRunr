// Function to generate a random apikey consisting of 32 characters
exports.getNewApikey = function getNewApikey() {
  let newApikey = "";
  let alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
};

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

// Given a number from 0 - 6, returns the day of the week corresponding to that number with Sunday being 0 and Saturday being 6
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

// Given the raw response from Open Weather Api, formats the data to place forecast for each weekday in one object
// where each property is the name of the weekday (Monday through Sunday)
exports.getForecastDays = function getForecastDays(
  rawResponse,
  dataDescription
) {
  let data = null;
  let date = null;

  if (dataDescription === "weather") {
    data = rawResponse.list;
  } else {
    data = rawResponse;
  }

  let forecastDays = {};
  for (let i = 0; i < data.length; i++) {
    if (data[i].hasOwnProperty("dt_txt")) {
      date = new Date(data[i].dt_txt);
    } else {
      date = new Date(data[i].date_iso);
    }

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
  let today = new Date();
  let todayDayOfWeek = getDayOfWeek(today.getDay());
  for (let day in forecastDays) {
    if (forecastDays[day].length == 0 || day == todayDayOfWeek) {
      delete forecastDays[day];
    }
  }

  return forecastDays;
};
