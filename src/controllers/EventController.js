const { User } = require("../models/UserModel");
const { Event } = require("../models/EventModel");
const mongoose = require("mongoose");

//This controller gets all events and returns them sorted by date. Viewable by all.
const getEvents = async (req, res) => {
  try {
    const result = await Event.find({}).sort({ date: 1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

//This controller gets only future events and returns them sorted by date. Viewable by users.
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

//This controller gets the users booked eventids and returns a list of the full event objects. Viewable by users.
const getUsersBookings = async (request, res) => {
  try {
    let user = await User.findOne({ _id: request.userID }).exec();
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


//This controller gets the users completed eventids and returns a list of the full event objects. Viewable by users.
const getUsersCompleted = async (request, res) => {
  try {
    let user = await User.findOne({ _id: request.userID }).exec();
    let userCompleted = user.completedRuns;

    let completedList = await Event.find({
      _id: { $in: userCompleted },
    }).exec();


    console.log(userCompleted);
    console.log(completedList);
    res.status(201).json(completedList);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

//This controller gets an events information from it's ID. Viewable by all.
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

//This controller creates a new event from the info passed in body. Only shown to trainers and admin and checked on the backend.
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

//This controller edits an event from the info passed in body. Only shown to trainers and admin and checked on the backend.
const changeEventById = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndUpdate(id, req.body, {returnDocument: "after"});
    res.send({ message: "Event saved" });
  } catch (error) {
    res.status(500).json(error);
  }
};

//This controller creates a booking within a users booking array. Usable by all.
const createBooking = async (request, res) => {
  try {
    const eventid = request.body.eventid;

    let user = await User.findOneAndUpdate(
      { _id: request.userID },
      { $addToSet: { bookings: eventid } }
    ).exec();
    // const user = await User.findOneAndUpdate(
    //   { _id: userid },
    //   { $addToSet: { bookings: eventid } }
    // );

    await user.save();
    res.send({ message: "Event Booked" });
  } catch (error) {
    res.status(500).json(error);
  }
};

//This controller removes a booking within a users booking array. Usable by all.
const removeBooking = async (request, res) => {
  try {
    const eventid = request.body.eventid;

    let user = await User.findOneAndUpdate(
      { _id: request.userID },
      { $pull: { bookings: eventid } }
    );
    await user.save();
    res.send({ message: "Booking Removed" });
  } catch (error) {
    res.status(500).json(error);
  }
};

//This controller removes a booking within a users booking array and places that eventid into the completed run list to track runs completed. Usable by all.
const userCompleteEvent = async (req, res) => {
  try {
    const userid = req.body.userid;
    const eventid = req.body.eventid;

    const user = await User.findOneAndUpdate(
      { _id: userid },
      { $pull: { bookings: eventid } }
    );

    await user.save();

    const usercomplete = await User.findOneAndUpdate(
      { _id: userid },
      { $addToSet: { completedRuns: eventid } }
    );

    await usercomplete.save();
    res.send({ message: "Event Completed!" });
  } catch (error) {
    res.status(500).json(error);
  }
};

//This controller finds and removes an event from the event id. Shown only to trainers and admin and checked on the backend.
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let event = await Event.findByIdAndDelete(id).exec();
    if (!event) {
      return res.status(404).json(`No event found with id: ${id}`);
    }

    res.status(200).json("Event deleted");
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
  removeBooking,
  userCompleteEvent,
  deleteEvent,
};
