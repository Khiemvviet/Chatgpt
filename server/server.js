require('dotenv').config({ path: './.env' }); 
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Loaded ' : 'Missing ');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('wss', wss);


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', require('./routes/api'));
app.use('/api/chatgpt', require('./routes/chatgpt'));
app.use('/api/results', require('./routes/results'));

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.send('Welcome to ChatGPT Efficiency Evaluation Server!');
    
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        ws.send(`Echo: ${message}`);
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

mongoose.connect('mongodb://127.0.0.1:27017/ChatGPT_Evaluation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { wss };