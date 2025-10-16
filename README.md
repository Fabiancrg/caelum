[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Fabiancrg)


| Supported Targets | ESP32-C6 | ESP32-H2 |
| ----------------- |  -------- | -------- |

# ACW02-ZB Zigbee Weather Station

[![License: GPL v3](https://img.shields.io/badge/Software-GPLv3-blue.svg)](./LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Hardware-CC%20BY--NC--SA%204.0-green.svg)](./LICENSE-hardware)

# Project Description

This project implements a comprehensive weather monitoring station using ESP32-C6 with Zigbee connectivity. The device is derived from the ZigbeeMultiSensor project and provides real-time environmental monitoring with multiple sensors.This project implements a comprehensive environmental monitoring device using ESP32-C6 with Zigbee connectivity. The device combines multiple sensors and actuators into a single Zigbee end-device with five distinct endpoints.

This project is based on the examples provided in the ESP Zigbee SDK:This project is based on the exmaples provided in the ESP Zigbee SDK :

* [ESP Zigbee SDK Docs](https://docs.espressif.com/projects/esp-zigbee-sdk)* [ESP Zigbee SDK Docs](https://docs.espressif.com/projects/esp-zigbee-sdk)

* [ESP Zigbee SDK Repo](https://github.com/espressif/esp-zigbee-sdk)* [ESP Zigbee SDK Repo](https://github.com/espressif/esp-zigbee-sdk)

## Device Features## Device Features

### 🌐 Zigbee Endpoints Overview### 🌐 Zigbee Endpoints Overview

| Endpoint | Device Type | Clusters | Description || Endpoint | Device Type | Clusters | Description |

|----------|-------------|----------|-------------||----------|-------------|----------|-------------|


| **4** | Environmental Sensor | Temperature, Humidity, Pressure | BME280 sensor via I2C (GPIO 6/7) || **4** | Environmental Sensor | Temperature, Humidity, Pressure | BME280 sensor via I2C (GPIO 6/7) |

| **5** | Rain Gauge | Analog Input | Tipping bucket rain sensor (GPIO 18) with rainfall totals || **5** | Rain Gauge | Analog Input | Tipping bucket rain sensor (GPIO 18) with rainfall totals |



### 📋 Weather Monitoring Capabilities### 📋 Detailed Endpoint Descriptions



#### **Temperature Monitoring** 🌡️#### **Endpoint 1: LED Strip Controller** 

- Range: -40°C to +85°C- **Hardware**: WS2812B-compatible LED strip on GPIO 8

- Accuracy: ±1°C- **Functionality**: Full on/off control with Zigbee integration

- Real-time updates via Zigbee reporting- **Features**: Hardware state tracking, button toggle support

- **Use Case**: Primary lighting control and status indication

#### **Humidity Monitoring** 💧

- Range: 0-100% RH#### **Endpoint 2: GPIO LED Controller**

- Accuracy: ±3% RH- **Hardware**: Standard LED on GPIO 0  

- Automatic dew point calculation- **Functionality**: Simple on/off switching

- **Features**: Independent control from LED strip

#### **Barometric Pressure** ☁️- **Use Case**: Secondary status indicator or backup lighting

- Range: 300-1100 hPa

- Weather trend prediction#### **Endpoint 3: Smart Button Interface**

- Altitude compensation- **Hardware**: Push button on GPIO 12

- **Functionality**: Multi-action detection (single, double, hold, release)

#### **Rainfall Measurement** 🌧️- **Features**: Debounced input, action encoding, press counting

- Tipping bucket sensor support- **Use Case**: User interface for device control and interaction

- Cumulative rainfall tracking

- Configurable reset intervals#### **Endpoint 4: Environmental Monitoring**

- **Hardware**: BME280 sensor via I2C (SDA: GPIO 6, SCL: GPIO 7)

### 🔧 Hardware Requirements- **Measurements**: 

  - 🌡️ **Temperature**: -40°C to +85°C (±1°C accuracy)

- **MCU**: ESP32-C6 or ESP32-H2  - 💧 **Humidity**: 0-100% RH (±3% accuracy) 

- **Environmental Sensor**: BME280 (I2C)  - 🌪️ **Pressure**: 300-1100 hPa (±1 hPa accuracy)

  - SDA: GPIO 6- **Features**: Automatic 30-second reporting, Zigbee-standard units

  - SCL: GPIO 7- **Use Case**: Weather monitoring, HVAC automation, air quality tracking

- **Rain Sensor**: Tipping bucket on GPIO 18

- **LED Strip**: WS2812B on GPIO 8 (optional)#### **Endpoint 5: Rain Gauge System**

- **Status LED**: GPIO 0 (optional)- **Hardware**: Tipping bucket rain gauge on GPIO 18

- **Button**: GPIO 12 (optional)- **Measurements**: Cumulative rainfall in millimeters (0.36mm per tip)

- **Features**: 

### 📊 Zigbee Integration  - Advanced debouncing (200ms + 1000ms bounce settle)

  - Persistent storage (NVS) for total tracking

- **Protocol**: Zigbee 3.0  - Smart reporting (1mm threshold OR hourly)

- **Device Type**: End Device (Router mode available)  - Network-aware operation (only active when connected)

- **Supported Channels**: 11-26 (2.4 GHz)- **Specifications**: 

- **Compatible**: Zigbee2MQTT, Home Assistant ZHA, Hubitat  - Maximum rate: 200mm/hour supported

  - Accuracy: ±0.36mm per bucket tip

### 🚀 Getting Started  - Storage: Non-volatile total persistence across reboots

- **Use Case**: Weather station, irrigation control, flood monitoring

#### Prerequisites

```bash### 🔧 Hardware Configuration

# Install ESP-IDF v5.5.1 or later

git clone -b v5.5.1 --recursive https://github.com/espressif/esp-idf.git#### **Required Components**

cd esp-idf- ESP32-C6 development board

./install.sh esp32c6- BME280 environmental sensor module

. ./export.sh- WS2812B LED strip (at least 1 LED)

```- Standard LED + resistor

- Push button + pull-up resistor  

#### Build and Flash- Tipping bucket rain gauge with reed switch

```bash- Zigbee coordinator (ESP32-H2 or commercial gateway)

cd WeatherStation

idf.py set-target esp32c6#### **Pin Assignments**

idf.py build```

idf.py -p COM_PORT flash monitorGPIO 0  - GPIO LED output

```GPIO 6  - I2C SDA (BME280)

GPIO 7  - I2C SCL (BME280) 

#### First BootGPIO 8  - LED strip data (WS2812B)

1. Device will create a Zigbee network or join existing oneGPIO 9  - Built-in button (factory reset)

2. LED indicators show connection statusGPIO 12 - External button input

3. Long-press button (5s) for factory resetGPIO 18 - Rain gauge input (reed switch)

```

### 📡 Data Reporting

## 🚀 Quick Start

- **Temperature/Humidity**: Every 30 seconds or on significant change

- **Pressure**: Every 60 seconds### Configure the Project

- **Rainfall**: Immediate on tip detection```bash

- **Button Events**: Immediate (single, double, hold, release)idf.py set-target esp32c6

idf.py menuconfig

### 🏠 Home Assistant Integration```



The device appears as a Zigbee climate sensor with:### Build and Flash

- Temperature sensor```bash

- Humidity sensor# Erase previous data (recommended for first flash)

- Pressure sensoridf.py -p [PORT] erase-flash

- Rainfall sensor

- LED controls# Build and flash the project

- Button entityidf.py -p [PORT] flash monitor

```

### 🛠️ Configuration

### Device Operation

Key parameters can be adjusted in `main/esp_zb_light.h`:

- Reporting intervals#### **Button Controls**

- Sensor calibration offsets- **Built-in Button (GPIO 9)**:

- Rain tip bucket volume  - Short press: Toggle LED strip on/off

- LED behavior  - Long press (hold): Factory reset device

- **External Button (GPIO 12)**: 

### 📝 Project Structure  - Reports all actions (single, double, hold, release) to Zigbee



```#### **Automatic Features**

WeatherStation/- Environmental data reported every 30 seconds

├── main/- Rain gauge totals stored persistently  

│   ├── esp_zb_light.c       # Main Zigbee stack logic- Smart rainfall reporting (1mm increments or hourly)

│   ├── esp_zb_light.h       # Configuration and headers- Network connection status monitoring

│   ├── bme280_app.c         # BME280 sensor driver

│   ├── bme280_app.h         # BME280 interface## 📊 Example Output

│   ├── light_driver.c       # LED strip and GPIO control

│   └── light_driver.h       # Light driver interface### Device Initialization

├── CMakeLists.txt           # Build configuration```

├── sdkconfig.defaults       # Default SDK settingsI (403) app_start: Starting scheduler on CPU0

└── README.md                # This fileI (408) ESP_ZB_ON_OFF_LIGHT: Initialize Zigbee stack

```I (558) ESP_ZB_ON_OFF_LIGHT: Deferred driver initialization successful

I (568) ESP_ZB_ON_OFF_LIGHT: BME280 sensor initialized successfully

### 🔄 Based OnI (578) ESP_ZB_ON_OFF_LIGHT: Rain gauge initialized successfully. Current total: 0.00 mm

I (578) ESP_ZB_ON_OFF_LIGHT: Start network steering

This project is derived from the ESP32 Zigbee Multi-Sensor Device project and inherits its multi-endpoint architecture optimized for weather station applications.```



### 📄 License### Network Connection

```

This project follows the license terms of the ESP Zigbee SDK.I (3558) ESP_ZB_ON_OFF_LIGHT: Joined network successfully (Extended PAN ID: 74:4d:bd:ff:fe:63:f7:30, PAN ID: 0x13af, Channel:13, Short Address: 0x7c16)

I (3568) RAIN_GAUGE: Rain gauge enabled - device connected to Zigbee network

### 🤝 Contributing```



Contributions are welcome! Please feel free to submit issues or pull requests.### Sensor Data Reporting

```

### 💖 SupportI (30000) ESP_ZB_ON_OFF_LIGHT: 🌡️ Temperature: 22.35°C reported to Zigbee  

I (30010) ESP_ZB_ON_OFF_LIGHT: 💧 Humidity: 45.20% reported to Zigbee

If you find this project useful, consider supporting the development:I (30020) ESP_ZB_ON_OFF_LIGHT: 🌪️ Pressure: 1013.25 hPa reported to Zigbee

I (30030) ESP_ZB_ON_OFF_LIGHT: 📡 Temp: 22.4°C

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Fabiancrg)I (30040) ESP_ZB_ON_OFF_LIGHT: 📡 Humidity: 45.2%

I (30050) ESP_ZB_ON_OFF_LIGHT: 📡 Pressure: 1013.3 hPa
```

### Button Interactions  
```
I (45000) ESP_ZB_ON_OFF_LIGHT: 🔘 External button action detected: single
I (45010) ESP_ZB_ON_OFF_LIGHT: ✅ Button action single sent (encoded: 1001.0) - press #1
I (45020) ESP_ZB_ON_OFF_LIGHT: 📡 Button: single (#1)
```

### Rain Gauge Activity
```  
I (60000) RAIN_GAUGE: 🔍 Rain gauge interrupt received on GPIO18 (enabled: YES)
I (60010) RAIN_GAUGE: 🌧️ Rain pulse #1 detected! Total: 0.36 mm (+0.36 mm)
I (60020) RAIN_GAUGE: ✅ Rainfall total 0.36 mm reported to Zigbee
I (60030) ESP_ZB_ON_OFF_LIGHT: 📡 Rain: 0.36 mm
```

## 🏠 Home Assistant Integration

When connected to Zigbee2MQTT or other Zigbee coordinators, the device appears as:

- **2x Switch entities**: LED Strip & GPIO LED control
- **1x Sensor entity**: Button actions with press counter
- **3x Sensor entities**: Temperature, Humidity, Pressure  
- **1x Sensor entity**: Rainfall total with automatic updates

### Device Information
- **Manufacturer**: ESPRESSIF
- **Model**: esp32c6  
- **Firmware**: v5.5.1
- **Supported**: Automatic device detection in Zigbee2MQTT

## 🔧 Troubleshooting

### Common Issues

#### **Rain Gauge Not Detecting**
- Verify GPIO 18 connections and reed switch operation
- Check that device is connected to Zigbee network (rain gauge only active when connected)
- Ensure proper pull-down resistor on rain gauge input

#### **BME280 Not Reading**  
- Check I2C connections (SDA: GPIO 6, SCL: GPIO 7)
- Verify BME280 I2C address (default: 0x76 or 0x77)
- Ensure proper power supply to sensor (3.3V)

#### **Button Not Responding**
- Verify button connections and pull-up resistors
- Check GPIO 12 (external) and GPIO 9 (built-in) functionality
- Ensure proper debouncing in hardware

#### **Zigbee Connection Issues**
- Perform factory reset with long press on built-in button
- Ensure Zigbee coordinator is in pairing mode
- Check channel compatibility between coordinator and device

### 📋 Development Notes

- **ESP-IDF Version**: v5.5.1 recommended
- **Zigbee SDK**: Latest ESP Zigbee SDK required  
- **Memory Usage**: ~2MB flash, ~200KB RAM typical
- **Power Consumption**: ~100mA active, supports deep sleep for battery operation

### 🆘 Support

For technical queries, please open an [issue](https://github.com/espressif/esp-idf/issues) on GitHub. Include:
- Complete serial monitor output
- Hardware configuration details  
- ESP-IDF and SDK versions
- Specific symptoms and reproduction steps

---

**Project**: ESP32 Zigbee Multi-Sensor Device  
**Version**: v1.0  
**Compatible**: ESP32-C6, ESP-IDF v5.5.1+  
**License**: Apache 2.0
