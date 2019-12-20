//-------------------------------------------------------------------

#include "RecordActivity.h"

//-------------------------------------------------------------------

RecordActivity::RecordActivity(queue<ActivitySample>& activityQueue): activitySample(activityQueue){
    tick = 0;
    state = S_Wait;
}

//-------------------------------------------------------------------

void RecordActivity::execute(bool paused, bool buttonPressed, AssetTracker& gpsSensor, float uv_reading) {
    
    
    switch (state) {
        case RecordActivity::S_Initialize:
            tick = 0;

            if (buttonPressed) {
                state = RecordActivity::S_Wait;
            }
            else {
                state = RecordActivity::S_Initialize;
            }
            break;

        case RecordActivity::S_Wait:
            tick++;
            
            if(!buttonPressed || paused){
                state = S_Initialize;
            }
            else if (tick <= 30){   // 30 represends 15 seconds when loop duration is .5sec==500ms
                state = S_Wait;
            }
            else if (tick > 30){
                state = S_RecordActivity;
            }
            break;

        case RecordActivity::S_RecordActivity:
            ActivitySample aSample = ActivitySample(gpsSensor.readLonDeg(), gpsSensor.readLatDeg(), gpsSensor.getSpeed(), uv_reading);
            activitySample.push(aSample);
            
            state = S_Initialize;
            break;
    }
}

//-------------------------------------------------------------------
