import express from "express";
import mongoose from "mongoose";
import Attempt from "../models/Attempt.js"; // ✅ Ensure correct file path
import Result from "../models/Result.js"; // ✅ Ensure correct file path
import authenticateUser from "../middleware/authmiddleware.js"; // ✅ Ensure correct file path

const router = express.Router();

// 🧠 Calculate and Store Exam Results
router.get("/calculate", authenticateUser, async (req, res) => {
    const { user_id, year, slot } = req.query;

    if (!user_id || !year || !slot) {
        return res.status(400).json({ error: "Missing parameters: user_id, year, slot" });
    }

    try {
        // 1️⃣ Fetch the user's attempt & questions **in parallel** to reduce latency
        const collectionName = `${year}_${slot}`.replace(/\s+/g, "_"); // ✅ Ensure consistent collection names

        const [attempt, questions] = await Promise.all([
            Attempt.findOne({ user_id, year, slot }).sort({ createdAt: -1 }), // ✅ Find the latest
            mongoose.connection.useDb("Mains").collection(collectionName).find({}, { projection: { question_id: 1, answer: 1 } }).toArray()
        ]);

        if (!attempt) return res.status(404).json({ error: "Attempt not found" });
        if (!questions.length) return res.status(404).json({ error: "No questions found for this exam." });

        // 2️⃣ Convert questions into a **Map** for O(1) lookup (Ensuring question_id is a number)
        const correctAnswersMap = new Map(questions.map(q => [parseInt(q.question_id, 10), parseInt(q.answer, 10)]));

        console.log("✅ Attempt Answers:", attempt.answers);
        console.log("✅ Questions Fetched from DB:", questions);
        console.log("✅ Correct Answers Map:", correctAnswersMap);

        // 3️⃣ Initialize score counters
        let correct = 0, incorrect = 0, unattempted = 0, totalMarks = 0;

        // 4️⃣ Process user's answers efficiently
        const detailedResults = questions.map(({ question_id }) => {
            // Find if user attempted this question
            const userAttempt = attempt.answers.find(a => parseInt(a.question_id, 10) === parseInt(question_id, 10));
            const userAnswer = userAttempt?.selected_answer !== undefined && userAttempt?.selected_answer !== "" 
                ? parseInt(userAttempt.selected_answer, 10) 
                : null;
            const correctAnswer = correctAnswersMap.has(parseInt(question_id, 10)) 
                ? correctAnswersMap.get(parseInt(question_id, 10)) 
                : null;
        
            let status = "unattempted";
            
            if (userAnswer !== null) {
                if (userAnswer === correctAnswer) {
                    status = "correct";
                    correct++;
                    totalMarks += 4;
                } else {
                    status = "incorrect";
                    incorrect++;
                    totalMarks -= 1;
                }
            } else {
                unattempted++;
            }
        
            console.log(`🧐 QID: ${question_id} | 👤 User: ${userAnswer} | 🎯 Correct: ${correctAnswer} | 🛠 Status: ${status}`);
        
            return { question_id, user_answer: userAnswer, correct_answer: correctAnswer, status };
        });        

        // 5️⃣ Prepare result object
        const resultData = {
            user_id: attempt.user_id,
            user_name: attempt.user_name,
            year: attempt.year,
            slot: attempt.slot,
            total_questions: questions.length,
            correct_answers: correct,
            incorrect_answers: incorrect,
            unanswered: unattempted,
            score: totalMarks,
            answers: detailedResults,
        };

        // 6️⃣ Upsert (update or insert) result efficiently
        await Result.updateOne(
            { user_id, year, slot },
            { $set: resultData },
            { upsert: true } // ✅ Create if not exists
        );

        res.status(200).json(resultData);
    } catch (error) {
        console.error("❌ Error calculating results:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
