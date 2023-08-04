const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bookings: [{ type: mongoose.Types.ObjectId, ref: "Event" }],
  isAdmin: Boolean,
  isTrainer: Boolean,
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
