#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_wifi.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_log.h"
#include "mqtt_client.h"
#include "esp_system.h"
#include "esp_netif.h"
#include "lora.h"

// Wi-Fi credentials
#define WIFI_SSID "Việt Anh"
#define WIFI_PASS "25051992"

// ThingsBoard credentials for two devices
#define MQTT_BROKER_URI "mqtt://demo.thingsboard.io:1883"
#define ACCESS_TOKEN_DEVICE_1 "GCw2ijLxooFWzmNtebI5"
#define ACCESS_TOKEN_DEVICE_2 "rytkkFgK9Lx0gM93HHpe"

// LoRa frequency
#define LORA_FREQUENCY 433E6

// Log tag
static const char *TAG = "ThingsBoard";

// Queue to pass data between LoRa and MQTT tasks
static QueueHandle_t lora_queue;

// Struct to hold sensor data
typedef struct {
    char node_id[50];
    float temperature;
    float heart_rate;
    float spo2;
} sensor_data_t;

esp_mqtt_client_handle_t client;

// Initialize Wi-Fi
void wifi_init() {
    esp_netif_init();
    esp_event_loop_create_default();
    esp_netif_create_default_wifi_sta();
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    esp_wifi_init(&cfg);
    esp_wifi_set_mode(WIFI_MODE_STA);

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = WIFI_SSID,
            .password = WIFI_PASS
        }
    };

    esp_wifi_set_config(WIFI_IF_STA, &wifi_config);
    esp_wifi_start();
    esp_wifi_connect();
}

// MQTT event handler
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    if (event_id == MQTT_EVENT_CONNECTED) {
        ESP_LOGI(TAG, "Connected to ThingsBoard");
    } else if (event_id == MQTT_EVENT_DISCONNECTED) {
        ESP_LOGI(TAG, "Disconnected from ThingsBoard");
    }
}

// Initialize MQTT with a specific access token
void mqtt_init(const char *access_token) {
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = MQTT_BROKER_URI,
        .credentials.username = access_token
    };

    client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
}

// Send data to ThingsBoard
void send_data_to_thingsboard(sensor_data_t *data) {
    const char *access_token = strcmp(data->node_id, "NODE_1") == 0 ? ACCESS_TOKEN_DEVICE_1 : ACCESS_TOKEN_DEVICE_2;

    mqtt_init(access_token);
    esp_mqtt_client_start(client);

    char payload[150];
    snprintf(payload, sizeof(payload), "{\"node_id\":\"%s\",\"temperature\":%.2f,\"heart_rate\":%.2f,\"spo2\":%.2f}",
             data->node_id, data->temperature, data->heart_rate, data->spo2);

    int msg_id = esp_mqtt_client_publish(client, "v1/devices/me/telemetry", payload, 0, 1, 0);
    if (msg_id != -1) {
        ESP_LOGI(TAG, "Data sent successfully for %s, msg_id=%d, payload=%s", data->node_id, msg_id, payload);
    } else {
        ESP_LOGE(TAG, "Failed to send data for %s", data->node_id);
    }

    esp_mqtt_client_stop(client);
}

// LoRa receive task
void lora_receive_task(void *pvParameters) {
    uint8_t buf[256];
    int len;

    if (!lora_init()) {
        ESP_LOGE(TAG, "LoRa initialization failed.");
        vTaskDelete(NULL);
        return;
    }

    lora_set_frequency(LORA_FREQUENCY);
    lora_enable_crc();

    while (1) {
        lora_receive();

        if (lora_received()) {
            len = lora_receive_packet(buf, sizeof(buf));
            if (len > 0) {
                buf[len] = '\0';
                ESP_LOGI(TAG, "Received data: %s", (char *)buf);

                sensor_data_t data;
                if (sscanf((char *)buf, "ID: %49[^,], Temp: %f, HR: %f, SpO2: %f", data.node_id, &data.temperature, &data.heart_rate, &data.spo2) == 4) {
                    ESP_LOGI(TAG, "Parsed data - Node ID: %s, Temperature: %.2f C, Heart Rate: %.2f bpm, SpO2: %.2f%%",
                             data.node_id, data.temperature, data.heart_rate, data.spo2);

                    // Send parsed data to the queue
                    if (xQueueSend(lora_queue, &data, pdMS_TO_TICKS(100)) != pdPASS) {
                        ESP_LOGE(TAG, "Failed to send data to queue");
                    }
                } else {
                    ESP_LOGE(TAG, "Data format mismatch: %s", (char *)buf);
                }
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

// MQTT send task
void mqtt_send_task(void *pvParameters) {
    sensor_data_t data;

    while (1) {
        // Wait for data from the queue
        if (xQueueReceive(lora_queue, &data, portMAX_DELAY) == pdPASS) {
            ESP_LOGI(TAG, "Sending data for Node ID: %s", data.node_id);
            send_data_to_thingsboard(&data);
        }
    }
}

void app_main(void) {
    nvs_flash_init();
    wifi_init();

    // Create a queue to hold data from LoRa
    lora_queue = xQueueCreate(10, sizeof(sensor_data_t));
    if (lora_queue == NULL) {
        ESP_LOGE(TAG, "Failed to create queue");
        return;
    }

    // Create tasks
    xTaskCreate(lora_receive_task, "lora_receive_task", 4096, NULL, 5, NULL);
    xTaskCreate(mqtt_send_task, "mqtt_send_task", 4096, NULL, 5, NULL);
}
