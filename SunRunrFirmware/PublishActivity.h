#ifndef PUBLISH_ACTIVITY_H
#define PUBLISH_ACTIVITY_H

//-------------------------------------------------------------------

#include <AssetTracker.h>
#include <queue>
#include "ActivitySample.h"
#include <math.h>

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

class PublishActivity {
   enum State { S_Wait, S_WifiCheck, S_Publish, S_DropActivity };

private:
    State state;
    int tick;
    AssetTracker& gpsSensor;
    queue<ActivitySample>& activitySamples;

public:
    PublishActivity(AssetTracker &theTracker, queue<ActivitySample>& sampleQueue);
    void execute(float AccoumulatedUV);
};

//-------------------------------------------------------------------

#endif
