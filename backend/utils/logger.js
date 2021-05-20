const winston = require('winston');
const { format, transports } = require('winston');
require("winston-daily-rotate-file");

const infoLogger = winston.createLogger({
    transports: [
        new transports.DailyRotateFile({
            level:'info',
            dirname: '.log',
            filename: 'info.log',
            maxsize: '5m'
        })
    ],
    format: winston.format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.json(),
        winston.format.printf(info => {
           let message = Object.assign({},info.message.body);
            if (message.hasOwnProperty('password')) {
                message.password = undefined;
            }
            return `\nTimestamp : ${info.timestamp}\nURL : ${info.message.originalUrl}\nMethod : ${info.message.method}\nbody : ${JSON.stringify(message)}`
        })
    ),
});

const errorLogger = winston.createLogger({
    transports: [
        new transports.DailyRotateFile({
            level:'error',
            dirname: '.log',
            filename: 'error.log',
            maxsize: '5m'
        })
    ],
    format: winston.format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.json(),
        winston.format.printf(info => {
            return `\nTimestamp : ${info.timestamp}\nLevel : ${info.level}\nURL : ${info.url}\nMethod : ${info.method}\nError : ${info.message}`;
           
        })
    ),
});

module.exports = {
    infoLogger: infoLogger,
    errorLogger:errorLogger
};