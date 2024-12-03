#ifndef MAX30102_H
#define MAX30102_H

#include "driver/i2c.h"
#include "esp_err.h"

// Define I2C Address of the MAX30102
#define MAX30102_ADDRESS 0x57

// Register addresses
#define MAX30102_REG_INT_STATUS  0x00
#define MAX30102_REG_FIFO_DATA   0x07
#define MAX30102_REG_MODE_CONFIG 0x09
#define MAX30102_REG_SPO2_CONFIG 0x0A
#define MAX30102_REG_LED1_PA     0x0C
#define MAX30102_REG_LED2_PA     0x0D

// Function prototypes
esp_err_t max30102_init(i2c_port_t i2c_num);
esp_err_t max30102_read_data(i2c_port_t i2c_num, uint32_t *ir_data, uint32_t *red_data);
float max30102_calculate_heart_rate(uint32_t ir_data);
float max30102_calculate_spo2(uint32_t ir_data, uint32_t red_data);

// New function prototypes for heart rate calculation
bool checkForBeat(int32_t sample);
int16_t averageDCEstimator(int32_t *p, uint16_t x);
int16_t lowPassFIRFilter(int16_t din);

#endif // MAX30102_H