const express = require("express");
const eventsRouter = express.Router();
const mongoose = require("mongoose");

const { Event } = require("../models/EventModel");
const { User } = require("../models/UserModel");

// See all events, only admin should have this.
eventsRouter.get("/", async (req, res) => {
  try {
    const result = await Event.find({}).sort({ date: 1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// See only future events
eventsRouter.get("/users", async (req, res) => {
  try {
    const result = await Event.find({
      date: { $gt: new Date(Date.now()) },
    }).sort({ date: 1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// return the details for a single event
eventsRouter.get("/by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json(`No event found with id: ${id}`);
    }

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new event, no trainer validation yet.
eventsRouter.post("/", async (req, res) => {
  const event = new Event({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    location: req.body.location,
    date: req.body.date,
    time: req.body.time,
    distance: req.body.distance,
    difficulty: req.body.difficulty,
    trainer: req.body.trainer,
  });
  console.log(event);

  try {
    const result = await event.save();
    res.status(201).json({
      createdEvent: {
        name: result.name,
        location: result.location,
        date: result.date,
        time: result.time,
        distance: result.distance,
        difficulty: result.difficulty,
        trainer: result.trainer,
        _id: result._id,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// edit a single event
eventsRouter.put("/change-event/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    event.name = req.body.name;
    event.location = req.body.location;
    event.date = req.body.date;
    event.time = req.body.time;
    event.distance = req.body.distance;
    event.difficulty = req.body.difficulty;
    event.trainer = req.body.trainer;
    await event.save();
    res.send({ message: "Event Updated" });
  } catch (error) {
    res.status(500).json(error);
  }
});

eventsRouter.put("/bookuser", async (req, res) => {
  try {
    const userid = req.body.userid;
    const eventid = req.body.eventid;

    const user = await User.findOneAndUpdate(
      { _id: userid },
      { $push: { bookings: eventid } }
    );
    await user.save();
    res.send({ message: "Event Booked" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// for admin/trainer to remove an event
eventsRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json(`No event found with id: ${id}`);
    }

    res.status(200).send("Event deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = eventsRouter;
