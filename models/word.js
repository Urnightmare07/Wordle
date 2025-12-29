const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z]{5}$/
  }
});

module.exports = mongoose.model("Word", WordSchema);
