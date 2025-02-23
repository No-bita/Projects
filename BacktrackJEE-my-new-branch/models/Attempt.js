import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  year: { type: String, required: true },
  slot: { type: String, required: true },
  answers: [
    {
      question_id: { type: String, required: true }, // ID of the question
      selected_answer: { type: String, default: "" }, // Allow empty string as default
    },
  ],
  markedQuestions: { type: Map, of: String }, // Map of marked questions
});

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;