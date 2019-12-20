#ifndef RECORD_ACTIVITY_H
#define RECORD_ACTIVITY_H

//-------------------------------------------------------------------

#include <AssetTracker.h>
#include "ActivitySample.h"
#include <queue>

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

class RecordActivity {
   enum State { S_Initialize, S_Wait, S_RecordActivity };

private:
    State state;
    int tick;
    queue<ActivitySample>& activitySample;

public:
    RecordActivity(queue<ActivitySample>& activityQueue);
    void execute(bool paused, bool buttonPressed, AssetTracker& gpsSensor, float uv_reading);
};

//-------------------------------------------------------------------

#endif
