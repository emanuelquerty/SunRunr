#include "AutoPause.h""


//-------------------------------------------------------------------

AutoPause::AutoPause() {
        tick = 0;
        state = S_Initialize;
        autoPauseFlag = false;
}


bool AutoPause::execute(float speed, bool buttonPressed){
    
    switch (state) {
        case AutoPause::S_Initialize:
            tick = 0;
            autoPauseFlag = false;
            if(speed != 0){
                state = S_Initialize;
            }
            else{
                state = S_Wait;
            }
            break;
        case AutoPause::S_Wait:
            tick++;
            if(speed != 0 || !buttonPressed){
                state = S_Initialize;
            }
            else if(tick <= 60){    // 30 seconds for a loop delay of 500ms==0.5sec
                state = S_Wait;
            }   
            else {  // means that 0 speed for more than 30sec
                state = S_AutoPause;
            }
            break;
        case AutoPause::S_AutoPause:
            autoPauseFlag = true;
            if(speed == 0 && buttonPressed){
                state = S_AutoPause;
            }
            else{
                state = S_Initialize;
            }
    }
    return autoPauseFlag;
}
