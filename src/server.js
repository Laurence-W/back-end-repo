const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

const helmet = require("helmet");
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
    },
  })
);

const cors = require("cors");
var corsOptions = {
  origin: ["http://localhost:3000", "https://therunclub.netlify.app"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const mongoose = require("mongoose");
var databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
  case "test":
    databaseURL = "mongodb://localhost:27017/run-club-db-test";
    break;
  case "development":
    databaseURL = "mongodb://localhost:27017/run-club-db-dev";
    break;
  case "production":
    databaseURL = process.env.DATABASE_URL;
    break;
  default:
    console.error(
      "Incorrect JS environment specified, database will not be connected."
    );
    break;
}
const { databaseConnector } = require("./database");
databaseConnector(databaseURL)
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((error) => {
    console.log(`
    Some error occurred connecting to the database! It was: 
    ${error}
    `);
  });

// Details from the database connection with /databaseHealth route
app.get("/databaseHealth", (request, response) => {
  let databaseState = mongoose.connection.readyState;
  let databaseName = mongoose.connection.name;
  let databaseModels = mongoose.connection.modelNames();
  let databaseHost = mongoose.connection.host;

  response.json({
    readyState: databaseState,
    dbName: databaseName,
    dbModels: databaseModels,
    dbHost: databaseHost,
  });
});

const usersRoutes = require("./routes/UserRoutes");
app.use("/users", usersRoutes);

const eventRoutes = require("./routes/EventRoutes");
app.use("/events", eventRoutes);

app.use((error, request, response, next) => {
  let importantInformation = {
    url: request.originalURL,
    params: request.params,
    verb: request.method,
    host: request.hostname,
    ip: request.ip
  };

  console.log("Request received: \n" + JSON.stringify(importantInformation, null, 4));
  response.status(error.statusCode).json(error.message);
})

app.get("/", (request, response) => {
  response.json({
    message: "Hello world!",
  });
});

// This route is placed last before the module.exports.
// 404 route should only trigger if no preceding routes or middleware ran.
app.get("*", (request, response) => {
  response.status(404).json({
    message: "No route with that path found!",
    attemptedPath: request.path,
  });
});

module.exports = {
  PORT,
  app,
};
