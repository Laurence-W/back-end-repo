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
    bookings: [],
    isAdmin: 0,
    isTrainer: 0,
    bookings: [],
    completedRuns: [],
  },
  {
    firstName: "User2",
    lastName: "User2Last",
    username: "User2name",
    email: "User2email@email.com",
    password: "User2Pass",
    bookings: [],
    isAdmin: 0,
    isTrainer: 0,
    bookings: [],
    completedRuns: [],
  },
  {
    firstName: "User3",
    lastName: "User3Last",
    username: "User3name",
    email: "User3email@email.com",
    password: "User3Pass",
    bookings: [],
    isAdmin: 0,
    isTrainer: 0,
    bookings: [],
    completedRuns: [],
  },
  {
    firstName: "Trainer1",
    lastName: "Trainer1Last",
    username: "Trainer1name",
    email: "Trainer1email@email.com",
    password: "Trainer1Pass",
    bookings: [],
    isAdmin: 0,
    isTrainer: 1,
    bookings: [],
    completedRuns: [],
  },
  {
    firstName: "Trainer2",
    lastName: "Trainer2Last",
    username: "Trainer2name",
    email: "Trainer2email@email.com",
    password: "Trainer2Pass",
    bookings: [],
    isAdmin: 0,
    isTrainer: 1,
    bookings: [],
    completedRuns: [],
  },
  {
    firstName: "Admin1",
    lastName: "Admin1Last",
    username: "Admin1name",
    email: "Admin1email@email.com",
    password: "UAdmin1Pass",
    isAdmin: 1,
    isTrainer: 0,
    bookings: [],
    completedRuns: [],
  },
];

// Add data to Events collection, using schema
// trainer is added later from usersCreated = await User.insertMany(users);
const events = [
  {
    name: "Sunrise Run",
    location: "Shop Road",
    date: "2023-06-01",
    distance: "3.5",
    difficulty: "Medium",
    trainer: null,
  },
  {
    name: "Afternoon Jog",
    location: "Beach Path",
    date: "2023-08-01",
    distance: "3.5",
    difficulty: "Medium",
    trainer: null,
  },
  {
    name: "Morning Marathon",
    location: "Beach Path",
    date: "2023-08-10",
    distance: "42",
    difficulty: "Hard",
    trainer: null,
  },
  {
    name: "Saturday Run",
    location: "Beach Path",
    date: "2023-08-15",
    distance: "4",
    difficulty: "Easy",
    trainer: null,
  },
  {
    name: "Evening Sprints",
    location: "Park",
    date: "2023-08-20",
    distance: "2",
    difficulty: "Medium",
    trainer: null,
  },
  {
    name: "Late Night Recovery Run",
    location: "Shop Road",
    date: "2023-08-30",
    distance: "2",
    difficulty: "Easy",
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
    
    // Add trainer to events (currently users[3] is a trainer)
    for (const event of events) {
      event.trainer = users[3].username;
    }
    // Then save the events to the database.
    let eventsCreated = await Event.insertMany(events);
    
    for (const user of users) {
      user.password = await hashString(user.password);
    }

    // Add trainer to events (currently usersCreated[3] is a trainer)
    for (const event of events) {
      event.trainer = users[3].username;
    }

    // Then save the events to the database.
    let eventsCreated = await Event.insertMany(events);

    // Add some created event ids to the user's bookings array
    for (const user of users) {
      user.bookings.push(eventsCreated[2].id);
      user.bookings.push(eventsCreated[3].id);
      user.bookings.push(eventsCreated[4].id);
    }

    //Add some created event ids to the user's completedRuns array
    for (const user of users) {
      user.completedRuns.push(eventsCreated[0].id);
      user.completedRuns.push(eventsCreated[1].id);
    }

    // Save the users to the database.
    let usersCreated = await User.insertMany(users);

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
