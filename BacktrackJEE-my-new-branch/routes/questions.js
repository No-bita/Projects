import express from "express";
import mongoose from "mongoose";
import QuestionSchema from "../models/Question.js"; 

const router = express.Router();

// ✅ Route to fetch questions based on year and slot
router.post("/", async (req, res) => {
  try {
    const { year, slot } = req.body;

    if (!year || !slot) {
      return res.status(400).json({ message: "Year and Slot parameters are required." });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "MongoDB is not connected." });
    }

    // ✅ Construct the formatted collection name (year_slot)
    const formattedSlot = `${year}_${slot.trim().replace(/\s+/g, "_")}`;
    console.log("🔍 Searching in collection:", formattedSlot); // ✅ Debugging

    // ✅ Cache the model if it does not already exist
    if (!mongoose.models[formattedSlot]) {
      mongoose.model(formattedSlot, new mongoose.Schema(QuestionSchema.obj), formattedSlot);
    }
    const QuestionModel = mongoose.models[formattedSlot];

    // ✅ Fetch questions from the dynamically named collection
    const questions = await QuestionModel.find({}).lean();

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this slot." });
    }

    res.json(questions);
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

export default router;
