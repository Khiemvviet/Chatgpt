const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    expected_answer: { type: String, required: true },
    chatgpt_response: { type: String, default: '' },
    domain: { 
        type: String, 
        enum: ['History', 'Social_Science', 'Computer_Security'],
        required: true 
    },
    response_time: { type: Number, default: 0 },
    accuracy_score: { type: Number, default: 0 },
    evaluated_at: { type: Date, default: Date.now }
});

const evaluationSchema = new mongoose.Schema({
    domain: { type: String, required: true },
    total_questions: { type: Number, default: 0 },
    correct_answers: { type: Number, default: 0 },
    average_response_time: { type: Number, default: 0 },
    evaluation_date: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', questionSchema, 'questions');

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = { Question, Evaluation };
