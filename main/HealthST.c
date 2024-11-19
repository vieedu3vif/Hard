#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
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

// Initialize MQTT with dynamic access token
void mqtt_init(const char *access_token) {
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = MQTT_BROKER_URI,
        .credentials.username = access_token
    };
    
    client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
}

// Connect to MQTT broker
void mqtt_connect() {
    esp_mqtt_client_start(client);
}

// Disconnect from MQTT broker
void mqtt_disconnect() {
    esp_mqtt_client_stop(client);
}

// Send data to ThingsBoard for a specific device
void send_data_to_thingsboard(const char *access_token, const char *node_id, float temperature, float heart_rate, float spo2) {
    mqtt_init(access_token);   // Initialize MQTT client with the specific access token
    mqtt_connect();            // Connect to ThingsBoard with the given token

    char payload[150];
    snprintf(payload, sizeof(payload), "{\"node_id\":\"%s\",\"temperature\":%.2f,\"heart_rate\":%.2f,\"spo2\":%.2f}", node_id, temperature, heart_rate, spo2);

    int msg_id = esp_mqtt_client_publish(client, "v1/devices/me/telemetry", payload, 0, 1, 0);
    if (msg_id != -1) {
        ESP_LOGI(TAG, "Data sent successfully for %s, msg_id=%d, payload=%s", node_id, msg_id, payload);
    } else {
        ESP_LOGE(TAG, "Failed to send data for %s", node_id);
    }

    mqtt_disconnect();   // Disconnect after sending data
}

// LoRa receive task
void lora_receive_task(void *pvParameters) {
    uint8_t buf[256];
    int len;

    // Initialize LoRa
    if (lora_init()) {
        ESP_LOGI(TAG, "LoRa initialized successfully.");
    } else {
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
                ESP_LOGI(TAG, "RSSI: %d, SNR: %.2f", lora_packet_rssi(), lora_packet_snr());

                char node_id[50];
                float temperature, heart_rate, spo2;
                
                // Parse the LoRa data string with node ID
                if (sscanf((char *)buf, "ID: %49[^,], Temp: %f, HR: %f, SpO2: %f", node_id, &temperature, &heart_rate, &spo2) == 4) {
                    ESP_LOGI(TAG, "Parsed data - Node ID: %s, Temperature: %.2f C, Heart Rate: %.2f bpm, SpO2: %.2f%%", node_id, temperature, heart_rate, spo2);
                    
                    // Send parsed data to ThingsBoard for each device
                    if (strcmp(node_id, "NODE_1") == 0) {
                        send_data_to_thingsboard(ACCESS_TOKEN_DEVICE_1, node_id, temperature, heart_rate, spo2);
                    } else if (strcmp(node_id, "NODE_2") == 0) {
                        send_data_to_thingsboard(ACCESS_TOKEN_DEVICE_2, node_id, temperature, heart_rate, spo2);
                    } else {
                        ESP_LOGE(TAG, "Unknown device ID: %s", node_id);
                    }
                } else {
                    ESP_LOGE(TAG, "Data format mismatch: %s", (char *)buf);
                }
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void app_main(void) {
    nvs_flash_init();
    wifi_init();

    xTaskCreate(lora_receive_task, "lora_receive_task", 4096, NULL, 5, NULL);
}
