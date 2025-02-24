import mongoose from "mongoose";

const { Schema } = mongoose;

// ✅ Optimized Question Schema
const questionSchema = new Schema(
    {
        question_id: { type: Number },

        type: { type: String, required: true, enum: ["MCQ", "Integer"] },

        options: { 
            type: [String], 
            validate: {
                validator: function(value) {
                    if (this.type === "MCQ") return value.length === 4; 
                    return value.length === 0;
                },
                message: "MCQs must have exactly 4 options, Integer questions must have none."
            },
            default: []
        },

        answer: { 
            type: Number,
            validate: {
                validator: function(value) {
                    if (this.type === "MCQ") return value >= 1 && value <= 4;
                    return Number.isInteger(value);
                },
                message: props => `Invalid answer: ${props.value}`
            }
        },

        image: { type: String, default: null }, // ✅ Stores image URL if available
        subject: { type: String, required: true } // ✅ Subject (Mathematics, Physics, etc.)
    },
    { timestamps: true } // ✅ Automatically adds `createdAt` & `updatedAt`
);

// ✅ Function to Retrieve Existing Collections (Mongoose Handles Collection Creation)
const getQuestionModel = (collectionName) => {
    return mongoose.models[collectionName] || mongoose.model(collectionName, questionSchema, collectionName);
};

export default getQuestionModel;