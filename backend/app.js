const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

if(process.env.Node_ENV !== "PRODUCTION"){
    require("dotenv").config({path: "backend/config/config.env"});
}

//Using middlewares
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());

// Importing all routes
const post = require("./routes/post");
const user = require("./routes/user");

//Using all routes
app.use("/api/v1", post);
app.use("/api/v1", user);

module.exports = app;

