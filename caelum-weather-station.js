import * as m from 'zigbee-herdsman-converters/lib/modernExtend';

export default {
    zigbeeModel: ['caelum'],
    model: 'caelum',
    vendor: 'ESPRESSIF',
    description: 'Caelum - Battery-powered Zigbee weather station with rain gauge',
    extend: [
        m.deviceEndpoints({endpoints: {"1":1,"2":2,"3":3,"4":4}}),
        m.temperature(
            {
                endpointNames: ["1"],
                unit: "°C",
                access: "STATE_GET",
                precision: 1,
                reporting: {min: 10, max: 3600, change: 0.1},
            }
        ),
        m.humidity(),
        m.pressure(
            {
                endpointNames: ["1"],
                unit: "hPa",
                description: "Atmospheric pressure",
                access: "STATE_GET",
                precision: 1,
                icon: "mdi:gauge",
                reporting: {min: 10, max: 3600, change: 0.1},
            }
        ),
        m.battery(),
        m.numeric(
            {
                endpointNames: ["2"],
                name: "rain_amount",
                property: "rain_amount",
                cluster: "genAnalogInput",
                attribute: "presentValue",
                reporting: {"min":0,"max":3600,"change":0.3},
                description: "Total rainfall",
                unit: "mm",
                precision: 1,
                access: "ALL",
                icon: "mdi:weather-rainy",
                exposesName: "Rain amount"
            }
        ),
        m.numeric(
            {
                endpointNames: ["3"],
                name: "pulse_count",
                property: "pulse_count",
                cluster: "genAnalogInput",
                attribute: "presentValue",
                reporting: {"min":0,"max":3600,"change":1},
                description: "Pulse count",
                access: "ALL",
                exposesName: "Pulse Count"
            }
        ),
        m.temperature(
            {
                endpointNames: ["4"],
                unit: "°C",
                access: "STATE_GET",
                precision: 1,
                reporting: {min: 10, max: 3600, change: 0.1},
            }
        ),
    ],
    ota: true,
};
