//-------------------------------------------------------------------

#include "ActivitySample.h"
#include "application.h"

//-------------------------------------------------------------------



ActivitySample::ActivitySample() {
   this->longitude = 0.0;
   this->latitude = 0.0;
   this->speed = 0.0;
   this->uv = 0.0;
   this->timeCreated = millis();
}

//-------------------------------------------------------------------

ActivitySample::ActivitySample(float longitude, float latitude, float speed, float uv) {
   this->longitude = longitude;
   this->latitude = latitude;
   this->speed = speed;
   this->uv = uv;
   this->timeCreated = millis();
}

//-------------------------------------------------------------------

float ActivitySample::getLongitude() {
   return longitude;
}

//-------------------------------------------------------------------

float ActivitySample::getLatitude() {
   return latitude;
}

//-------------------------------------------------------------------

float ActivitySample::getSpeed() {
    return speed;
}

//-------------------------------------------------------------------

float ActivitySample::getUV() {
    return uv;
}

//-------------------------------------------------------------------

unsigned long ActivitySample::getTimeCreated() {
    return timeCreated;
}