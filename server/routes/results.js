const express = require('express');
const { Question } = require('../models/database');
const router = express.Router();

// GET /api/results
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();

    if (!questions.length) {
      return res.json({ accuracy: {}, responseTimes: {}, totalQuestions: 0 });
    }

    // Aggregate metrics per domain
    const domainStats = {};

    questions.forEach(q => {
      if (!domainStats[q.domain]) {
        domainStats[q.domain] = { accuracySum: 0, responseTimeSum: 0, count: 0 };
      }
      domainStats[q.domain].accuracySum += q.accuracy_score || 0; // 0–1 assumed
      domainStats[q.domain].responseTimeSum += q.response_time || 0;
      domainStats[q.domain].count += 1;
    });

    const accuracy = {};
    const responseTimes = {};

    for (const domain in domainStats) {
      const stats = domainStats[domain];
      // Keep as decimal (0–1)
      accuracy[domain] = stats.accuracySum / stats.count;

      // Response time in seconds
      responseTimes[domain] = parseFloat((stats.responseTimeSum / stats.count / 1000).toFixed(2));
    }

    res.json({ accuracy, responseTimes, totalQuestions: questions.length });

  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});


module.exports = router;

// Invoke-RestMethod -Uri "http://localhost:3000/api/chatgpt/evaluate/batch" `  -Method POST `  -Headers @{ "Content-Type" = "application/json" } `  -Body '{ "domain": "History" }'