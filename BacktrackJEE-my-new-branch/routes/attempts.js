import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authmiddleware.js"; // ✅ Ensure correct middleware import
import Attempt from "../models/Attempt.js"; // ✅ Ensure correct path

const router = express.Router();

router.use(express.json());

// ✅ API to save user attempts
router.post("/save-attempt", authMiddleware, async (req, res) => {
    try {
        const { user_id, user_name, year, slot, answers, markedQuestions } = req.body;

        // ✅ Validate required fields
        if (!user_id || !user_name || !year || !slot || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Missing or invalid required fields" });
        }

        // ✅ Ensure `question_id` and `selected_answer` are numbers
        const formattedAnswers = answers.map(answer => ({
            question_id: Number(answer.question_id), // Convert question_id to number
            selected_answer: answer.selected_answer !== null ? Number(answer.selected_answer) : null, // Convert answer to number or keep null
        }));

        // ✅ Ensure `markedQuestions` exists
        const formattedMarkedQuestions = markedQuestions || {}; // Default to empty object

        // ✅ Save attempt in MongoDB
        const attemptRecord = new Attempt({ 
            user_id, 
            user_name, 
            year, 
            slot, 
            answers: formattedAnswers, 
            markedQuestions: formattedMarkedQuestions
        });

        await attemptRecord.save();

        return res.status(201).json({ message: "Attempt saved successfully" });

    } catch (error) {
        console.error("Error saving attempt:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export default router; // ✅ Use ES Modules export
