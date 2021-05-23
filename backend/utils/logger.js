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
            return `\nTimestamp : ${info.timestamp}\nURL : ${info.message.originalUrl}\nMethod : ${info.message.method}\nUser Name : ${info.message.user.firstname + " " + info.message.user.lastname}\nEmail : ${info.message.user.email}${ info.message.method === "GET" ? "" : "\nbody : " + JSON.stringify(message)}`
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
            return `\nTimestamp : ${info.timestamp}\nUser Name : ${info.user_name}\nEmail : ${info.email}\nURL : ${info.url}\nMethod : ${info.method}\n${info.stack}`;
           
        })
    ),
});

module.exports = {
    infoLogger: infoLogger,
    errorLogger:errorLogger
};