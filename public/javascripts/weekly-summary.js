// Weekly activities summary information
let totalWeeklyActivityDuration = 0;
let totalWeeklyUvExposure = 0;
let totalWeeklyCaloriesBurned = 0;

$(function() {
  // If authToken does not exists, redirect user to
  if (!window.localStorage.getItem("authToken")) {
    // Redirect user to account.html page
    window.location.replace("/");
  }
});

async function getActivities() {
  let response = await fetch("/activities/read", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-auth": window.localStorage.getItem("authToken")
    }
  });

  let data = await response.json();
  return data;
}

getActivities().then(data => {
  let activities = data.message;

  // Get the day of the month corresponding to 7 days ago
  let sevenDaysAgo = new Date().setDate(new Date().getDate() - 7);
  let sevenDaysAgoDate = new Date(sevenDaysAgo);
  //   console.log(sevenDaysAgoDate.toDateString() + " <br>");

  // Create the keys for the last 7 days ago in the format "Monday, 16", "Tuesday, 17", and soon
  let dailyKeys = [];
  for (let i = 0; i < 7; i++) {
    // Some day ago is a day within a week span
    let SomeDayAgo = new Date().setDate(new Date().getDate() - i - 1); // Gives a day within a week span in milliseconds from Unix Epoch
    let someDayAgoDateObj = new Date(SomeDayAgo);
    let someDayAgoKey =
      getDayOfWeek(someDayAgoDateObj.getDay()) +
      ", " +
      someDayAgoDateObj.getDate(); // This will give a string in a format "Monday, 17"
    dailyKeys.unshift(someDayAgoKey);
  }

  console.log(dailyKeys);
  //   console.log(activities);

  // Get all activities over last 7 days (group activities by day)
  let lastSevenDaysActivities = {};

  for (let i = 0; i < activities.length; i++) {
    let activityDate = activities[i].created_at;
    let date = new Date(activityDate);

    // console.log(date.toDateString());
    sevenDaysAgoDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date >= sevenDaysAgoDate && date < today) {
      // Format the object key for each of the seven days
      let objectKey = getDayOfWeek(date.getDay()) + ", " + date.getDate();
      let duration = parseInt(activities[i].activityDuration) / 1000 / 60;
      let uv_exposure = parseInt(activities[i].uv_exposure);
      let caloriesBurned = parseInt(activities[i].caloriesBurned);

      if (objectKey in lastSevenDaysActivities) {
        lastSevenDaysActivities[objectKey]["duration"] += duration;
        lastSevenDaysActivities[objectKey]["uv_exposure"] += uv_exposure;
        lastSevenDaysActivities[objectKey]["caloriesBurned"] += caloriesBurned;
      } else {
        lastSevenDaysActivities[objectKey] = {};
        lastSevenDaysActivities[objectKey]["duration"] = duration;
        lastSevenDaysActivities[objectKey]["uv_exposure"] = uv_exposure;
        lastSevenDaysActivities[objectKey]["caloriesBurned"] = caloriesBurned;
      }

      // Calculate the total activity duration, uv exposure and caloriesBurned
      totalWeeklyActivityDuration += duration;
      totalWeeklyUvExposure += uv_exposure;
      totalWeeklyCaloriesBurned += caloriesBurned;
    }
  }

  // Now create the three charts (activity duration, uv exposure and calories burned)
  let dailyDurationvalues = [];
  let dailyUvExposureValues = [];
  let dailyCaloriesBurnedValues = [];
  for (let i = 0; i < dailyKeys.length; i++) {
    if (dailyKeys[i] in lastSevenDaysActivities) {
      dailyDurationvalues.push(
        lastSevenDaysActivities[dailyKeys[i]]["duration"]
      );

      dailyUvExposureValues.push(
        lastSevenDaysActivities[dailyKeys[i]]["uv_exposure"]
      );

      dailyCaloriesBurnedValues.push(
        lastSevenDaysActivities[dailyKeys[i]]["caloriesBurned"]
      );
    } else {
      dailyDurationvalues.push(0);
      dailyUvExposureValues.push(0);
      dailyCaloriesBurnedValues.push(0);
    }
  }

  // Activity Duration Chart
  displayChart(
    "activity-duration",
    dailyKeys,
    dailyDurationvalues,
    "#536dfe",
    "Activity Duration",
    "Total Weekly Activity Duration: " +
      totalWeeklyActivityDuration +
      " minutes"
  );

  // UV Exposure Chart
  displayChart(
    "uv-exposure",
    dailyKeys,
    dailyUvExposureValues,
    "#ef6c00",
    "UV Exposure",
    "Total Weekly UV Exposure: " + totalWeeklyUvExposure
  );

  // Calories Burned Chart
  displayChart(
    "calories-burned",
    dailyKeys,
    dailyCaloriesBurnedValues,
    "#00c853",
    "Calories Burned",
    "Total Weekly Calories Burned: " + totalWeeklyCaloriesBurned + " calories"
  );

  console.log(dailyDurationvalues);
  console.log(lastSevenDaysActivities);
});

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

/****************** This is for displaying charts chart *************************/
function displayChart(canvasId, labels, data, bgColor, label, title) {
  let chart = document.getElementById(canvasId).getContext("2d");
  let massPopChart = new Chart(chart, {
    type: "bar", // bar, horizontal, pie, line, doughnut, radar, polarArea
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: bgColor
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: title,
        fontSize: 16
      }
    }
  });
}
