# SunRunr

SunRunr Project Overview

- The SunRunr application is an IoT enabled web application for monitoring outdoor fitness activities, sun exposure, and weather conditions during those activities.

- Users will carry a device with a GPS and a UV sensor to monitor user-defined activities and sun exposure. When a user starts an activity, the device will periodically collect the GPS location, speed, and measured UV exposure.

- A third party weather service should further be used to track the temperature and humidity during each fitness activity.  
  When the activity is stopped, the collected activity is transmitted to a web server that maintains the history of each activity for the user.
- The SunRunr web application will also allow the user to monitor their fitness activities, UV exposure, and calories burned.

# Live app url

- url: http://ec2-18-224-200-150.us-east-2.compute.amazonaws.com:3000/

- Existing User Credentials

- email: test@test.com

-password: Lealdade2600

# Running the app on your local machine

Database:

- The app uses mongodb database

- To run the app, first create a jwtSecretKey.txt with a random key for json web token (JWT) in a director above the app's directory. Then you can run the app on your local machine!
