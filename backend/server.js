const express = require('express');
const http = require("http");
const app = express();
const { db_connection } = require("./config");
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
let server = http.createServer(app);
const socketIO = require('socket.io');
let io = socketIO(server);
const userroutes = require('./routes/userroutes');
const collaborateroutes = require('./routes/collaborateroutes');
const authroutes = require('./routes/authroutes');
const projectroutes = require('./routes/projectroutes');
const sprintroutes = require('./routes/sprintroutes');
const userstoryroutes = require('./routes/userstoryroutes');
const gitRoutes = require('./github/gitRoutes');
const gitauthroutes = require('./github/authroutes');

//middlewares
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.enable("trust proxy");
// app.use((req, res, next) => {
//     req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
// });
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    return next();
});

//declare routes
app.use('/auth', authroutes.router);
app.use('/gitauth', gitauthroutes);
app.use('/api/git', gitRoutes);
app.use('/api/users', userroutes);
app.use('/api/collaborate', collaborateroutes);
app.use('/api/projects', projectroutes);
app.use('/api/sprints', sprintroutes);
app.use('/api/userstories', userstoryroutes);

//entry for the website
app.use(express.static(path.join(__dirname, "website")));
app.get("/home", (request, response) => {
    console.log(request.url)
    response.sendFile(path.join(__dirname, "website/index.html"));
});

//entry to the app
app.use(express.static(path.join(__dirname, "public")));
app.get("/*", (request, response) => {
    response.sendFile(path.join(__dirname, "public/index.html"))
});

//sockets
io.on('connection', (socket) => console.log('new connection established'));

//mongo db connection
mongoose.connect(db_connection, { useNewUrlParser: true, useUnifiedTopology: true });

app.use((error, req, res, next) => {
    return res.status(error.status).send({ msg: error.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

