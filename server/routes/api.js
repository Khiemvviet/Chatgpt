const express = require('express');
const router = express.Router();
const { Question, Evaluation } = require('../models/database');

router.get('/add', (req, res) => {
    const { a, b } = req.query;

    if (!a || !b || isNaN(parseFloat(a)) || isNaN(parseFloat(b))) {
        return res.status(400).json({ 
            error: 'Invalid parameters. Please provide numeric values for a and b.' 
        });
    }

    const result = parseFloat(a) + parseFloat(b);
    res.json({ result });
});

router.get('/results', async (req, res) => {
    try {
        const questions = await Question.find();

        if (questions.length === 0) {
            return res.json({ message: 'No questions evaluated yet.' });
        }

        const domains = ['History', 'Social_Science', 'Computer_Security'];
        const accuracy = {};
        const responseTimes = {};

        domains.forEach(domain => {
            const domainQuestions = questions.filter(q => q.domain === domain);
            const total = domainQuestions.length;

            if (total === 0) {
                accuracy[domain] = 0;
                responseTimes[domain] = 0;
            } else {
                accuracy[domain] = domainQuestions.reduce((sum, q) => sum + q.accuracy_score, 0) / total;
                responseTimes[domain] = domainQuestions.reduce((sum, q) => sum + q.response_time, 0) / total;
            }
        });

        const results = {
            accuracy,
            responseTimes,
            totalQuestions: questions.length,
            evaluationDate: new Date().toISOString()
        };

        res.json(results);

    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

module.exports = router;
