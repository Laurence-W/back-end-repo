const express = require("express");
const eventsRouter = express.Router();
const mongoose = require("mongoose");

const { Event } = require("../models/EventModel");
const { User } = require("../models/UserModel");

const {
  extractJwtData,
  verifyAndValidateUserJWT,
  checkAdminOrTrainerStatus,
} = require("../middleware/AuthMiddleware");
const { handleErrors } = require("../middleware/ErrorHandler");

const {
  getEvents,
  getEventsUsers,
  getUsersBookings,
  getUsersCompleted,
  getEventById,
  createEvent,
  changeEventById,
  createBooking,
  removeBooking,
  userCompleteEvent,
  deleteEvent,
} = require("../controllers/EventController");

// See all events, only admin should have this.
eventsRouter.get("/all", getEvents);

// See only future events
eventsRouter.get("/users", getEventsUsers);

// Get a list of user bookings
eventsRouter.get(
  "/userbookings",
  verifyAndValidateUserJWT,
  extractJwtData,
  getUsersBookings
);

// Get a list of user's completed runs'
eventsRouter.get(
  "/usercompleted",
  verifyAndValidateUserJWT,
  extractJwtData,
  getUsersCompleted
);

// return the details for a single event
eventsRouter.get("/by-id/:id", getEventById);

// Create a new event, no trainer validation yet.
eventsRouter.post(
  "/",
  verifyAndValidateUserJWT,
  extractJwtData,
  checkAdminOrTrainerStatus,
  createEvent
);

// edit a single event
eventsRouter.put(
  "/change-event/:id",
  verifyAndValidateUserJWT,
  extractJwtData,
  checkAdminOrTrainerStatus,
  changeEventById
);

// add an event to a user's bookings
eventsRouter.put(
  "/bookuser",
  verifyAndValidateUserJWT,
  extractJwtData,
  createBooking
);

// remove an event from a user's bookings
eventsRouter.put(
  "/removebooking",
  verifyAndValidateUserJWT,
  extractJwtData,
  removeBooking
);

// remove an event from a user's bookings
eventsRouter.put("/completebooking", userCompleteEvent);

// for admin/trainer to remove an event
eventsRouter.delete(
  "/:id",
  verifyAndValidateUserJWT,
  extractJwtData,
  checkAdminOrTrainerStatus,
  deleteEvent
);

module.exports = eventsRouter;
