require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ChatGPT_Evaluation';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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

const History = mongoose.model('History', questionSchema, 'History');
const Social_Science = mongoose.model('Social_Science', questionSchema, 'Social_Science');
const Computer_Security = mongoose.model('Computer_Security', questionSchema, 'Computer_Security');

const Question = mongoose.model('Question', questionSchema, 'questions');

async function migrate() {
    try {
        const allQuestions = [];

        const historyQuestions = await History.find();
        const socialQuestions = await Social_Science.find();
        const securityQuestions = await Computer_Security.find();

        allQuestions.push(...historyQuestions, ...socialQuestions, ...securityQuestions);

        if (allQuestions.length === 0) {
            console.log('No questions found in the source collections.');
            return;
        }

        const questionsToInsert = allQuestions.map(q => ({
            question: q.question,
            expected_answer: q.expected_answer,
            chatgpt_response: q.chatgpt_response || '',
            domain: q.domain,
            response_time: q.response_time || 0,
            accuracy_score: q.accuracy_score || 0,
            evaluated_at: q.evaluated_at || new Date()
        }));

        await Question.insertMany(questionsToInsert);
        console.log(`Migrated ${questionsToInsert.length} questions into the 'questions' collection.`);

        mongoose.connection.close();
    } catch (err) {
        console.error('Migration error:', err);
    }
}

migrate();
