const express = require('express');
const { OpenAI } = require('openai');
const { Question } = require('../models/database');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log("CHATGPT ROUTE KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function extractAnswer(response) {
  const match = response.match(/[A-D]/i);
  return match ? match[0].toUpperCase() : response.trim();
}

// Evaluate a single question
router.post('/evaluate', async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ error: 'questionId is required' });

    const questionDoc = await Question.findById(questionId);
    if (!questionDoc) return res.status(404).json({ error: 'Question not found' });

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "user", 
          content: `Choose the correct answer only (A, B, C, or D) for this question: ${questionDoc.question}` 
        }
      ],
      max_tokens: 10
    });
    const responseTime = Date.now() - startTime;

    let chatgptResponse = completion.choices[0].message.content.trim();
    chatgptResponse = extractAnswer(chatgptResponse);

    const expected = questionDoc.expected_answer.trim().toUpperCase();
    const accuracy = chatgptResponse === expected ? 1 : 0;

    questionDoc.chatgpt_response = chatgptResponse;
    questionDoc.response_time = responseTime;
    questionDoc.accuracy_score = accuracy;
    questionDoc.evaluated_at = new Date();
    await questionDoc.save();

    res.json({
      questionId: questionDoc._id,
      domain: questionDoc.domain,
      question: questionDoc.question,
      chatgpt_response: chatgptResponse,
      response_time: responseTime,
      accuracy_score: accuracy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ChatGPT API error:', error);
    res.status(500).json({ error: 'Failed to evaluate question', details: error.message });
  }
});

router.post('/evaluate/batch', async (req, res) => {
  try {
    const { domain } = req.body;
    const wss = req.app.get('wss');

    if (!domain) return res.status(400).json({ error: 'domain is required' });

    const questions = await Question.find({ domain });
    if (!questions.length) return res.status(404).json({ error: 'No questions found for this domain' });

    let completed = 0;

    for (const q of questions) {
      const startTime = Date.now();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "user", 
            content: `Choose the correct answer only (A, B, C, or D) for this question: ${q.question}` 
          }
        ],
        max_tokens: 10
      });

      const responseTime = Date.now() - startTime;
      let chatgptResponse = completion.choices[0].message.content.trim();
      chatgptResponse = extractAnswer(chatgptResponse);

      const expected = q.expected_answer.trim().toUpperCase();
      const accuracy = chatgptResponse === expected ? 1 : 0;

      q.chatgpt_response = chatgptResponse;
      q.response_time = responseTime;
      q.accuracy_score = accuracy;
      q.evaluated_at = new Date();
      await q.save();

      completed++;

      if (wss) {
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'progress',
              domain,
              completed,
              total: questions.length,
              questionId: q._id
            }));
          }
        });
      }
    }

    res.json({ message: `Batch evaluation completed for domain ${domain}`, total: questions.length });

  } catch (error) {
    console.error('Batch evaluation error:', error);
    res.status(500).json({ error: 'Failed to perform batch evaluation', details: error.message });
  }
});

module.exports = router;
