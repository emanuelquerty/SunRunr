// This #include statement was automatically added by the Particle IDE.
#include "PublishActivity.h"

// This #include statement was automatically added by the Particle IDE.
#include "RecordActivity.h"

// This #include statement was automatically added by the Particle IDE.
#include "ActivitySample.h"

// This #include statement was automatically added by the Particle IDE.
#include "AutoPause.h"

// This #include statement was automatically added by the Particle IDE.
#include "UV_OverThreshold.h"

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_VEML6070.h>

// This #include statement was automatically added by the Particle IDE.
#include <AssetTracker.h>

#include <queue>

using namespace std;

Adafruit_VEML6070 UVTracker = Adafruit_VEML6070();
AssetTracker locationTracker = AssetTracker();


// Global Parameters
float UV_Limit = 5000.0;   // UV Threshold value
float AccoumulatedUV = 0;
queue<ActivitySample> activitySample;


// Instantiate State Machines 
UV_OverThreshold uv_overThreshold = UV_OverThreshold();
AutoPause autoPause = AutoPause();
RecordActivity recordActivity = RecordActivity(activitySample);
PublishActivity publishActivity = PublishActivity(locationTracker, activitySample);

// Flag for starting and scheduling state machines
bool executeStateMachines = false;
void stateMachineScheduler() {
    executeStateMachines = true;
}
Timer stateMachineTimer(10, stateMachineScheduler);


// Flag for button pressed using ISR and pull down resistor
bool buttonPressed = false;
int button = BTN;


// Global Flags
bool AutoPause_Flag = false; // tracks if autoPause condition is triggered
bool DangerUV_Flag = false;  // track if UV threshold had excedeed  
// bool Activity_LedFlag = false;  // to be used across state machines

// LED color parameters
uint32_t stoppedActivityLED_Color = RGB_COLOR_GRAY;
uint32_t startedActivityLED_Color = RGB_COLOR_GREEN;
uint32_t pausedActivityLED_Color = RGB_COLOR_YELLOW;
uint32_t uvDangerLED_Color = RGB_COLOR_RED;



void myHandler(const char *event, const char *data) {
    // Formatting output
    String output = String::format("POST Response:\n  %s\n  %s\n", event, data);
    // Log to serial console
    Serial.println(output);
}


void setup() {
    
    Serial.begin(9600); //define the baud rate
    
    // Initialize the gps and turn it on    
    locationTracker.begin();
    locationTracker.gpsOn();
    
    //Initialize the UV sensor
    UVTracker.begin(VEML6070_1_T);
    
    // Setup pin mode for button
    pinMode(button, INPUT);

    stateMachineTimer.start();

    Particle.subscribe("hook-response/SunRunr Activity Data", myHandler, MY_DEVICES);

}
 

void loop() {
    String data = "";
    
    // Get the UV values
    float UV_Currentvalue = UVTracker.readUV();
    
    // get the location
    locationTracker.updateGPS();
    
    // read button and if it is pressed; Note: can miss button-press if the button is depresssed and let go before the reaching the following conditional
    if(digitalRead(button) == 0){ // pulldown resitor; 0: pressed
        buttonPressed = !buttonPressed;
        DangerUV_Flag = false;
        RGB.control(true);
        RGB.color(stoppedActivityLED_Color);
        RGB.control(false);
        AccoumulatedUV = 0;
        AutoPause_Flag = false;
    }
    
    if (executeStateMachines) {
        locationTracker.updateGPS();
        DangerUV_Flag = uv_overThreshold.execute(AccoumulatedUV, UV_Limit);
        AutoPause_Flag = autoPause.execute(locationTracker.getSpeed(), buttonPressed); // locationTracker.getSpeed() 
        recordActivity.execute(AutoPause_Flag, buttonPressed, locationTracker, UV_Currentvalue); //AutoPause_Flag
        
        if(!buttonPressed && !AutoPause_Flag) {
            publishActivity.execute(AccoumulatedUV);
        }
        
        executeStateMachines = false;
    }
    
    
    
    // Determine and set appropriate LED color to indicate status
    RGB.control(true);
    if(DangerUV_Flag) {
        RGB.color(uvDangerLED_Color);
    }
    else if(AutoPause_Flag) {
        RGB.color(pausedActivityLED_Color);
    }
    else if(buttonPressed) {
        RGB.color(startedActivityLED_Color);
    }
    else if(!buttonPressed) {
        RGB.color(stoppedActivityLED_Color);
    }
    
    
    // Add the sum of UV values from the samples queue
    if(activitySample.size()>0) {
        ActivitySample recentSample = activitySample.back();
        AccoumulatedUV += recentSample.getUV();
    }
    
    
    
    
    // Serial.println("Checking for Fix");
    // if (locationTracker.gpsFix()) { //GPS Fixed
    //     data = String::format("{ \"lon\": \"%f\", \"lat\": \"%f\", \"GPS_speed\": \"%f\", \"uv\": \"%f\" }", locationTracker.readLonDeg(), locationTracker.readLatDeg(), locationTracker.getSpeed(), totalUV);  
    //     Serial.println("Fix"); 
    // }
    // else {
    //     Serial.println("NO Fix"); //GPS not fixed
    //     data = String::format("{ \"lon\": \"%f\", \"lat\": \"%f\", \"GPS_speed\": \"%f\", \"uv\": \"%f\" }", 999.999, 999.999, 5.0, totalUV);
    //     }
    // Serial.println(data);

    // data = String::format("{ \"UV_Danger_Flag\":  \"%s\", \"uv\": \"%f\" }", DangerUV_Flag ? "True":"False", UV_Currentvalue );
    // data = String::format("{ \"AutoPause_Flag\": \"%s\", \"speed\": \"%f\" }", AutoPause_Flag ? "True":"False", locationTracker.getSpeed());
    // data = String::format("{ \"buttonPressed\": \"%s\"}", buttonPressed ? "True":"False");
    // ActivitySample testSample = activitySample.front();
    // data = String::format("samplesCount: %d, lon: %f, lat: %f, GPS_speed: %f, uv: %f", activitySample.size(), testSample.getLongitude(), testSample.getLatitude(), testSample.getSpeed(), testSample.getUV());
    // Particle.publish(data);
    
    delay(500); // loops around every .5 seconds
}