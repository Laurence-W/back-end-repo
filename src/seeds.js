const mongoose = require("mongoose");
const { databaseConnector } = require("./database");

// Import the models
const { User } = require("./models/UserModel");
const { Event } = require("./models/EventModel");

// Make sure this file can read environment variables.
const dotenv = require("dotenv");
dotenv.config();

const { hashString } = require("./services/auth_services");
// Add data to Users collection, using schema
const users = [
  {
    firstName: "User1",
    lastName: "User1Last",
    username: "User1name",
    email: "User1email@email.com",
    password: "User1Pass",
    isAdmin: 0,
    isTrainer: 0,
  },
  {
    firstName: "User2",
    lastName: "User2Last",
    username: "User2name",
    email: "User2email@email.com",
    password: "User2Pass",
    isAdmin: 0,
    isTrainer: 0,
  },
  {
    firstName: "User3",
    lastName: "User3Last",
    username: "User3name",
    email: "User3email@email.com",
    password: "User3Pass",
    isAdmin: 0,
    isTrainer: 0,
  },
  {
    firstName: "Trainer1",
    lastName: "Trainer1Last",
    username: "Trainer1name",
    email: "Trainer1email@email.com",
    password: "Trainer1Pass",
    isAdmin: 0,
    isTrainer: 1,
  },
  {
    firstName: "Trainer2",
    lastName: "Trainer2Last",
    username: "Trainer2name",
    email: "Trainer2email@email.com",
    password: "Trainer2Pass",
    isAdmin: 0,
    isTrainer: 1,
  },
  {
    firstName: "Admin1",
    lastName: "Admin1Last",
    username: "Admin1name",
    email: "Admin1email@email.com",
    password: "UAdmin1Pass",
    isAdmin: 1,
    isTrainer: 0,
  },
];

// Add data to Events collection, using schema
// trainer is added later from usersCreated = await User.insertMany(users);
const events = [
  {
    name: "Afternoon Jog",
    location: "Beach Path",
    date: "2023-07-21",
    distance: "3.5",
    difficulty: "Medium",
    trainer: null,
  },
  {
    name: "Morning Marathon",
    location: "Beach Path",
    date: "2023-07-28",
    distance: "42",
    difficulty: "Hard",
    trainer: null,
  },
  {
    name: "Saturday Run",
    location: "Beach Path",
    date: "2023-08-19",
    distance: "4",
    difficulty: "Easy",
    trainer: null,
  },
  {
    name: "Evening Sprints",
    location: "Park",
    date: "2023-08-28",
    distance: "2",
    difficulty: "Medium",
    trainer: null,
  },
];

// Connect to the database.
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

// Wipe database and seed data
databaseConnector(databaseURL)
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((error) => {
    console.log(`
    Error occurred connecting to the database: 
    ${error}
    `);
  })
  .then(async () => {
    if (process.env.WIPE == "true") {
      // Get the names of all collections in the DB.
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();

      // Empty the data and collections from the DB so that they no longer exist.
      collections
        .map((collection) => collection.name)
        .forEach(async (collectionName) => {
          mongoose.connection.db.dropCollection(collectionName);
        });
      console.log("Old DB data deleted.");
    }
  })
  .then(async () => {
    for (const user of users) {
      user.password = await hashString(user.password);
    }

    // Save the users to the database.
    let usersCreated = await User.insertMany(users);

    // Add trainer to events (currently usersCreated[3] is a trainer)
    for (const event of events) {
      event.trainer = usersCreated[3].id;
    }
    // Then save the events to the database.
    let eventsCreated = await Event.insertMany(events);

    // Log all data created.
    console.log(
      "New DB data created.\n" +
        JSON.stringify({ users: usersCreated, events: eventsCreated }, null, 4)
    );
  })
  .then(() => {
    // Disconnect from the database.
    mongoose.connection.close();
    console.log("DB seed connection closed.");
  });
