#ifndef ACTIVITY_SAMPLE_H
#define ACTIVITY_SAMPLE_H

//-------------------------------------------------------------------

class ActivitySample {

private:
    float longitude;
    float latitude;
    float speed;
    float uv;
    unsigned long timeCreated;

public:
    ActivitySample();    
    ActivitySample(float longitude, float latitude, float speed, float uv);
    float getLongitude();
    float getLatitude();
    float getSpeed();
    float getUV();
    unsigned long getTimeCreated();
};

//-------------------------------------------------------------------

#endif
