const express = require("express");
const eventsRouter = express.Router();
const mongoose = require("mongoose");

const { Event } = require("../models/EventModel");

// See all events, only admin should have this.
eventsRouter.get("/", async (req, res) => {
  try {
    const result = await Event.find({});
    res.status(200).json(result);
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

module.exports = eventsRouter;
