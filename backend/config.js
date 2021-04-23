const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    db_connection: process.env.db_connection,
    token_secret: process.env.token_secret,
    port: process.env.port,
};
