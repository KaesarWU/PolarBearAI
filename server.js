const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // Set in Vercel

app.post('/api/chat', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.deepseek.ai/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: req.body.message }],
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = response.data.choices?.[0]?.message?.content || "No response from AI";
        res.json({ reply });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: "Arctic connection trouble! ❄️🐻‍❄️" });
    }
});

module.exports = app;