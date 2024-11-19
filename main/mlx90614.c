#include "mlx90614.h"

esp_err_t mlx90614_init(i2c_port_t i2c_num) {
    // Đã có hàm khởi tạo I2C trong esp-idf, chỉ cần cấu hình I2C.
    return ESP_OK;
}

esp_err_t mlx90614_read_temp_c(i2c_port_t i2c_num, float *temperature) {
    uint8_t data[2];
    esp_err_t err;
    
    i2c_cmd_handle_t cmd = i2c_cmd_link_create();
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (0x5A << 1) | I2C_MASTER_WRITE, true); // Địa chỉ MLX90614
    i2c_master_write_byte(cmd, MLX90614_REG_TOBJ1, true); // Đọc nhiệt độ đối tượng
    i2c_master_start(cmd);
    i2c_master_write_byte(cmd, (0x5A << 1) | I2C_MASTER_READ, true);
    i2c_master_read(cmd, data, 2, I2C_MASTER_LAST_NACK);
    i2c_master_stop(cmd);
    err = i2c_master_cmd_begin(i2c_num, cmd, 1000 / portTICK_PERIOD_MS);
    i2c_cmd_link_delete(cmd);
    
    if (err != ESP_OK) return err;

    uint16_t raw = (data[1] << 8) | data[0];
    *temperature = (raw * 0.02) - 273.15; // Chuyển đổi sang độ Celsius
    return ESP_OK;
}

esp_err_t mlx90614_read_temp_f(i2c_port_t i2c_num, float *temperature) {
    float temp_c;
    esp_err_t err = mlx90614_read_temp_c(i2c_num, &temp_c);
    if (err != ESP_OK) return err;
    *temperature = (temp_c * 9 / 5) + 32; // Chuyển đổi từ Celsius sang Fahrenheit
    return ESP_OK;
}
