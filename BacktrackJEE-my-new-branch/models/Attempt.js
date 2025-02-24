import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // ID of the user
  user_name: { type: String, required: true }, // Name of the user
  year: { type: String, required: true }, // Exam year
  slot: { type: String, required: true }, // Exam slot
  
  // Answers should be an array of objects, each containing question_id and selected_answer
  answers: [
    {
      question_id: { type: Number }, // ID of the question
      selected_answer: { type: Number }, // User's selected answer
    },
  ],

  // Map of marked questions for review, stored dynamically with question_id as the key
  markedQuestions: { 
    type: Map, 
    of: String, // Values like "reviewedWithAnswer" or "reviewedWithoutAnswer"
    default: {}  // Default empty object if no questions are marked
  },

  // Timestamps to track when the attempt was created and last updated
}, { timestamps: true });

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;