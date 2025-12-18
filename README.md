hy [![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Fabiancrg)

| Supported Targets | ESP32-H2 (v2.0) | ESP32-C6 (v1.0 legacy) |
| ----------------- |  -------- | -------- |

# Caelum - Zigbee Weather Station

[![License: GPL v3](https://img.shields.io/badge/Software-GPLv3-blue.svg)](./LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/Hardware-CC%20BY--NC--SA%204.0-green.svg)](./LICENSE-hardware)

## Project Description

This project implements a battery-powered comprehensive weather station using ESP32-H2 with Zigbee connectivity. The device operates as a Zigbee Sleepy End Device (SED) with automatic light sleep for ultra-low power consumption while maintaining network responsiveness.

**Hardware v2.0** features dual I2C buses supporting multiple sensor combinations, dedicated rain gauge and anemometer inputs, DS18B20 temperature sensor, light sensor, and wind direction sensor for professional weather monitoring capabilities.

This project is based on the examples provided in the ESP Zigbee SDK:

* [ESP Zigbee SDK Docs](https://docs.espressif.com/projects/esp-zigbee-sdk)
* [ESP Zigbee SDK Repo](https://github.com/espressif/esp-zigbee-sdk)

## Device Features

### 🌐 Zigbee Endpoints Overview (v2.0 Hardware)

| Endpoint | Device Type | Clusters | Description |
|----------|-------------|----------|-------------|
| **1** | Environmental Sensor | Temperature, Humidity, Pressure, Battery, OTA | Multi-sensor support via dual I2C buses |
| **2** | Rain Gauge | Analog Input | Tipping bucket rain sensor with rainfall totals (GPIO12) |
| **3** | DS18B20 Temperature | Temperature Measurement | External waterproof temperature probe (GPIO24) |
| **4** | Anemometer (Wind Speed) | Analog Input | Wind speed sensor with pulse counting (GPIO14) |
| **5** | Wind Direction | Analog Input | AS5600 magnetic wind vane (I2C Bus 2) |
| **6** | Light Sensor | Illuminance Measurement | VEML7700 ambient light sensor (I2C Bus 2) |

### 💡 LED Boot Indicator (Always Active)

The device includes a WS2812 RGB LED on GPIO8 (ESP32-H2) that provides visual feedback during boot and network join:
- **Yellow (Blinking)**: Joining/searching for network  
- **Blue (Steady, 5 seconds)**: Successfully connected to Zigbee network
- **Red (Blinking, 10 times)**: Connection failed after max retries
- **Off**: LED powered down after boot sequence (RMT peripheral disabled for power savings)

**Power Optimization**: The LED and its RMT peripheral are permanently disabled after the initial boot/join sequence to save ~1-2mA. This is critical for achieving 0.68mA sleep current. The LED cannot be re-enabled remotely - it only operates during the first boot cycle.

### 📋 Detailed Endpoint Descriptions (v2.0)

#### **Endpoint 1: Environmental Monitoring & Power Management**
- **Hardware**: Dual I2C bus architecture for sensor flexibility
  - **I2C Bus 1 (GPIO10/11)**: Temperature, Humidity, Pressure sensors
  - **I2C Bus 2 (GPIO1/2)**: Wind direction, Light, Alternative pressure sensors
- **Supported Sensors** (automatically detected):
  - **SHT41** (Bus 1): High-accuracy Temperature + Humidity (±0.2°C, ±1.8% RH)
  - **AHT20** (Bus 1): Alternative Temperature + Humidity sensor
  - **BMP280** (Bus 1): Temperature + Pressure (±1 hPa accuracy)
  - **BME280** (Bus 1): All-in-one Temperature + Humidity + Pressure
  - **DPS368** (Bus 2): High-precision Pressure sensor (±0.002 hPa)
  - **AS5600** (Bus 2): Magnetic wind direction sensor (12-bit resolution)
  - **VEML7700** (Bus 2): Ambient light sensor (0.0036 to 120,000 lux)
- **Measurements**: 
  - 🌡️ **Temperature**: -40°C to +85°C (multiple sources available)
  - 💧 **Humidity**: 0-100% RH (from SHT41/AHT20/BME280)
  - 🌪️ **Pressure**: 300-1100 hPa (from BMP280/BME280/DPS368)
  - 🔋 **Battery Monitoring**: Li-Ion voltage (2.7V-4.2V) and percentage
- **Battery Monitoring**:
  - **Hardware**: GPIO4 (ADC1_CH4) with voltage divider (2x 100kΩ resistors)
  - **MOSFET Control**: GPIO3 for active power management
  - **Voltage**: Real-time battery voltage in 0.1V units
  - **Percentage**: Battery level 0-100% based on Li-Ion discharge curve
  - **Calibration**: ESP32-H2 ADC correction factor (1.604x) for accurate readings
  - **Optimized Reading**: Time-based hourly intervals with NVS persistence
- **Use Case**: Comprehensive weather monitoring, HVAC automation, solar power tracking

#### **Endpoint 2: Rain Gauge System**
- **Hardware**: Tipping bucket rain gauge with reed switch
  - **ESP32-H2 v2.0**: GPIO12 (interrupt-capable, dedicated rain input)
- **Measurements**: Cumulative rainfall in millimeters (0.36mm per tip)
- **Features**: 
  - Interrupt-based detection (200ms debounce)
  - Persistent storage (NVS) for total tracking
  - Smart reporting (1mm threshold increments)
  - Network-aware operation (ISR enabled only when connected)
  - Works during light sleep - wakes device on rain detection
- **Specifications**: 
  - Maximum rate: 200mm/hour supported
  - Accuracy: ±0.36mm per bucket tip
  - Storage: Non-volatile total persistence across reboots
- **Use Case**: Weather station, irrigation control, flood monitoring

#### **Endpoint 3: DS18B20 External Temperature Sensor**
- **Hardware**: DS18B20 1-Wire waterproof temperature probe
  - **GPIO24**: 1-Wire bus with parasitic power support
- **Measurements**: External temperature -55°C to +125°C (±0.5°C accuracy)
- **Features**:
  - Waterproof probe for outdoor/liquid temperature monitoring
  - 12-bit resolution (0.0625°C precision)
  - Independent from I2C environmental sensors
  - Parasitic power mode (no external power needed)
- **Use Case**: Soil temperature, water temperature, outdoor ambient temperature

#### **Endpoint 4: Anemometer (Wind Speed)**
- **Hardware**: Pulse-output anemometer
  - **GPIO14**: Interrupt-capable input for pulse counting
- **Measurements**: Wind speed via pulse frequency
- **Features**:
  - Interrupt-based pulse counting with debounce
  - Persistent storage (NVS) for total tracking
  - Similar architecture to rain gauge (proven reliability)
- **Use Case**: Weather station, HVAC control, drone operations

#### **Endpoint 5: Wind Direction**
- **Hardware**: AS5600 magnetic rotary position sensor (I2C Bus 2)
  - **I2C Address**: 0x36 (fixed)
  - **Resolution**: 12-bit (0.087° per step)
- **Measurements**: Wind direction 0-360° (compass bearing)
- **Features**:
  - Contactless magnetic sensing (no wear)
  - Absolute position (no homing required)
  - High resolution for accurate wind vane reading
- **Use Case**: Weather station, wind power monitoring, sailing applications

#### **Endpoint 6: Light Sensor**
- **Hardware**: VEML7700 ambient light sensor (I2C Bus 2)
  - **I2C Address**: 0x10 (fixed)
  - **Range**: 0.0036 to 120,000 lux
- **Measurements**: Ambient light intensity in lux
- **Features**:
  - High dynamic range (16-bit resolution)
  - Automatic gain adjustment
  - Human eye response matching
- **Use Case**: Solar panel monitoring, daylight harvesting, plant growth monitoring

### 🔧 Hardware Configuration

#### **Required Components (v2.0 Hardware)**
- ESP32-H2 development board (RISC-V architecture)
- **I2C Bus 1 Sensors** (Temperature/Humidity/Pressure):
  - **SHT41** - High-accuracy temperature + humidity (recommended)
  - **AHT20** - Alternative temperature + humidity sensor
  - **BMP280** - Pressure sensor (pairs with SHT41/AHT20)
  - **BME280** - All-in-one temp/humidity/pressure (alternative)
- **I2C Bus 2 Sensors** (Wind/Light/Pressure):
  - **AS5600** - Magnetic rotary position sensor for wind direction
  - **VEML7700** - Ambient light sensor (lux measurements)
  - **DPS368** - High-precision barometric pressure sensor (optional, alternative to BMP280)
- **1-Wire Sensor**:
  - **DS18B20** - Waterproof temperature probe for external measurements
- **Wind Sensors**:
  - Tipping bucket rain gauge with reed switch (0.36mm per tip)
  - Anemometer with pulse output for wind speed measurement
- **Power System**:
  - Li-Ion battery (with protection circuit, 5V output recommended)
  - Voltage divider (2x 100kΩ resistors for battery monitoring)
  - MOSFET for battery power management (GPIO3 control)
- Zigbee coordinator (ESP32-H2 or commercial gateway)

**Recommended v2.0 Configuration**:
- **Best accuracy**: SHT41 + BMP280 (Bus 1) + AS5600 + VEML7700 (Bus 2) + DS18B20
- **Weather station**: Full sensor array with wind speed, direction, rain, temperature, light
- **Minimal**: SHT41 + BMP280 (Bus 1) + Rain gauge + DS18B20

#### **Pin Assignments**

**ESP32-H2 (v2.0 Hardware)**
```
GPIO 1  - I2C Bus 2 SDA (AS5600 wind direction, VEML7700 light sensor, DPS368 pressure)
GPIO 2  - I2C Bus 2 SCL (AS5600 wind direction, VEML7700 light sensor, DPS368 pressure)
GPIO 3  - Battery MOSFET control (active power management)
GPIO 4  - Battery voltage input (ADC1_CH4 with voltage divider)
GPIO 8  - WS2812 RGB LED (debug indicator, optional)
GPIO 9  - Built-in button (factory reset)
GPIO 10 - I2C Bus 1 SDA (SHT41/AHT20 temp/humidity, BMP280/BME280 pressure)
GPIO 11 - I2C Bus 1 SCL (SHT41/AHT20 temp/humidity, BMP280/BME280 pressure)
GPIO 12 - Rain gauge input (tipping bucket with reed switch)
GPIO 14 - Anemometer input (wind speed pulse counter)
GPIO 24 - DS18B20 1-Wire temperature sensor (waterproof probe)
```

**Note**: v2.0 uses dedicated dual I2C buses to avoid address conflicts and support expanded sensor array.

**ESP32-C6 (v1.0 Hardware - Legacy)**
```
GPIO 4  - Battery voltage input (ADC1_CH4 with voltage divider)
GPIO 5  - Rain gauge input (RTC-capable)
GPIO 6  - I2C SDA (environmental sensors: BME280/BMP280/SHT40/SHT41/AHT20)
GPIO 7  - I2C SCL (environmental sensors: BME280/BMP280/SHT40/SHT41/AHT20) 
GPIO 9  - Built-in button (factory reset)
```
*Note: v1.0 hardware support maintained for backward compatibility. See caelum-weatherstation repository for v1.0 firmware.*eatherstation repository for v1.0 firmware.*

### 🔧 Hardware Version History

#### **v2.0 (Current - 2024)**
**Target**: ESP32-H2 only  
**Major Changes**:
- ✅ **Dual I2C Buses**: Separate buses (GPIO10/11 and GPIO1/2) eliminate address conflicts
- ✅ **Expanded Sensors**: DS18B20 (GPIO24), AS5600 wind direction, VEML7700 light, DPS368 pressure
- ✅ **Dedicated Inputs**: Rain gauge (GPIO12), Anemometer (GPIO14)
- ✅ **Battery Management**: MOSFET control (GPIO3) for active power management
- ❌ **Removed**: Pulse counter (GPIO13) - replaced by dedicated rain gauge and anemometer
- 📦 **Endpoints**: 6 total (ENV, RAIN, DS18B20, WIND_SPEED, WIND_DIR, LIGHT)

**Pin Changes from v1.0**:
```
Added:
  GPIO 1/2   - I2C Bus 2 (new sensors)
  GPIO 3     - Battery MOSFET control  
  GPIO 14    - Anemometer (wind speed)
  GPIO 24    - DS18B20 temperature probe
  
Removed:
  GPIO 13    - Pulse counter (v1.0 only)
```

#### **v1.0 (Legacy - 2023)**
**Targets**: ESP32-H2, ESP32-C6  
**Features**:
- Single I2C bus (GPIO10/11 on H2, GPIO6/7 on C6)
- BME280/BMP280/SHT41/AHT20 environmental sensors
- Rain gauge (GPIO12 on H2, GPIO5 on C6)
- Pulse counter (GPIO13) for general-purpose counting
- 3 endpoints (ENV, RAIN, PULSE_COUNTER)

**Migration Notes**:
- v1.0 firmware available in `caelum-weatherstation` repository
- v2.0 hardware NOT compatible with v1.0 firmware (different GPIO assignments)
- v1.0 hardware CAN run v2.0 firmware with limited functionality (only ENV + RAIN endpoints)

**Battery Voltage Divider Circuit**
```
Battery+ ──┬── 100kΩ ──┬── 100kΩ ── GND
           │           │
           │           └── GPIO4 (ADC input)
           │
           └── 5V output (to ESP32 power)
```
```
Note: Voltage divider monitors the cell voltage (2.7V-4.2V) while the battery pack provides 5V regulated output

### 🔌 Zigbee Integration
- **Protocol**: Zigbee 3.0  
- **Device Type**: Sleepy End Device (SED) - maintains network connection while sleeping
- **Sleep Mode**: Automatic light sleep with 7.5s keep-alive polling
- **Sleep Threshold**: 6.0 seconds (allows sleep between keep-alive polls)
- **Supported Channels**: 11-26 (2.4 GHz)
- **Compatible**: Zigbee2MQTT, Home Assistant ZHA, Hubitat
- **OTA Support**: Over-the-air firmware updates enabled (see [OTA_GUIDE.md](OTA_GUIDE.md))

### ⚡ Power Management (Light Sleep Mode)

**Zigbee Sleepy End Device (SED) Configuration**:
- **Keep-alive Polling**: 7.5 seconds (maintains parent connection)
- **Sleep Threshold**: 6.0 seconds (enters light sleep when idle)
- **Parent Timeout**: 64 minutes (how long parent keeps device in child table)
- **RX on When Idle**: Disabled (radio off during sleep for power savings)

**Power Consumption**:
- **Sleep Current**: **0.68mA** (with RMT peripheral powered down)
- **Transmit Current**: 12mA during active transmission
- **Average Current**: ~0.83mA (includes 7.5s polling cycles)
- **LED Power-down**: Critical for low power - RMT peripheral disabled after boot

**Sleep Behavior**:
- Device sleeps automatically when Zigbee stack is idle (no activity for 6 seconds)
- Wakes every 7.5 seconds to poll parent for pending messages
- Rain detection wakes device instantly via GPIO interrupt
- Quick response to Zigbee commands (<10 seconds typical)

**Power Optimization Features**:
- RMT peripheral (LED driver) powered down after boot sequence (~1-2mA savings)
- Light sleep maintains Zigbee network association (no rejoin delays)
- Automatic sleep/wake managed by ESP Zigbee stack
- Battery monitoring on 1-hour intervals with NVS persistence
- BME280 forced measurement mode (sensor sleeps between readings)

**Battery Life Estimate**:
- **2500mAh Li-Ion**: ~125 days (4+ months) at 0.83mA average
- **Breakdown**: 
  - ~7.4 seconds sleep per 7.5 second cycle (0.68mA)
  - ~0.1 seconds active per cycle (12mA transmit)
  - Sensor readings and reports as configured

**OTA Behavior**: 
- Device stays awake during firmware updates (`esp_zb_ota_is_active()` check)
- Normal sleep resumes after OTA completion

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
# For ESP32-H2 (v2.0 hardware required)
./install.sh esp32h2
. ./export.sh
```

### Configure the Project
```bash
# For ESP32-H2 v2.0 hardware
idf.py set-target esp32h2
idf.py menuconfig
```

**Note**: v2.0 firmware requires v2.0 hardware (dual I2C buses, new GPIO assignments). For v1.0 hardware (ESP32-C6 or ESP32-H2 single I2C), use the `caelum-weatherstation` repository.

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
  - Long press (5s): Factory reset device and rejoin network

#### **Automatic Features**
- **Light Sleep**: Automatic entry when idle (6s threshold, 7.5s keep-alive polling)
- **Sensor Reporting**: Environmental data reported after network join and on-demand
- **Rain Detection**: Interrupt-based instant wake and reporting (1mm threshold)
- **Battery Monitoring**: Hourly readings with time-based NVS persistence
- **Network Status**: Visual feedback via RGB LED during boot/join only
- **Power Savings**: RMT peripheral powered down after boot (~1-2mA savings)

### 📡 Data Reporting
- **Temperature/Humidity/Pressure**: Reported after network join and as configured
- **Rainfall**: Immediate on rain detection (1mm threshold)
- **Battery**: Hourly time-based readings with NVS persistence
- **Reporting Interval**: Configurable 60-7200 seconds via Endpoint 3
- **Response Time**: <10 seconds for Zigbee commands (7.5s keep-alive polling)

## 📊 Example Output

### Device Initialization (with Sensor Auto-Detection)
```
I (3668) i2c_bus: i2c0 bus inited
I (3670) i2c_bus: I2C Bus V2 Config Succeed, Version: 1.5.0
I (3686) i2c_bus: found i2c device address = 0x44
I (3695) i2c_bus: found i2c device address = 0x76
I (3696) SENSOR_IF: I2C scan: 2 device(s): 0x44 0x76
I (3697) SENSOR_IF: Probing for BME280...
W (3698) BME280_APP: ⚠ Detected BMP280 sensor (Chip ID: 0x58) - Temperature + Pressure ONLY (no humidity!)
I (3704) SENSOR_IF: BMP280 detected (no humidity), searching for separate humidity sensor...
I (3710) SHT41: sht41_init: device created successfully
I (3715) SENSOR_IF: Detected sensor combo: SHT41 + BMP280 (temp/RH from SHT41, pressure from BMP280)
I (3720) WEATHER_STATION: Detected SHT41 + BMP280 sensor combo on ESP32-H2 (SDA:GPIO10, SCL:GPIO11)
I (3730) RAIN_GAUGE: Rain gauge initialized. Current total: 0.00 mm
```

### Alternative Sensor Configurations
```
# BME280 all-in-one sensor
I (3697) SENSOR_IF: Probing for BME280...
I (3698) BME280_APP: ✓ Detected BME280 sensor (Chip ID: 0x60) - Temperature + Humidity + Pressure
I (3704) SENSOR_IF: Detected sensor: BME280
I (3710) WEATHER_STATION: Detected BME280 sensor on ESP32-H2 (SDA:GPIO10, SCL:GPIO11)

# SHT41 alone (no pressure sensor)
I (3697) SENSOR_IF: Probing for BME280...
I (3698) SENSOR_IF: BME280 not found, probing for SHT41 + BMP280 combo...
I (3704) SHT41: sht41_init: device created successfully
I (3710) SENSOR_IF: Detected sensor: SHT41 only (pressure will default to 1000.0 hPa)
I (3715) WEATHER_STATION: Detected SHT41 sensor on ESP32-H2 (SDA:GPIO10, SCL:GPIO11)
```

### Zigbee SED Configuration
```
I (600) WEATHER_STATION: 🔋 Configured as Sleepy End Device (SED) - rx_on_when_idle=false
I (610) WEATHER_STATION: 📡 Keep-alive poll interval: 7500 ms (7.5 sec)
I (620) WEATHER_STATION: 💤 Sleep threshold: 6000 ms (6.0 sec) - production optimized
I (630) WEATHER_STATION: ⏱️  Parent timeout: 64 minutes
I (640) WEATHER_STATION: ⚡ Power profile: 0.68mA sleep, 12mA transmit, ~0.83mA average
```

### Network Connection (LED Shows Status)
```
I (3558) WEATHER_STATION: Joined network successfully (Extended PAN ID: 74:4d:bd:ff:fe:63:f7:30, PAN ID: 0x13af, Channel:13, Short Address: 0x7c16)
I (3568) WEATHER_STATION: 💡 LED will power down in 5 seconds to save battery
I (3578) RAIN_GAUGE: Rain gauge enabled - device connected to Zigbee network
I (3588) WEATHER_STATION: 📊 Scheduling initial sensor data reporting after network join
I (8568) WEATHER_STATION: 🔌 RGB LED RMT peripheral powered down (boot sequence complete)
```

### Sensor Data Reporting
```
I (4000) WEATHER_STATION: 🌡️ Temperature: 22.35°C reported to Zigbee  
I (5010) WEATHER_STATION: 💧 Humidity: 45.20% reported to Zigbee
I (6020) WEATHER_STATION: 🌪️ Pressure: 1013.25 hPa reported to Zigbee
I (7030) BATTERY: 🔋 Li-Ion Battery: 4.17V (98%) - Zigbee values: 41 (0.1V), 196 (%*2)
I (8040) WEATHER_STATION: 📡 Temp: 22.4°C
I (8050) WEATHER_STATION: 📡 Humidity: 45.2%
I (8060) WEATHER_STATION: 📡 Pressure: 1013.3 hPa
```

### Rain Gauge Activity
```  
I (10000) RAIN_GAUGE: 🌧️ Rain pulse #1: 0.36 mm total (+0.36 mm)
I (10020) RAIN_GAUGE: ✅ Rain reported: 0.36 mm
I (10030) WEATHER_STATION: 📡 Rain: 0.36 mm
```

### Light Sleep Activity
```
I (15000) WEATHER_STATION: Zigbee can sleep
I (15010) WEATHER_STATION: 💤 Entering light sleep (will wake for 7.5s keep-alive poll)
```

## 🏠 Home Assistant Integration

When connected to Zigbee2MQTT or other Zigbee coordinators, the v2.0 device exposes:

- **6x Sensor entities**: 
  - Temperature (Environmental + DS18B20 external probe)
  - Humidity
  - Pressure  
  - Battery Percentage
  - Wind Speed
  - Wind Direction (0-360° compass bearing)
  - Light Level (lux)
- **2x Sensor entities**: 
  - Battery Voltage (mV)
  - Rainfall total (mm) with automatic updates
- **LED Control**: ⚠️ **Not available in v2.0** - LED operates only during boot/join sequence

### Endpoint Summary for Home Assistant

| Endpoint | Entity Type | Measurements | Update Frequency |
|----------|-------------|--------------|------------------|
| 1 | Sensor | Temp, Humidity, Pressure, Battery | Configurable (default 15min) |
| 2 | Sensor | Rainfall total (mm) | On rain detection (1mm threshold) |
| 3 | Sensor | External temperature (DS18B20) | Configurable (default 15min) |
| 4 | Sensor | Wind speed | Configurable (default 15min) |
| 5 | Sensor | Wind direction (0-360°) | Configurable (default 15min) |
| 6 | Sensor | Light level (lux) | Configurable (default 15min) |

### Zigbee2MQTT Integration

A custom external converter is provided for full feature support with Zigbee2MQTT. See [ZIGBEE2MQTT_CONVERTER.md](ZIGBEE2MQTT_CONVERTER.md) for:
- Converter installation instructions
- Multi-endpoint support configuration
- v2.0 endpoint mappings (6 endpoints)
- Home Assistant automation examples

**Note**: v2.0 requires updated converter due to new endpoint structure (6 endpoints vs 4 in v1.0)

## 🔄 Migration Guide: v1.0 → v2.0

### Hardware Requirements
⚠️ **v2.0 firmware requires v2.0 hardware** - GPIO assignments are completely different.

| Component | v1.0 | v2.0 | Compatible? |
|-----------|------|------|-------------|
| Target | ESP32-H2 or C6 | ESP32-H2 only | ❌ Different GPIO |
| I2C Bus | Single (GPIO10/11) | Dual (GPIO10/11 + GPIO1/2) | ⚠️ Partial |
| Rain Gauge | GPIO12 (H2), GPIO5 (C6) | GPIO12 only | ✅ H2 compatible |
| Pulse Counter | GPIO13 | Removed | ❌ Deprecated |
| Anemometer | N/A | GPIO14 | ➕ New |
| DS18B20 | N/A | GPIO24 | ➕ New |
| Battery MOSFET | N/A | GPIO3 | ➕ New |

### Firmware Migration
```bash
# Clone v2.0 repository
git clone https://github.com/Fabiancrg/caelum.git
cd caelum

# Set target (ESP32-H2 only for v2.0)
idf.py set-target esp32h2

# Build and flash
idf.py -p [PORT] erase-flash
idf.py -p [PORT] flash monitor
```

### What Changes?
**Removed Features**:
- ❌ Pulse counter endpoint (GPIO13) - use dedicated anemometer instead
- ❌ Sleep configuration endpoint - replaced by sensor-specific intervals
- ❌ Remote LED control - LED only operates during boot/join

**New Features**:
- ✅ DS18B20 external temperature probe (waterproof)
- ✅ Wind speed measurement (anemometer on GPIO14)
- ✅ Wind direction (AS5600 magnetic sensor, 0-360°)
- ✅ Ambient light sensor (VEML7700, 0.0036-120k lux)
- ✅ Dual I2C buses eliminate address conflicts
- ✅ Battery MOSFET control for active power management

### Zigbee2MQTT Converter Update
v2.0 requires a new external converter due to endpoint changes:
```javascript
// Update your external converter to v2.0 format
// See ZIGBEE2MQTT_CONVERTER.md for full v2.0 converter code
```

### Home Assistant Entity Changes
| v1.0 Entity | v2.0 Entity | Notes |
|-------------|-------------|-------|
| `sensor.temp` | `sensor.temp` (EP1) | ✅ Compatible |
| `sensor.humidity` | `sensor.humidity` (EP1) | ✅ Compatible |
| `sensor.pressure` | `sensor.pressure` (EP1) | ✅ Compatible |
| `sensor.rainfall` | `sensor.rainfall` (EP2) | ✅ Compatible |
| `sensor.battery` | `sensor.battery` (EP1) | ✅ Compatible |
| `number.sleep_duration` | Removed | ❌ Not in v2.0 |
| `switch.led` | Removed | ❌ Boot-only in v2.0 |
| N/A | `sensor.temp_external` (EP3) | ➕ New (DS18B20) |
| N/A | `sensor.wind_speed` (EP4) | ➕ New (Anemometer) |
| N/A | `sensor.wind_direction` (EP5) | ➕ New (AS5600) |
| N/A | `sensor.light_level` (EP6) | ➕ New (VEML7700) |

### I2C Sensor Compatibility
v1.0 sensors on single I2C bus CAN be used on v2.0 Bus 1 (GPIO10/11):
- ✅ BME280 / BMP280 / SHT41 / AHT20 work on Bus 1
- ➕ Add AS5600 + VEML7700 on Bus 2 (GPIO1/2) for full functionality
- ⚠️ Some I2C addresses may conflict if all sensors on same bus

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

**Zigbee SED Configuration** (in `main/esp_zb_weather.c`):
- **Keep-alive interval**: 7500ms (7.5 seconds) - Zigbee parent polling
- **Sleep threshold**: 6000ms (6.0 seconds) - idle time before light sleep
- **Parent timeout**: 64 minutes - how long parent keeps device in child table
- **Power profile**: 0.68mA sleep, 12mA transmit, ~0.83mA average

**Device Parameters** (in `main/esp_zb_weather.h`):
- **Default sleep duration**: 900 seconds (15 minutes) - configurable via Endpoint 3
- **Sleep duration range**: 60-7200 seconds (1 minute to 2 hours)
- **Rain tip bucket volume**: 0.36mm per tip
- **Battery monitoring interval**: 3600 seconds (1 hour) - time-based with NVS persistence
- **Battery ADC samples**: 3 samples averaged for accuracy
- **LED boot indicator**: WS2812 RGB on GPIO8 (ESP32-H2), automatically powered down after boot
- **Network retry**: 20 max retries when not connected
- **Connection timeout**: Extended wake time during network join

## 📝 Project Structure

```
WeatherStation/
├── main/
│   ├── esp_zb_weather.c     # Main Zigbee stack, 4-endpoint logic, network retry, LED control
│   ├── esp_zb_weather.h     # Configuration, endpoint definitions, LED settings
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
├── caelum-weather-station.js # Zigbee2MQTT external converter (4 endpoints)
├── version.h.in             # Version header template (for configure_file)
├── CMakeLists.txt           # Build configuration with version generation
├── partitions.csv           # Partition table with OTA support
├── sdkconfig.defaults       # Default SDK settings
├── OTA_GUIDE.md            # OTA update instructions
├── LED_DEBUG_FEATURE.md    # LED debug feature documentation
└── README.md               # This file
```

## �️ Recent changes (summary)

The following changes were applied to the firmware and Zigbee2MQTT converter in recent updates. This section documents the edits made so you can rebuild, flash and test the updated behaviour.

- Converter (`caelum-weather-station.js`):
  - Mapped the device to advertise endpoints 1..3 (removed explicit EP4 advertisement).
  - Switched configureReporting for analog inputs to numeric reporting values (example: {min:10, max:3600, change:0.1}) so controllers only subscribe to the `presentValue` attribute and not `statusFlags`.
  - Moved the On/Off expose to the primary endpoint mapping so controllers will use EP1 for LED control.

- Firmware (`main/esp_zb_weather.c`, `main/esp_zb_weather.h` and related):
  - Endpoint & cluster changes:
    - Removed Basic cluster exposure from non-primary endpoints to prevent coordinators reading Basic attributes on the sensor endpoints.
    - Moved `genOnOff` (LED debug) to the primary endpoint (EP1); no separate EP4 is registered anymore.
    - Ensured Analog Input clusters expose only `presentValue` for rain / sleep configuration to avoid sending `statusFlags` to the controller.
    - Fixed ZCL string length prefixing for `sleep_description` and other length-prefixed ZCL string attributes.

  - Rain gauge reliability and counting fixes:
    - ISR now timestamps events and queues a small event struct so the rain task can disambiguate wake-count vs queued ISR events.
    - Introduced a small duplicate-suppression window after wake (50 ms) to avoid double-counting the same physical tip when the wake path and ISR both fire for the same edge.
    - Kept the ISR handler installed across sleep/wake; bounce handling now disables/re-enables the GPIO interrupt line (gpio_intr_disable/enable) instead of removing and re-adding the ISR handler. This reduces the race window where pulses could be missed.
    - Reduced the bounce settle time and debounce defaults to improve responsiveness while still preventing false tips (defaults in code: 200 ms debounce / 200 ms settle).
    - Queue events carry ISR ticks for robust timing comparisons in the consumer task.

  - Wake/reporting timing and sleep behaviour:
    - The device now schedules a shorter reporting window after wake so overall awake time is reduced.
      - Reporting window (time between wake and starting deep-sleep preparation) is now 7 seconds (was previously 15s / 10s in some paths).
      - Per-sensor scheduled report offsets inside that window: BME280 at ~1s, rain update at ~2s, battery at ~3s, sleep-duration at ~4s.
    - Final delays in `prepare_for_deep_sleep()` were reduced (smaller vTaskDelay values) while preserving a short transmission window to allow Zigbee packets to be sent.
    - OTA behaviour is unchanged: if an OTA update is active the device will postpone deep sleep and periodically re-check the OTA status until the transfer is complete.

  - Miscellaneous:
    - `RAIN_MM_PER_PULSE` remains 0.36 mm per tip; all rain math still uses this constant.
    - NVS persistence for rain totals and sleep configuration remains in place and is used to recover counts across reboots.

## 🔁 How to build & flash the updated firmware (Windows PowerShell)

Use your existing ESP-IDF environment and the usual build/flash commands. Example (PowerShell):

```powershell
# Set target and open menuconfig if needed
idf.py set-target esp32h2
idf.py menuconfig

# Optional: erase flash for a clean install
idf.py -p COM3 erase-flash

# Build and flash
idf.py -p COM3 flash monitor
```

Replace `COM3` with your serial port. `monitor` attaches the serial monitor after flash; you'll see the device logs in the console.

## ✅ Test checklist after flashing

1. Pair the device with your Zigbee coordinator (or let Zigbee2MQTT re-discover the device).
2. Verify endpoints: device should advertise endpoints 1..3 and the LED On/Off should be on EP1.
3. Check Zigbee2MQTT logs: ensure that only `presentValue` for genAnalogInput is reported for rain and sleep duration, and that `statusFlags` is not being reported.
4. Trigger a rain pulse (or simulate the reed switch): verify that pulses are counted even if they occur before Zigbee reconnect; verify duplicate suppression does not double-count the same physical tip.
5. Observe a normal wake cycle: sensor reports should appear at ~1s/2s/3s/4s and the device should enter deep sleep after ~7s (log messages show the exact timing).
6. Start an OTA update (if available) and verify the device stays awake for the duration of the transfer.

If any reports are missed in practice, increase the reporting window to 10s or increase the final transmission delay in `prepare_for_deep_sleep()`.

If you'd like, I can prepare a complementary small test patch that logs timestamps when each scheduled report runs so you can measure precise timings on your hardware.


## �🔧 Troubleshooting

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
- **LED Debug**: If enabled, LED consumes ~20mA during wake cycles (can be disabled via Zigbee)

#### **LED Not Working**
- **ESP32-H2 SuperMini**: Verify GPIO8 connection to WS2812 RGB LED
- Check LED debug feature is enabled in `esp_zb_weather.h` (`DEBUG_LED_ENABLE=1`)
- Verify LED debug is enabled via Zigbee2MQTT switch (endpoint 4)
- Monitor serial output for LED initialization messages
- Ensure led_strip component (~2.0.0) is properly installed
- **LED States**: Blue=connected, Orange blink=joining, White flash=rain, Off=sleep/disabled
- See [LED_DEBUG_FEATURE.md](LED_DEBUG_FEATURE.md) for detailed troubleshooting

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

This project is derived from ESP32 Zigbee SDK examples and implements a professional weather station architecture with:

**v2.0 Architecture (Current)**:
- 6-endpoint design (ENV, RAIN, DS18B20, WIND_SPEED, WIND_DIR, LIGHT)
- Dual I2C buses (Bus 1: GPIO10/11, Bus 2: GPIO1/2) for expanded sensor support
- DS18B20 1-Wire external temperature probe (GPIO24)
- Dedicated rain gauge (GPIO12) and anemometer (GPIO14) inputs
- AS5600 magnetic wind direction sensor (12-bit, 0-360°)
- VEML7700 ambient light sensor (0.0036-120k lux range)
- Optional DPS368 high-precision pressure sensor
- Battery MOSFET control (GPIO3) for active power management
- Automatic light sleep with 7.5s keep-alive polling
- Ultra-low power: 0.68mA sleep current

**v1.0 Architecture (Legacy)**:
- 4-endpoint design (ENV, RAIN, PULSE_COUNTER, SLEEP_CONFIG)
- Single I2C bus (GPIO10/11 on H2, GPIO6/7 on C6)
- General-purpose pulse counter (GPIO13)
- Remote sleep duration configuration
- Available in `caelum-weatherstation` repository

**Key Improvements in v2.0**:
- ✅ Eliminated I2C address conflicts with dual-bus architecture
- ✅ Added professional weather sensors (wind speed, direction, light)
- ✅ DS18B20 waterproof probe for external temperature monitoring
- ✅ Dedicated GPIO for each measurement type (no multiplexing)
- ✅ Removed generic pulse counter - replaced with specific sensors
- ✅ Enhanced battery management with MOSFET control

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
**Version**: v2.0 - Hardware redesign with dual I2C buses and expanded sensor array  
**Compatible**: ESP32-H2 (v2.0), ESP32-C6 (v1.0 legacy), ESP-IDF v5.5.1+  
**License**: GPL v3 (Software) / CC BY-NC-SA 4.0 (Hardware)  
**Features**: 
- 6-endpoint design (ENV, RAIN, DS18B20, WIND_SPEED, WIND_DIR, LIGHT)
- Dual I2C buses for expanded sensor support without address conflicts
- Professional weather monitoring (temperature, humidity, pressure, rain, wind, light)
- DS18B20 waterproof external temperature probe
- AS5600 magnetic wind direction sensor (0-360°)
- VEML7700 ambient light sensor (0.0036-120k lux)
- Anemometer wind speed measurement
- OTA firmware updates
- Optimized battery monitoring with hourly time-based intervals
- WS2812 RGB LED status indicator during boot/join
- Ultra-low power: 0.68mA sleep current for extended battery life

