[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Fabiancrg)

| Supported Targets | ESP32-C6 | ESP32-H2 |
| ----------------- |  -------- | -------- |

# Caelum - Zigbee Weather Station

[![License: GPL v3](https://img.shields.io/badge/Software-GPLv3-blue.svg)](./LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Hardware-CC%20BY--NC--SA%204.0-green.svg)](./LICENSE-hardware)

## Project Description

This project implements a battery-powered environmental monitoring device using ESP32-C6/H2 with Zigbee connectivity. The device features a 3-endpoint design with remote sleep configuration, optimized for low-power operation with deep sleep support and extended wake time during network join.

This project is based on the examples provided in the ESP Zigbee SDK:

* [ESP Zigbee SDK Docs](https://docs.espressif.com/projects/esp-zigbee-sdk)
* [ESP Zigbee SDK Repo](https://github.com/espressif/esp-zigbee-sdk)

## Device Features

### 🌐 Zigbee Endpoints Overview

| Endpoint | Device Type | Clusters | Description |
|----------|-------------|----------|-------------|
| **1** | Environmental Sensor | Temperature, Humidity, Pressure | BME280 sensor via I2C |
| **2** | Rain Gauge | Analog Input | Tipping bucket rain sensor with rainfall totals |
| **3** | Sleep Configuration | Analog Input | Remote sleep duration control (60-7200 seconds) |

### 📋 Detailed Endpoint Descriptions

#### **Endpoint 1: Environmental Monitoring & Power Management**
- **Hardware**: BME280 sensor via I2C
  - **ESP32-H2**: SDA: GPIO10, SCL: GPIO11
  - **ESP32-C6**: SDA: GPIO6, SCL: GPIO7
- **Measurements**: 
  - 🌡️ **Temperature**: -40°C to +85°C (±1°C accuracy)
  - 💧 **Humidity**: 0-100% RH (±3% accuracy) 
  - 🌪️ **Pressure**: 300-1100 hPa (±1 hPa accuracy)
  - 🔋 **Battery Monitoring**: Li-Ion voltage (2.7V-4.2V) and percentage
- **Battery Monitoring**:
  - **Hardware**: GPIO4 (ADC1_CH4) with voltage divider (2x 100kΩ resistors)
  - **Voltage**: Real-time battery voltage in 0.1V units
  - **Percentage**: Battery level 0-100% based on Li-Ion discharge curve
  - **Calibration**: ESP32-H2 ADC correction factor (1.604x) for accurate readings
  - **Power Configuration Cluster**: Standard Zigbee battery attributes
  - **Optimized Reading**: 
    - Time-based hourly intervals (3600 seconds) with NVS persistence
    - 3 ADC samples (reduced from 10) for ~70% ADC power savings
    - No delays between samples for ~90% overhead reduction
    - Total battery monitoring power: ~12µAh/day (98% reduction from ~480µAh/day)
    - Always reports on first boot/pairing, then hourly regardless of wake frequency
- **Features**: Automatic reporting during wake cycles, Zigbee-standard units
- **Use Case**: Weather monitoring, HVAC automation, air quality tracking, battery-powered applications

#### **Endpoint 2: Rain Gauge System**
- **Hardware**: Tipping bucket rain gauge with reed switch
  - **ESP32-H2**: GPIO12 (RTC-capable for sleep wake-up)
  - **ESP32-C6**: GPIO5 (RTC-capable for sleep wake-up)
- **Measurements**: Cumulative rainfall in millimeters (0.36mm per tip)
- **Features**: 
  - Advanced debouncing (200ms + 1000ms bounce settle)
  - Persistent storage (NVS) for total tracking
  - Smart reporting (1mm threshold OR hourly)
  - Network-aware operation (only active when connected)
  - **Both targets**: Wake from deep sleep on rain detection
  - **Time-based hourly reading**: Uses NVS persistence to ensure true 1-hour intervals regardless of wake frequency
- **Specifications**: 
  - Maximum rate: 200mm/hour supported
  - Accuracy: ±0.36mm per bucket tip
  - Storage: Non-volatile total persistence across reboots
  - Rain-proof interval tracking: Hourly battery reading even during frequent rain events
- **Use Case**: Weather station, irrigation control, flood monitoring

#### **Endpoint 3: Sleep Configuration**
- **Hardware**: Software-only (virtual endpoint)
- **Control**: Sleep duration in seconds (60-7200s range)
- **Features**:
  - Remote configuration via Zigbee2MQTT or Home Assistant
  - Persistent storage (NVS) - survives reboots
  - Real-time updates - changes apply on next wake cycle
  - Default: 900 seconds (15 minutes)
- **Use Case**: 
  - Battery optimization (longer intervals = longer battery life)
  - Seasonal adjustments (frequent updates in rainy season)
  - Dynamic power management based on weather conditions

### 🔧 Hardware Configuration

#### **Required Components**
- ESP32-C6 or ESP32-H2 development board
- BME280 environmental sensor module
- Tipping bucket rain gauge with reed switch
- Li-Ion battery (with protection circuit, 5V output recommended)
- Voltage divider (2x 100kΩ resistors for battery monitoring)
- Zigbee coordinator (ESP32-H2 or commercial gateway)

#### **Pin Assignments**

**ESP32-H2 (Recommended)**
```
GPIO 4  - Battery voltage input (ADC1_CH4 with voltage divider)
GPIO 10 - I2C SDA (BME280)
GPIO 11 - I2C SCL (BME280) 
GPIO 12 - Rain gauge input (RTC-capable)*
GPIO 9  - Built-in button (factory reset)
```

**ESP32-C6**
```
GPIO 4  - Battery voltage input (ADC1_CH4 with voltage divider)
GPIO 5  - Rain gauge input (RTC-capable)*
GPIO 6  - I2C SDA (BME280)
GPIO 7  - I2C SCL (BME280) 
GPIO 9  - Built-in button (factory reset)
```

*Both targets now use RTC-capable GPIO pins for rain detection during deep sleep

**Battery Voltage Divider Circuit**
```
Battery+ ──┬── 100kΩ ──┬── 100kΩ ── GND
           │           │
           │           └── GPIO4 (ADC input)
           │
           └── 5V output (to ESP32 power)
```
Note: Voltage divider monitors the cell voltage (2.7V-4.2V) while the battery pack provides 5V regulated output

### � Zigbee Integration
- **Protocol**: Zigbee 3.0  
- **Device Type**: End Device (sleepy end device for battery operation)
- **Supported Channels**: 11-26 (2.4 GHz)
- **Compatible**: Zigbee2MQTT, Home Assistant ZHA, Hubitat
- **OTA Support**: Over-the-air firmware updates enabled (see [OTA_GUIDE.md](OTA_GUIDE.md))

### ⚡ Power Management
- **Deep Sleep Mode**: Configurable intervals (60-7200 seconds, default 15 minutes)
  - **Configurable via Zigbee2MQTT**: Adjust sleep duration remotely from Home Assistant
  - **Connected**: Uses configured interval (default 15 minutes)
  - **Disconnected**: 30-second intervals for quick reconnection
  - **Max retries**: After 20 attempts (10 minutes), reduces to half configured duration
  - **Extended wake time**: Device stays awake for 60 seconds when not connected (instead of 10s) to allow Zigbee join process to complete
- **Wake-up Sources**:
  - Timer (configurable 60-7200 seconds)
  - **Rain detection during deep sleep** (both targets support RTC wake-up)
    - **ESP32-H2**: GPIO12 (RTC-capable)
    - **ESP32-C6**: GPIO5 (RTC-capable)
- **Network Retry Logic**: 
  - Prevents deep sleep when not connected to ensure reliable pairing
  - Extended 60-second wake period for join process completion
  - Connection success triggers 15-second reporting window before sleep
- **Battery Life**: Optimized for extended operation on battery power
  - **Total Power Consumption**: ~230µAh/day (optimized from ~700µAh/day)
  - **Battery monitoring**: ~12µAh/day (hourly readings with time-based intervals)
  - **Deep sleep**: 7-10µA baseline
  - **Active time**: ~100mA during 15-minute wake cycles
- **Battery Estimate**: 
  - **2500mAh battery**: ~10.9 years (optimized from ~3.5 years)
  - **Optimization breakdown**: 
    - 3 ADC samples instead of 10 (70% ADC power savings)
    - No delays between samples (90% overhead reduction)
    - Time-based hourly intervals (vs. every wake cycle)
    - Total battery monitoring: 98% power reduction

## 🚀 Quick Start

### Prerequisites

```bash
# Install ESP-IDF v5.5.1 or later
git clone -b v5.5.1 --recursive https://github.com/espressif/esp-idf.git
cd esp-idf
# For ESP32-H2 (recommended)
./install.sh esp32h2
# For ESP32-C6
./install.sh esp32c6
. ./export.sh
```

### Configure the Project
```bash
# For ESP32-H2 (recommended for better power management)
idf.py set-target esp32h2
# For ESP32-C6  
idf.py set-target esp32c6
idf.py menuconfig
```

### Build and Flash
```bash
# Erase previous data (recommended for first flash)
idf.py -p [PORT] erase-flash

# Build and flash the project
idf.py -p [PORT] flash monitor
```

### 🛠️ Configuration

### Device Operation

#### **Factory Reset**
- **Built-in Button (GPIO 9)**:
  - Long press (5s): Factory reset device

#### **Automatic Features**
- Environmental data reported during wake cycles
- Rain gauge totals stored persistently in NVS
- Smart rainfall reporting (1mm increments or hourly)
- Network connection status monitoring
- Deep sleep after data reporting (15-second window when connected, 60 seconds when not connected)
- Sleep duration remotely configurable via Zigbee2MQTT (60-7200 seconds)

### 📡 Data Reporting
- **Temperature/Humidity/Pressure**: Reported during wake cycles
- **Rainfall**: Immediate on tip detection (>1mm) or hourly
- **Sleep Duration**: Configurable 60-7200 seconds (default 15 minutes)
- **Sleep Cycle**: Configurable via Endpoint 3 for battery optimization

## 📊 Example Output

### Device Initialization
```
I (403) app_start: Starting scheduler on CPU0
I (408) WEATHER_STATION: Initialize Zigbee stack
I (558) WEATHER_STATION: Deferred driver initialization successful
I (568) WEATHER_STATION: BME280 sensor initialized successfully
I (578) WEATHER_STATION: Rain gauge initialized. Current total: 0.00 mm
I (578) WEATHER_STATION: Start network steering
```

### Network Connection
```
I (3558) WEATHER_STATION: Joined network successfully (Extended PAN ID: 74:4d:bd:ff:fe:63:f7:30, PAN ID: 0x13af, Channel:13, Short Address: 0x7c16)
I (3568) RAIN_GAUGE: Rain gauge enabled - device connected to Zigbee network
```

### Sensor Data Reporting
```
I (8000) WEATHER_STATION: 🌡️ Temperature: 22.35°C reported to Zigbee  
I (8010) WEATHER_STATION: 💧 Humidity: 45.20% reported to Zigbee
I (8020) WEATHER_STATION: 🌪️ Pressure: 1013.25 hPa reported to Zigbee
I (8030) BATTERY: 🔋 Li-Ion Battery: 4.17V (98%) - Zigbee values: 41 (0.1V), 196 (%*2)
I (8040) WEATHER_STATION: 📡 Temp: 22.4°C
I (8050) WEATHER_STATION: 📡 Humidity: 45.2%
I (8060) WEATHER_STATION: 📡 Pressure: 1013.3 hPa
```

### Rain Gauge Activity
```  
I (10000) RAIN_GAUGE: 🔍 Rain gauge interrupt received on GPIO18 (enabled: YES)
I (10010) RAIN_GAUGE: 🌧️ Rain pulse #1 detected! Total: 0.36 mm (+0.36 mm)
I (10020) RAIN_GAUGE: ✅ Rainfall total 0.36 mm reported to Zigbee
I (10030) WEATHER_STATION: 📡 Rain: 0.36 mm
```

### Deep Sleep Entry
```
I (18000) WEATHER_STATION: ⏳ Preparing for deep sleep...
I (18010) WEATHER_STATION: 💤 Entering deep sleep for 900 seconds (15 minutes)
```

## 🏠 Home Assistant Integration

When connected to Zigbee2MQTT or other Zigbee coordinators, the device appears as:

- **4x Sensor entities**: Temperature, Humidity, Pressure, Battery Percentage
- **1x Sensor entity**: Battery Voltage (mV)
- **1x Sensor entity**: Rainfall total with automatic updates
- **1x Number entity**: Sleep duration control (60-7200 seconds)

### Zigbee2MQTT Integration

A custom external converter is provided for full feature support with Zigbee2MQTT. See [ZIGBEE2MQTT_CONVERTER.md](ZIGBEE2MQTT_CONVERTER.md) for:
- Converter installation instructions
- Multi-endpoint support configuration
- Sleep duration control setup
- Home Assistant automation examples

### Device Information
- **Manufacturer**: ESPRESSIF
- **Model**: caelum
- **Firmware Version**: Managed via CMakeLists.txt (PROJECT_VER, BUILD_NUMBER)
  - Generated header approach using `version.h.in` template
  - Single source of truth for all version macros
  - Automatically propagated to Zigbee Basic cluster attributes
- **Supported**: Zigbee2MQTT with custom external converter (`caelum-weather-station.js`)

## 🔧 Configuration

### Version Management

Version information is centrally managed in `CMakeLists.txt`:

```cmake
set(PROJECT_VER "1.0")           # Major.Minor version
set(BUILD_NUMBER 0)              # Build/patch number
```

The build system automatically:
- Generates `build/generated/version.h` from `version.h.in` template
- Populates all version macros (FW_VERSION, FW_DATE_CODE, OTA_FILE_VERSION, etc.)
- Propagates to Zigbee Basic cluster (swBuildId, dateCode, applicationVersion)
- Updates OTA cluster attributes for firmware update tracking

### Application Configuration

Key parameters can be adjusted in `main/esp_zb_weather.h`:
- Default sleep duration: 900 seconds (15 minutes) - can be changed via Endpoint 3
- Sleep duration range: 60-7200 seconds (1 minute to 2 hours)
- Network retry interval: 30 seconds when disconnected
- Maximum connection retries: 20 attempts before reducing sleep interval
- Rain tip bucket volume: 0.36mm per tip
- Extended wake time: 60 seconds when not connected (for join process)
- **Battery monitoring interval**: 3600 seconds (1 hour) - time-based with NVS persistence
- **Battery ADC samples**: 3 samples averaged (optimized from 10)
- **Battery monitoring power**: ~12µAh/day (98% reduction from original ~480µAh/day)

## 📝 Project Structure

```
WeatherStation/
├── main/
│   ├── esp_zb_weather.c     # Main Zigbee stack, 3-endpoint logic, network retry
│   ├── esp_zb_weather.h     # Configuration, endpoint definitions
│   ├── esp_zb_ota.c         # OTA update implementation
│   ├── esp_zb_ota.h         # OTA interface
│   ├── sleep_manager.c      # Deep sleep management with RTC GPIO support
│   ├── sleep_manager.h      # Sleep manager interface
│   ├── bme280_app.c         # BME280 sensor driver with board-specific I2C
│   ├── bme280_app.h         # BME280 interface
│   ├── weather_driver.c     # DEPRECATED: Legacy driver (unused)
│   └── weather_driver.h     # DEPRECATED: Legacy interface (unused)
├── Doc/
│   └── README_GIT.md        # Git workflow guide for team (Azure DevOps)
├── caelum-weather-station.js # Zigbee2MQTT external converter
├── version.h.in             # Version header template (for configure_file)
├── CMakeLists.txt           # Build configuration with version generation
├── partitions.csv           # Partition table with OTA support
├── sdkconfig.defaults       # Default SDK settings
├── OTA_GUIDE.md            # OTA update instructions
└── README.md               # This file
```

## 🔧 Troubleshooting

### Common Issues

#### **Rain Gauge Not Detecting**
- **ESP32-H2**: Verify GPIO12 connections and reed switch operation
- **ESP32-C6**: Verify GPIO5 connections and reed switch operation
- Check that device is connected to Zigbee network (rain gauge only active when connected)
- Ensure proper pull-down resistor on rain gauge input
- Both targets support rain detection during deep sleep

#### **BME280 Not Reading**  
- **ESP32-H2**: Check I2C connections (SDA: GPIO10, SCL: GPIO11)
- **ESP32-C6**: Check I2C connections (SDA: GPIO6, SCL: GPIO7)
- Verify BME280 I2C address (default: 0x76 or 0x77)
- Ensure proper power supply to sensor (3.3V)

#### **Battery Monitoring Issues**
- Verify voltage divider connections (2x 100kΩ resistors to GPIO4)
- Check battery cell voltage tap (should be 2.7V-4.2V at divider output)
- Ensure GPIO4 (ADC1_CH4) is properly configured
- Monitor serial output for ADC calibration messages
- **ESP32-H2 ADC quirk**: Uses empirical correction factor (1.604x) for DB_12 attenuation
- Battery percentage calculated from voltage (2.7V=0%, 4.2V=100%)
- **Optimized reading schedule**: 
  - First reading always happens on boot/pairing
  - Subsequent readings every hour (3600 seconds) based on elapsed time
  - Uses NVS to persist timestamp across deep sleep cycles
  - Robust to frequent wake-ups (e.g., during rain events)

#### **Zigbee Connection Issues**
- Perform factory reset with long press (5s) on built-in button
- Ensure Zigbee coordinator is in pairing mode
- Check channel compatibility between coordinator and device
- **Auto-retry**: Device automatically retries every 30 seconds when disconnected
- **Extended wake time**: Device now stays awake for 60 seconds (instead of 10s) during join attempts
- **Battery impact**: Extended connection attempts may drain battery faster
- **Join timing**: Allow full 60 seconds for device to complete Zigbee join process

#### **Device Not Waking from Sleep**
- Check battery voltage (minimum 3.0V recommended)
- Verify wake-up sources (timer, rain gauge)
- Review sleep manager logs for errors
- **Network dependency**: Device stays awake longer when not connected to network

#### **High Battery Drain**
- Check if device is stuck in connection retry mode (30-second intervals)
- Verify Zigbee network is stable and accessible
- Monitor connection retry count in device logs
- Consider factory reset if connection issues persist
- **Battery monitoring optimization**: Should consume only ~12µAh/day (hourly readings)
- **Total optimized power**: ~230µAh/day → 10.9 year battery life (2500mAh battery)

### 📋 Development Notes

- **ESP-IDF Version**: v5.5.1 recommended
- **Zigbee SDK**: Latest ESP Zigbee SDK required  
- **Memory Usage**: ~2MB flash, ~200KB RAM typical
- **Power Consumption**: 
  - Active: ~100mA
  - Deep sleep: 7-10µA
  - Battery monitoring: ~12µAh/day (optimized)
  - **Total**: ~230µAh/day (3.1× improvement from ~700µAh/day)
- **Battery Operation**: Optimized for CR123A or Li-ion battery packs
  - **2500mAh battery**: ~10.9 years (vs. 3.5 years before optimization)
- **Target Support**: Both ESP32-H2 and ESP32-C6 fully support RTC GPIO wake-up for rain detection
- **Version Management**: Centralized in CMakeLists.txt with generated header approach

## 🔄 OTA Updates

This project supports Over-The-Air (OTA) firmware updates via Zigbee network. See [OTA_GUIDE.md](OTA_GUIDE.md) for detailed instructions on:
- Creating OTA images
- Configuring Zigbee2MQTT for OTA
- Performing updates
- Troubleshooting OTA issues

## 📄 License

This project follows dual licensing:
- **Software**: GNU General Public License v3.0 (see [LICENSE](LICENSE))
- **Hardware**: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (see [LICENSE-hardware](LICENSE-hardware))

## 🔄 Based On

This project is derived from ESP32 Zigbee SDK examples and implements a 3-endpoint architecture optimized for battery-powered weather station applications with:
- Remote sleep duration configuration (Endpoint 3)
- Deep sleep power management with network retry logic
- Extended wake time during Zigbee join process (60 seconds)
- RTC GPIO wake-up support for rain detection on both ESP32-H2 and ESP32-C6

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

For technical queries, please open an issue on GitHub. Include:
- Complete serial monitor output
- Hardware configuration details  
- ESP-IDF and SDK versions
- Specific symptoms and reproduction steps

## 💖 Support

If you find this project useful, consider supporting the development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Fabiancrg)

---

**Project**: Caelum - ESP32 Zigbee Weather Station  
**Version**: Managed via CMakeLists.txt (PROJECT_VER, BUILD_NUMBER)  
**Compatible**: ESP32-C6, ESP32-H2, ESP-IDF v5.5.1+  
**License**: GPL v3 (Software) / CC BY-NC-SA 4.0 (Hardware)  
**Features**: 
- 3-endpoint design with remote sleep configuration
- OTA firmware updates
- RTC GPIO wake-up for rain detection
- Optimized battery monitoring (~98% power reduction)
- Time-based hourly intervals with NVS persistence
- 10.9 year battery life (2500mAh, 15-min intervals)

