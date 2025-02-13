#include "max30102.h"


int16_t IR_AC_Max = 20;
int16_t IR_AC_Min = -20;
int16_t IR_AC_Signal_Current = 0;
int16_t IR_AC_Signal_Previous;
int16_t IR_AC_Signal_min = 0;
int16_t IR_AC_Signal_max = 0;
int16_t IR_Average_Estimated;
int16_t positiveEdge = 0;
int16_t negativeEdge = 0;
int32_t ir_avg_reg = 0;
int16_t cbuf[32];
uint8_t offset = 0;


static const uint16_t FIRCoeffs[12] = {172, 321, 579, 927, 1360, 1858, 2390, 2916, 3391, 3768, 4012, 4096};

float heart_rate_buffer[120];
int buffer_index = 0;

bool buffer_full = false;

#define FreqS 25
#define BUFFER_SIZE (FreqS * 4)
#define MA4_SIZE 4
const uint8_t uch_spo2_table[184] = {96, 95, 96, 96, 96, 96, 97, 97, 97, 97, 97, 96, 98, 96, 98, 98, 98, 98, 97, 97, 
                                      97, 97, 97, 97, 96, 98, 97, 96, 97, 97, 96, 96, 98, 98, 97, 96, 96, 98, 97, 97, 
                                      98, 96, 95, 98, 98, 98, 96, 98, 96, 98, 97, 98, 98, 98, 98, 98, 98, 98, 97, 97, 
                                      97, 97, 96, 96, 96, 96, 95, 95, 95, 94, 94, 94, 93, 93, 93, 92, 92, 92, 91, 91, 
                                      90, 90, 89, 89, 89, 88, 88, 87, 87, 86, 86, 85, 85, 84, 84, 83, 82, 82, 81, 81, 
                                      80, 80, 79, 78, 78, 77, 76, 76, 75, 74, 74, 73, 72, 72, 71, 70, 69, 69, 68, 67, 
                                      66, 66, 65, 64, 63, 62, 62, 61, 60, 59, 58, 57, 56, 56, 55, 54, 53, 52, 51, 50, 
                                      49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 31, 30, 29, 
                                      28, 27, 26, 25, 23, 22, 21, 20, 19, 17, 16, 15, 14, 12, 11, 10, 9, 7, 6, 5, 
                                      3, 2, 1};
                                                                         

static int32_t an_x[BUFFER_SIZE]; // ir
static int32_t an_y[BUFFER_SIZE]; // red

esp_err_t max30102_init(i2c_port_t i2c_num) {
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (MAX30102_ADDRESS << 1) | I2C_MASTER_WRITE, true);

    i2c_master_write_byte(cmd, MAX30102_REG_MODE_CONFIG, true);
    i2c_master_write_byte(cmd, 0x03, true); 

    i2c_master_write_byte(cmd, MAX30102_REG_SPO2_CONFIG, true);
    i2c_master_write_byte(cmd, 0x27, true); 


    i2c_master_write_byte(cmd, MAX30102_REG_LED1_PA, true);
    i2c_master_write_byte(cmd, 0x24, true); 
    i2c_master_write_byte(cmd, MAX30102_REG_LED2_PA, true);
    i2c_master_write_byte(cmd, 0x24, true); 

    i2c_master_stop(cmd);
    esp_err_t ret = i2c_master_cmd_begin(i2c_num, cmd, 1000 / portTICK_PERIOD_MS);
    i2c_cmd_link_delete(cmd);
    
    return ret;
}

esp_err_t max30102_read_data(i2c_port_t i2c_num, uint32_t *ir_data, uint32_t *red_data) {
    uint8_t data[6];
    
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (MAX30102_ADDRESS << 1) | I2C_MASTER_WRITE, true);
    i2c_master_write_byte(cmd, MAX30102_REG_FIFO_DATA, true);
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (MAX30102_ADDRESS << 1) | I2C_MASTER_READ, true);
    i2c_master_read(cmd, data, 6, I2C_MASTER_LAST_NACK);
    i2c_master_stop(cmd);
    esp_err_t ret = i2c_master_cmd_begin(i2c_num, cmd, 1000 / portTICK_PERIOD_MS);
    i2c_cmd_link_delete(cmd);

    if (ret != ESP_OK) {
        return ret;
    }

    *red_data = ((uint32_t)data[0] << 16) | ((uint32_t)data[1] << 8) | data[2];
    *ir_data = ((uint32_t)data[3] << 16) | ((uint32_t)data[4] << 8) | data[5];

    return ESP_OK;
}

