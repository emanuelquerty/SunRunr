//-------------------------------------------------------------------

#include "PublishActivity.h"
#include <string>
#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)
#define ONE_HOUR_MILLIS (60*1000)   // cutoff time for each hour

//-------------------------------------------------------------------

PublishActivity::PublishActivity(AssetTracker &theTracker,
                                 queue<ActivitySample> &sampleQueue) 
                                 : gpsSensor(theTracker), activitySamples(sampleQueue) {

    tick = 0;
    state = S_Wait;
}

//-------------------------------------------------------------------

void PublishActivity::execute(float AccoumulatedUV) {
    // float uv_totalExposure = 0;
    // unsigned long lastSampleTime;
    String postData = "";
    String data = "";
    ActivitySample aSample;
    int qLength = 0;
    // int activityDuration;
    int ticksOfOneDay = int( ONE_DAY_MILLIS * pow(10, -3) );

    switch (state) {
        case PublishActivity::S_Wait:
            tick = 0;

            if (activitySamples.size() > 0) {
                state = PublishActivity::S_WifiCheck;
            }
            else {
                state = PublishActivity::S_Wait;
            }
            break;

        case PublishActivity::S_WifiCheck:
            tick++;
            
            // stay in state if wifi is down and tick count is less than one day 
            if (tick <= ticksOfOneDay && !Particle.connected()) {
                state = PublishActivity::S_WifiCheck;
            }
            else if(tick > ticksOfOneDay) {
                state = PublishActivity::S_DropActivity;
            }
            else if(Particle.connected()) {
                state = PublishActivity::S_Publish;
            }
            break;
            
        case PublishActivity::S_Publish:
            
            // String postData;
            // aSample = activitySamples.front();
            
            // if (gpsSensor.gpsFix()) {
            //   postData = String::format("{ \"lon\": \"%f\", \"lat\": \"%f\", \"speed\": \"%f\", \"uv\": \"%f\" }",
            //                              aSample.getLongitude(), aSample.getLatitude(), aSample.getSpeed(), aSample.getUV());
            // }
            // else {
            //   postData = String::format("{ \"lon\": \"%f\", \"lat\": \"%f\", \"speed\": \"%f\", \"uv\": \"%f\" }",
            //                              -110.987420, 32.248820, 0, -1);
            // }
            
            // postData = String::format("{ \"dataEverySetInterval\": [{ \"lon\": \"%f\", \"lat\": \"%f\", \"GPS_speed\": \"%f\", \"uv\": \"%f\" }], \"uv_exposure\": \"%f\", \"activityDuration\": \"%f\" }",
            //                              aSample.getLongitude(), aSample.getLatitude(), aSample.getSpeed(), aSample.getUV(), AccoumulatedUV, (activitySamples.size()-1)*15000);
            // postData = String::format("Hello!");
            // activitySamples.pop();
            
            // Serial.println(postData);
            // Particle.publish(postData);
            qLength = activitySamples.size();
            for(int i = 0; i<activitySamples.size(); i++){
                aSample = activitySamples.front();
                postData += String::format("{ \"longitude\": \"%f\", \"latitude\": \"%f\", \"GPS_speed\": \"%f\", \"uv\": \"%f\" },", aSample.getLongitude(), aSample.getLatitude(), aSample.getSpeed(), aSample.getUV());
                activitySamples.pop();
            }
            // postData = postData.substr(0, postData.length() - 1);
            postData.remove(strlen(postData) -1 );
            // activitySamples = queue<ActivitySample> ();
            
            // data = "{ \"dataEverySetInterval\": [" + postData + "], \"uv_exposure\": \"%f\", \"activityDuration\": \"%f\" }", AccoumulatedUV, /*(activitySamples.size()-1)*15000*/12.22222;
            // data = "{ \"dataEverySetInterval\": [" + postData + "], \"uv_exposure\": \"%f\", \"activityDuration\": \"%f\" }";
            data = "{ \"dataEverySetInterval\": [" + postData + String::format("], \"uv_exposure\": \"%f\", \"activityDuration\": \"%lu\", \"deviceId\": \"%s\", \"apiKey\": \"%s\"}", AccoumulatedUV, (qLength-2)*15000, "560046000e504b464d323520", "NuVhB8FgyBDsAN7yZlBJ8wMXefslzSgZ");
            activitySamples = queue<ActivitySample> ();
            // data = String::format("{ \"dataEverySetInterval\": [{ \"lon\": \"%f\", \"lat\": \"%f\", \"GPS_speed\": \"%f\", \"uv\": \"%f\" }], \"uv_exposure\": \"%f\", \"activityDuration\": \"%f\" }",
            //                              aSample.getLongitude(), aSample.getLatitude(), aSample.getSpeed(), aSample.getUV(), AccoumulatedUV, (activitySamples.size()-1)*15000);
            
            Particle.publish("SunRunr Activity Data", data, PRIVATE);
            state = PublishActivity::S_Wait;
            break;
            
        case PublishActivity::S_DropActivity:
            activitySamples = queue<ActivitySample> ();   // clears out the activity queue
            state = PublishActivity::S_Wait;
            break;
            
    }
}

//-------------------------------------------------------------------
