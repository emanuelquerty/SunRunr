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

// Get all activities
getActivities().then(res => {
  let activities = res.message;
  // console.log(activities);

  let docFragment = document.createDocumentFragment();
  // Display all activities
  for (let i = 0; i < activities.length; i++) {
    let header = document.querySelector(".activity-header");
    let duration = document.querySelector(".duration");

    let body = document.querySelector(".activity-body");
    let date = document.querySelector(".date");
    let caloriesBurned = document.querySelector(".calories-burned");
    let uvExposure = document.querySelector(".uv-exposure");
    let temperature = document.querySelector(".temperature");
    let humidity = document.querySelector(".humidity");

    console.log(activities[i].created_at);

    // Set the url for the activity button to include the created_at
    let activityCreatedAt = new Date(activities[i].created_at);
    let link = document.querySelector(".activity-detail-btn");
    link.href = "/users/activity-detail/" + activityCreatedAt.getTime();

    link.addEventListener("click", function(e) {
      // Set the activity timestamp in local storage to identify activity in activity detail javascript page
      window.localStorage.setItem(
        "activity created_at",
        activityCreatedAt.getTime()
      );
    });

    // Set all info for each element
    duration.innerHTML =
      activities[i].activityDuration / 1000 / 60 + " minutes";
    date.innerHTML = new Date(activities[i].created_at).toLocaleDateString();
    caloriesBurned.innerHTML = round(activities[i].caloriesBurned, 3);
    uvExposure.innerHTML = activities[i].uv_exposure;
    temperature.innerHTML = activities[i].temperature;
    humidity.innerHTML = activities[i].humidity;

    let headerDiv = document.createElement("div");
    headerDiv.className = "activity-header";
    headerDiv.innerHTML = header.innerHTML;

    let bodyDiv = document.createElement("div");
    bodyDiv.innerHTML = body.innerHTML;
    bodyDiv.className = "activity-body";

    let activityContainer = document.createElement("div");
    activityContainer.className = "activity-container";
    activityContainer.appendChild(headerDiv);
    activityContainer.appendChild(bodyDiv);

    docFragment.appendChild(activityContainer);
  }

  $(".allActivitiesContainer").html("");
  $(".allActivitiesContainer").append(docFragment);
});

//to round to n decimal places
function round(num, places) {
  var multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
}
