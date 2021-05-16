const winston = require('winston');
const {format, transports } = require('winston');
require("winston-daily-rotate-file");


 const logger =  winston.createLogger({
        transports: [
            new transports.DailyRotateFile({
                dirname: '.log',
                filename: 'info.log',
                maxsize: '5m'
            })
        ],
        format: winston.format.combine(
            format.timestamp({format: 'YYYY-MM-DDTHH:mm:ss.sss'}),
            format.json(),
            winston.format.printf(info => JSON.stringify({
                url: info.url,
                user_id: info.id,
                firstname:info.firstname,
                lastname:info.lastname,
                message :info.message,
                timestamp : info.timestamp}))
        ),
    });

    module.exports = logger;