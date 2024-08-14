var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var connectionRouter = require("./routes/connection");
var accountManagingRouter = require("./routes/account_managing");
var cors = require("cors");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev")); // Log all HTTP requests to the console
app.use(express.json()); // Parse JSON payloads in request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(cookieParser()); // Parse Cookie header and populate req.cookies
app.use(express.static(path.join(__dirname, "public")));

app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS) for all routes

app.use("/api/connection", connectionRouter);
app.use("/api/account_managing", accountManagingRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("NOT FOUND!!!");
  next(createError(404));
});

// Central error handler - catches all errors passed to next(error)
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
