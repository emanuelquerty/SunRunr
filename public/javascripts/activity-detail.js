$(function() {
  // If authToken does not exists, redirect user to
  if (!window.localStorage.getItem("authToken")) {
    // Redirect user to account.html page
    window.location.replace("/");
  }
});

// Get the activity created at that was clicked from the url
let url = window.location.href;
let url_array = url.split("/");
let created_at = url_array[url_array.length - 1];
let date = new Date(parseInt(created_at)).toISOString();
let activity;

async function getActivity() {
  let response = await fetch(`/activities/read/${date}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-auth": window.localStorage.getItem("authToken")
    }
  });

  let data = await response.json();
  return data;
}

getActivity().then(res => {
  // Display speed and uv exposure throughout the activity
  activity = res.activity;
  let dataEverySetInterval = activity.dataEverySetInterval;

  // Get the x values intervals for the graph and the y values (uv and gps speed)
  let uv_array = [0];
  let GPS_speed_array = [0];
  let intervals = [0];
  let runningSum = 0;
  for (let i = 0; i < dataEverySetInterval.length; i++) {
    runningSum += 15;
    intervals.push(runningSum);
    uv_array.push(dataEverySetInterval[i].uv);
    GPS_speed_array.push(dataEverySetInterval[i].GPS_speed);
  }

  // Display the uv and speed in one graph
  displayChart(
    "activity-detail-chart",
    intervals,
    uv_array,
    "uv exposure",
    GPS_speed_array,
    "speed",
    "uv exposure and speed throughout the activity"
  );

  // Display the the activity data (i.e. uv, calories, activity type, etc)
  let activityDate = new Date(activity.created_at).toDateString();
  $("#date-val").html(activityDate);

  let duration = activity.activityDuration / 1000 / 60;
  $("#duration-val").html(duration + " minutes");

  $("#uv-val").html(activity.uv_exposure);
  $("#speed-val").html(round(activity.average_speed, 3));
  $("#temperature-val").html(activity.temperature);
  $("#humidity-val").html(activity.humidity);
  $("#activity-type-val").html(activity.activityType);
  $("#calories-burned-val").html(round(activity.caloriesBurned, 3));
});
/****************** This is for displaying charts chart *************************/
function displayChart(canvasId, labels, data1, label1, data2, label2, title) {
  let chart = document.getElementById(canvasId).getContext("2d");
  let massPopChart = new Chart(chart, {
    type: "line", // bar, horizontal, pie, line, doughnut, radar, polarArea
    data: {
      labels: labels,
      datasets: [
        {
          label: label1,
          data: data1,
          backgroundColor: "#7c4dff"
        },
        {
          label: label2,
          data: data2,
          backgroundColor: "#4caf50"
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

//to round to n decimal places
function round(num, places) {
  var multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
}

// Change Activity Type on user press
$(".btn-change-activity-type").click(function() {
  $(".info-update-container").show();
});

$(".btn-cancel").click(function() {
  $(".info-update-container").hide();
});

$(".btn-change").click(function() {
  let activityType = $("#change-activity-type").val();

  if (
    activityType.toLowerCase() == "running" ||
    activityType.toLowerCase() == "walking" ||
    activityType.toLowerCase() == "biking"
  ) {
    // Find the average speed in miles per hour (initially given in knots)
    let activityDurationInHours = activity.activityDuration / 1000 / 3600;
    let distance_travelled = activity.average_speed * activityDurationInHours;

    let obj = {
      activityType: activityType,
      created_at: created_at,
      distance_travelled
    };
    changeActivityType("/activities/change_activity_type", obj).then(res => {
      // Update activity type and calories burned to display the new values
      $("#activity-type-val").html(res.data.activityType);
      $("#calories-burned-val").html(round(res.data.caloriesBurned, 3));
    });
  }

  $(".info-update-container").hide();
});

async function changeActivityType(url, obj) {
  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth": window.localStorage.getItem("authToken")
    },
    body: JSON.stringify(obj)
  });

  let data = await response.json();
  return data;
}
