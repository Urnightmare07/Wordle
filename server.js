require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./database");
const Word = require("./models/word");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// GET RANDOM WORD
app.get("/word", async (req, res) => {
  try {
    const count = await Word.countDocuments();
    if (count === 0) {
      return res.status(500).json({ error: "No words found" });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const wordDoc = await Word.findOne().skip(randomIndex);

    if (!wordDoc) {
      return res.status(500).json({ error: "Failed to select word" });
    }

    const answer = wordDoc.word.toLowerCase();

    
    console.log("WORDLE ANSWER:", answer);

    res.json({ word: answer });
  } catch (err) {
    console.error("Word fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// VALIDATE WORD
app.post("/validate", async (req, res) => {
  try {
    const { word } = req.body;

    if (!word || typeof word !== "string" || word.length !== 5) {
      return res.json({ valid: false });
    }

    const exists = await Word.findOne({ word: word.toLowerCase() });
    res.json({ valid: !!exists });
  } catch (err) {
    res.status(500).json({ valid: false });
  }
});
// START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
