# HeathST - Telehealth Solution for remote areas

## Introduction

This project is an IOT system use some sensors and ESP32 MCU for hardware architecture.

Hardware of this project is divide to some Node and a Gateway for send- receive LoRa signal.
Software was develop by React-Native framework.
Database uses Thingsboard IoT platform.

## Hardware architecture

At the Node:

- MCU ESp32
- Temperature sensor MLX90614
- Heart rate and SpO2 MAX30102
- Module LoRa SX1278 Ra02
- OLED SSD1306

At the Gateway:

- MCU ESP32
- Module LoRa SX1278 Ra02

Config LoRa signal

- Bandwidth 125kHz
- Frequency 433MHz
