global.config = require("./config.json");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const authController = require("./controllers/auth-controller");
const vacationsController = require("./controllers/vacations-controller");
const destinationController = require("./controllers/destination-controller");
const socketIO = require("socket.io");

const server = express();

server.use(session({
    name: "VacationSession", // Name of the Cookie
    secret: "Seal", // Encryption key for the session id
    resave: true, // Start counting session time on each request.
    saveUninitialized: false // Don't create session automatically.
}));

server.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
}));

server.use(fileUpload());

// if "./uploads" doesn't exist: 
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

server.use(express.json());
server.use('/upload', express.static('uploads'));
server.use("/api/auth", authController);
server.use("/api", vacationsController);
server.use("/api/destinations", destinationController);


// Creating the socket.io server on top of express listener: 
const listener = server.listen(3000, () => console.log("Listening on http://localhost:3000"));

global.socketServer = socketIO(listener);