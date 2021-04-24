const express = require('express');
const app = express();
const { db_connection, port } = require("./config");
const mongoose = require('mongoose');
const cors = require('cors');
const userroutes = require('./routes/userroutes');
const authroutes = require('./routes/authroutes');
const projectroutes = require('./routes/projectroutes');
const teamroutes = require('./routes/teamroutes');
const sprintroutes = require('./routes/sprintroutes');
const userstoryroutes = require('./routes/userstoryroutes');

//mongo db connection
mongoose.connect(db_connection, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(function (req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://apis.google.com");
    return next();
});

//middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


//declare routes
app.use('/auth', authroutes.router);
app.use('/api/users', userroutes);
app.use('/api/projects', projectroutes);
app.use('/api/teams', teamroutes);
app.use('/api/sprints', sprintroutes);
app.use('/api/userstories', userstoryroutes);


app.listen(port, () => console.log(`Listening on port ${port}`));

