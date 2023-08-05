const { User } = require("../models/UserModel");
const { Event } = require("../models/EventModel");
const mongoose = require("mongoose");

const getEvents = async (req, res) => {
  try {
    const result = await Event.find({}).sort({ date: 1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getEventsUsers = async (req, res) => {
  try {
    const result = await Event.find({
      date: { $gt: new Date(Date.now()) },
    }).sort({ date: 1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getUsersBookings = async (req, res) => {
  try {
    const { username } = req.params;
    let user = await User.findOne({ username: username }).exec();
    let userBookings = user.bookings;
    let eventList = [];

    for (let booking of userBookings) {
      let event = await Event.findById(booking);
      eventList.push(event);
    }

    console.log(userBookings);
    console.log(eventList);
    res.status(201).json(eventList);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const getUsersCompleted = async (req, res) => {
  try {
    const { username } = req.params;
    let user = await User.findOne({ username: username }).exec();
    let userCompleted = user.completedRuns;
    let completedList = [];

    for (let event of userCompleted) {
      let completedRun = await Event.findById(event);
      completedList.push(completedRun);
    }

    console.log(userCompleted);
    console.log(completedList);
    res.status(201).json(completedList);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const getEventById = async (req, res) => {
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
};

const createEvent = async (req, res) => {
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
};

const changeEventById = async (req, res) => {
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
};

const createBooking = async (req, res) => {
  try {
    const userid = req.body.userid;
    const eventid = req.body.eventid;

    const user = await User.findOneAndUpdate(
      { _id: userid },
      { $addToSet: { bookings: eventid } }
    );
    await user.save();
    res.send({ message: "Event Booked" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteEvent = async (req, res) => {
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
};

module.exports = {
  getEvents,
  getEventsUsers,
  getUsersBookings,
  getUsersCompleted,
  getEventById,
  createEvent,
  changeEventById,
  createBooking,
  deleteEvent,
};
