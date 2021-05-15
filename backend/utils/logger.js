const winston = require('winston');
const {format, transports, level } = require('winston');
require("winston-daily-rotate-file");


  module.exports =  winston.createLogger({
        transports: [
            new transports.DailyRotateFile({
                dirname: '.log',
                filename: 'info.log',
                maxsize: '5m',
                format: format.combine(
                    format.timestamp({ format: 'YYYY-MM-DD' })
                ),
            })
        ],
        format: winston.format.combine(
            format.timestamp({format: 'YYYY-MM-DDTHH:mm:ss.sss'}),
            format.json(),
            winston.format.printf(info => JSON.stringify({ level: info.level ,timestamp : info.timestamp, info :info.message}))
        ),
    });
