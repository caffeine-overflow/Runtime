const logger = require('../utils/logger');

const errorHandler = (err,req,status)=>{
    const error = new Error(err);
    error.status = status;
    error.message = err.message;
    error.url = req.originalUrl;
    error.method = req.method;
    logger.errorLogger.error(error);
    return error;
}


module.exports = errorHandler;