const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Initialize Express app
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins (adjust for production)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public', {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store');
  }
}));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// API Route - Must come before static file handling
app.post('/api/chat', async (req, res) => {
  // Validate request
  if (!req.body.message) {
    return res.status(400).json({ 
      success: false,
      error: "Message is required"
    });
  }

  try {
    // Call DeepSeek API
    const response = await axios.post(
      'https://api.deepseek.ai/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ 
          role: 'user', 
          content: req.body.message 
        }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15-second timeout
      }
    );

    // Validate DeepSeek response
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from AI");
    }

    // Successful response
    res.json({
      success: true,
      reply: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Determine error type
    let errorMessage = "Arctic connection trouble! ❄️🐻‍❄️";
    if (error.response) {
      // API returned error status
      errorMessage = `AI Error: ${error.response.statusText}`;
    } else if (error.request) {
      // No response received
      errorMessage = "AI is not responding - try again later";
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

// 404 Handler - Must be last
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: "Route not found" 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: err.message
  });
});

module.exports = app;
