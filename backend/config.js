const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    db_connection: process.env.db_connection,
    demo_db_connection: process.env.demo_db_connection,
    token_secret: process.env.token_secret,
    port: process.env.port,
    client_domain:process.env.client_domain,
    github_client_id: process.env.github_client_id,
    github_client_secret: process.env.github_client_secret,
    runtime_email: process.env.runtime_email,
    runtime_password: process.env.runtime_password
};
