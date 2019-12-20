#ifndef UV_OVER_THRESHOLD_H
#define UV_OVER_THRESHOLD_H

//-------------------------------------------------------------------

// #include <AssetTracker.h>
// #include <Adafruit_VEML6070.h>

//-------------------------------------------------------------------

using namespace std;

//-------------------------------------------------------------------

class UV_OverThreshold {
   enum State { S_Initialize, S_Wait, S_LedNotify };

private:
    State state;
    int tick;
    bool UV_DangerLedFlag;
    
public:
    UV_OverThreshold();
    bool execute(float UV_Value, float UV_Threshold);   // returns UV_DangerLedFlag
};

//-------------------------------------------------------------------

#endif
