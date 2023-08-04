const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: String,
  location: String,
  date: Date,
  distance: String,
  difficulty: String,
  // trainer: { type: mongoose.Types.ObjectId, ref: "User" },
  trainer: String,
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { Event };

//Early model without required, unique/validation.
