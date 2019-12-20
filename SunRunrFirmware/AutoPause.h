#ifndef AUTOPAUSE_H
#define AUTOPAUSE_H

using namespace std;

//-------------------------------------------------------------------

class AutoPause {
   enum State { S_Initialize, S_Wait, S_AutoPause };

private:
    State state;
    int tick;
    bool autoPauseFlag;
    
public:
    AutoPause();
    bool execute(float speed, bool buttonPressed);  // return autoPauseFlag
};

//-------------------------------------------------------------------

#endif
