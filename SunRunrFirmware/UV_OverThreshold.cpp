#include "UV_OverThreshold.h"

UV_OverThreshold::UV_OverThreshold() {
        tick = 0;
        state = S_Initialize;
        UV_DangerLedFlag = false;
}


bool UV_OverThreshold::execute(float UV_Value, float UV_Threshold){
    
    switch (state) {
        case UV_OverThreshold::S_Initialize:
            tick = 0;
            state = S_Wait;
            break;
        case UV_OverThreshold::S_Wait:
            tick++;
            if(tick <= 5){  // wait for 5*0.5sec ~ 3sec to sample uv reading 
                state = S_Wait;
            }
            else {
                state = S_LedNotify;
            }
            break;
        case UV_OverThreshold::S_LedNotify:
            if(UV_Value >= UV_Threshold){
                UV_DangerLedFlag = true;
            }
            else{
                UV_DangerLedFlag = false;
            }
            state = S_Initialize;
    }
    
    return UV_DangerLedFlag;
}