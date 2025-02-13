#ifndef MLX90614_H
#define MLX90614_H

#include "driver/i2c.h"
#include "esp_err.h"

#define MLX90614_REG_TOBJ1 0x07

esp_err_t mlx90614_init(i2c_port_t i2c_num);
esp_err_t mlx90614_read_temp_c(i2c_port_t i2c_num, float *temperature);
esp_err_t mlx90614_read_temp_f(i2c_port_t i2c_num, float *temperature);

#endif // MLX90614_H
