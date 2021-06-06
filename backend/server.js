const express = require('express');
const app = express();
const { db_connection, port } = require("./config");
const mongoose = require('mongoose');
const cors = require('cors');
const userroutes = require('./routes/userroutes');
const authroutes = require('./routes/authroutes');
const projectroutes = require('./routes/projectroutes');
const sprintroutes = require('./routes/sprintroutes');
const userstoryroutes = require('./routes/userstoryroutes');
const gitRoutes = require('./github/gitRoutes');
const gitauthroutes = require('./github/authroutes');
const path = require('path');

//middlewares
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//declare routes
app.use('/auth', authroutes.router);
app.use('/gitauth', gitauthroutes);
app.use('/api/git', gitRoutes);
app.use('/api/users', userroutes);
app.use('/api/projects', projectroutes);
app.use('/api/sprints', sprintroutes);
app.use('/api/userstories', userstoryroutes);

app.enable("trust proxy");
app.use((req, res, next) => {
    req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
});

app.use(express.static('public'));
app.get("/*", (request, response) => {
    response.sendFile(path.join(__dirname, "public/index.html"));
});

//mongo db connection
mongoose.connect(db_connection, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    return next();
});


app.use((error, req, res, next) => {
    return res.status(error.status).send({ msg: error.message });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

