import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true }, // ✅ Store user ID as Number if numeric
    user_name: { type: String, required: true }, // User's name
    year: { type: String, required: true }, // Exam year
    slot: { type: String, required: true }, // Exam slot

    total_questions: { type: Number, required: true }, // Total number of questions
    correct_answers: { type: Number, required: true }, // Correct answers
    incorrect_answers: { type: Number, required: true }, // Incorrect answers
    unanswered: { type: Number, required: true }, // Unattempted questions

    score: { type: Number, required: true }, // ✅ Total score
    // ❌ Removed `percentage` - will calculate dynamically when needed

    // ✅ Store detailed answers with structure
    answers: [
      {
        question_id: { type: Number, required: true },
        user_answer: { type: Number, default: null }, // ✅ Allow `null` for unattempted questions
        correct_answer: { type: Number, default: null }, // ✅ Allow `null` instead of forcing a required value
        status: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);
export default Result;