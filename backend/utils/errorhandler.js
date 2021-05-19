const logger = require('../utils/logger');

const errorHandler = (err,req,status)=>{
    console.log(req)
    const error = new Error(err);
    error.status = status;
    error.message = err.message;
    error.url = req.originalUrl;
    error.method = req.method
    logger.error(error);
    return error;
}


module.exports = errorHandler;