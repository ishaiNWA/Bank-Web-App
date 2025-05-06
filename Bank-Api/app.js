require("dotenv").config({ path: "./.env" });
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morganLogger = require("morgan");
const generateRequestId = require("./middlewares/request-id-generator")
const IAmRouter = require("./routes/i-am-route");
const finOpsRouter = require("./routes/fin-ops-route");
const finSchedulerRouter = require("./routes/fin-scheduler-router");
const cors = require("cors");
const dbClient = require("./services/db-service");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml'); // Path to your swagger file
const rabbitService = require("./services/rabbitmq-producer");

const app = express();

// const errorHandler = require("./middleware/errors"); TODO :: create error handler...

const PORT = process.env.PORT || 3000;

let server;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(morganLogger("dev")); // Log all HTTP requests to the console
app.use(express.json()); // Parse JSON payloads in request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies (as sent by HTML forms)
app.use(cookieParser()); // Parse Cookie header and populate req.cookies
app.use(express.static(path.join(__dirname, "public")));
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(generateRequestId);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/i-am", IAmRouter);
app.use("/api/fin-ops", finOpsRouter);
app.use("/api/fin-scheduler", finSchedulerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Central error handler - catches all errors passed to next(error)
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parsing errors
    return res.status(400).json({ 
      message: "Invalid JSON syntax", 
      description: "The request contains malformed JSON",
      type: "error",
      details: err.message
    });
    
  }
  
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

dbClient
  .connectToDB()
  .then(()=>{
    rabbitService.init()
  })
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`Web-Bank-App server is listening on port ${PORT}.`);
    });
    // Error handling
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error("Server error:", error);
      }
      process.exit(1);
    });

    ["SIGTERM", "SIGINT"].forEach((endingSignal) => {
      process.on(endingSignal, () => {
        console.log(
          `\n${endingSignal} ending signal was sent. shut down server gracefully and exit program.`
        );
        server.close(() => {
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error(`failed to init bank-api server`, error);
    process.exit(1);
  });