// Function to calculate heart rate based on PBA Algorithm
bool checkForBeat(int32_t sample) {
    bool beatDetected = false;

    // Apply DC averaging
    IR_Average_Estimated = averageDCEstimator(&ir_avg_reg, sample);
    IR_AC_Signal_Current = sample - IR_Average_Estimated;

    // Detect beat
    if ((IR_AC_Signal_Previous < 0) && (IR_AC_Signal_Current >= 0)) {
        IR_AC_Max = IR_AC_Signal_max;
        IR_AC_Min = IR_AC_Signal_min;
        positiveEdge = 1;
        negativeEdge = 0;
        IR_AC_Signal_max = 0;

        if ((IR_AC_Max - IR_AC_Min) > 20 && (IR_AC_Max - IR_AC_Min) < 1000) {
            beatDetected = true;
        }
    }

    if ((IR_AC_Signal_Previous > 0) && (IR_AC_Signal_Current <= 0)) {
        positiveEdge = 0;
        negativeEdge = 1;
        IR_AC_Signal_min = 0;
    }

    if (positiveEdge && (IR_AC_Signal_Current > IR_AC_Signal_max)) {
        IR_AC_Signal_max = IR_AC_Signal_Current;
    }

    if (negativeEdge && (IR_AC_Signal_Current < IR_AC_Signal_min)) {
        IR_AC_Signal_min = IR_AC_Signal_Current;
    }

    IR_AC_Signal_Previous = IR_AC_Signal_Current;

    return beatDetected;
}

float max30102_calculate_heart_rate(uint32_t ir_data) {
    if (ir_data < 1000000) return 0;
    else {
    static uint32_t lastBeatTime = 0;
    static float beatsPerMinute = 0;
    
    int16_t filteredData = lowPassFIRFilter((int16_t)ir_data);

    if (checkForBeat(filteredData)) {
        uint32_t currentTime = xTaskGetTickCount() * portTICK_PERIOD_MS;                                                                                                                                 
        
        uint32_t timeDifference = currentTime - lastBeatTime;
        lastBeatTime = currentTime;
        if (timeDifference > 300 ) {
            beatsPerMinute = 60000.0f / (float)timeDifference;
            heart_rate_buffer[buffer_index] = beatsPerMinute;
            buffer_index = (buffer_index + 1) % 120;
            if (buffer_index == 0) {
                buffer_full = true;
            }
        }
    }

    // Calculate average heart rate
    float sum = 0.0f;
    int count = buffer_full ? 120 : buffer_index;
    for (int i = 0; i < count; i++) {
        sum += heart_rate_buffer[i];
    }
    
    return (count > 0) ? (sum / count) : 0;
    }
}

float max30102_calculate_spo2(uint32_t ir_data, uint32_t red_data) {
    // Avoid division by zero
    if (ir_data == 0 || red_data < 10000) {
        return 0.0f;
    }

    float ratio = (float)red_data / (float)ir_data;

    int index = (int)(ratio * 183.0f); 
    
    // Ensure index is within bounds
    index = (index < 0) ? 0 : (index > 183) ? 183 : index;

    int spo2 = uch_spo2_table[index];

    return (float)spo2;
}
int16_t averageDCEstimator(int32_t *p, uint16_t x) {
    *p += (((long)x << 15) - *p) >> 4;
    return (*p >> 15);
}

// Low-pass FIR filter for heart rate calculation
int16_t lowPassFIRFilter(int16_t din) {
    cbuf[offset] = din;

    int32_t z = 0;
    for (uint8_t i = 0; i < 12; i++) {
        z += (int32_t)cbuf[(offset - i) & 0x1F] * FIRCoeffs[i];
    }

    offset++;
    offset %= 32; // Circular buffer offset
    return (z >> 15);
}