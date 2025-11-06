
const m = require('zigbee-herdsman-converters/lib/modernExtend');
const e = require('zigbee-herdsman-converters/lib/exposes');
const {logger} = require('zigbee-herdsman-converters/lib/logger');
const NS = 'zhc:caelum';

const fzRainfall = {
    cluster: 'genAnalogInput',
    type: ['attributeReport', 'readResponse'],
    convert: (model, msg, publish, options, meta) => {
        logger.debug(`Rainfall converter called: endpoint=${msg.endpoint.ID}, type=${msg.type}, data=${JSON.stringify(msg.data)}`, NS);
        
        // Process rainfall from endpoint 2
        if (msg.endpoint.ID === 2 && msg.data.hasOwnProperty('presentValue')) {
            const rainfall = Math.round(msg.data.presentValue);
            logger.info(`Rainfall: ${msg.data.presentValue} -> ${rainfall} mm`, NS);
            return {rainfall: rainfall};
        }
    },
};

const fzSleepDuration = {
    cluster: 'genAnalogInput',
    type: ['attributeReport', 'readResponse'],
    convert: (model, msg, publish, options, meta) => {
        logger.debug(`Sleep duration converter called: endpoint=${msg.endpoint.ID}, type=${msg.type}, data=${JSON.stringify(msg.data)}`, NS);
        
        // Process sleep duration from endpoint 3
        if (msg.endpoint.ID === 3 && msg.data.hasOwnProperty('presentValue')) {
            const sleep_duration = Math.round(msg.data.presentValue);
            logger.info(`Sleep duration: ${msg.data.presentValue} -> ${sleep_duration} sec`, NS);
            return {sleep_duration_3: sleep_duration};
        }
    },
};

module.exports = {
    zigbeeModel: ['caelum'],
    model: 'caelum',
    vendor: 'ESPRESSIF',
    description: 'Caelum - Battery-powered Zigbee weather station with rain gauge',
    extend: [
        m.deviceEndpoints({"endpoints":{"1":1,"2":2,"3":3}}),
        m.temperature(),
        m.humidity(),
        m.pressure(),
        m.battery(),
    ],
    exposes: [
        e.numeric('rainfall', e.access.STATE).withUnit('mm').withDescription('Total rainfall'),
        e.numeric('sleep_duration_3', e.access.STATE).withUnit('s').withDescription('Sleep duration configuration'),
    ],
    fromZigbee: [fzRainfall, fzSleepDuration],
    configure: async (device, coordinatorEndpoint) => {
        const endpoint1 = device.getEndpoint(1);
        const endpoint2 = device.getEndpoint(2);
        const endpoint3 = device.getEndpoint(3);
        
        // Read Basic cluster attributes on join to populate device info
        await endpoint1.read('genBasic', ['swBuildId', 'dateCode', 'stackVersion', 'hwVersion', 'zclVersion']);
        
        // Configure reporting for rainfall (endpoint 2)
        await endpoint2.configureReporting('genAnalogInput', [{
            attribute: 'presentValue',
            minimumReportInterval: 0,
            maximumReportInterval: 3600,
            reportableChange: 0.1,
        }]);
        
        // Configure reporting for sleep duration (endpoint 3)  
        await endpoint3.configureReporting('genAnalogInput', [{
            attribute: 'presentValue',
            minimumReportInterval: 0,
            maximumReportInterval: 3600,
            reportableChange: 1,
        }]);
    },
    ota: true,
};
