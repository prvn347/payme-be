const mongoose = require("mongoose");
const { object, Schema, number } = require("zod");
require("dotenv").config();

console.log(process.env.DATABASE_URL);

mongoose.connect(process.env.DATABASE_URL);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Payuser",
  },
  balence: {
    type: Number,
    required: true,
  },
});

const Payuser = mongoose.model("Payuser", userSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = {
  Payuser,
  Account,
};
