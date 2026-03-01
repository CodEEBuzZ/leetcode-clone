require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const supabase = require('./supabaseClient');

// ✨ Gemini Import
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✨ Gemini Initialization
// Ensure GEMINI_API_KEY is set in your .env file
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey);

// JDoodle Language Mapping
const languageConfig = {
    'javascript': { lang: 'nodejs', version: '4' },
    'python3': { lang: 'python3', version: '4' },
    'java': { lang: 'java', version: '4' },
    'cpp': { lang: 'cpp17', version: '1' }
};

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'supabase' });
});

/**
 * AI ASSISTANT ROUTE
 * Provides hints without giving away the full answer
 */
app.post('/api/ai-help', async (req, res) => {
    try {
        const { problemTitle, problemDescription, userCode, language } = req.body;
        
        // Updated to a current stable model name
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a helpful coding mentor. 
        Context: The user is solving a problem titled "${problemTitle}".
        Problem Description: ${problemDescription}
        User's Current ${language} Code:
        \`\`\`${language}
        ${userCode}
        \`\`\`

        Task: Provide a short, encouraging hint. Identify if there is a bug, but DO NOT provide the full corrected code. Help them think through the logic.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ suggestion: response.text() });
    } catch (error) {
        console.error("AI Assistant Error:", error);
        res.status(500).json({ error: "AI Assistant is currently offline." });
    }
});

/**
 * GET ALL PROBLEMS
 */
app.get('/api/problems', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('problems')
            .select('id, title, slug, difficulty, topics'); 
            
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("❌ Supabase Load Error:", err.message);
        res.status(500).json({ error: 'Failed to load problems from database' });
    }
});

/**
 * GET SINGLE PROBLEM
 */
app.get('/api/problems/:slug', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('problems')
            .select(`
                *,
                test_cases (*)
            `)
            .eq('slug', req.params.slug)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Problem not found' });
        
        res.json(data);
    } catch (err) {
        console.error("❌ Single Problem Load Error:", err.message);
        res.status(500).json({ error: 'Failed to load problem details' });
    }
});

/**
 * JDoodle Execution Route
 */
app.post('/api/execute', async (req, res) => {
    const { code, language } = req.body;
    const config = languageConfig[language];

    if (!config) return res.status(400).json({ error: `Unsupported language: ${language}` });

    // Ensure credentials exist in environment variables
    if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
        return res.status(500).json({ error: "Execution service credentials missing." });
    }

    const program = {
        script: code,
        language: config.lang,
        versionIndex: config.version,
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET
    };

    try {
        const response = await axios.post('https://api.jdoodle.com/v1/execute', program);
        res.json({
            output: response.data.output,
            cpuTime: response.data.cpuTime,
            memory: response.data.memory
        });
    } catch (error) {
        console.error("JDoodle Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "JDoodle Execution Failed" });
    }
});

// --- AUTH PLACEHOLDERS ---
// Logic should be handled via Supabase Auth on the client side or via a dedicated auth middleware

app.post('/api/login', (req, res) => {
    res.status(200).json({ success: true, message: "Use Supabase Auth on the frontend." });
});

app.post('/api/register', (req, res) => {
    res.status(501).json({ success: false, message: 'Registration not yet implemented.' });
});

app.get('/', (req, res) => {
    res.send('Server is running and connected to Supabase!');
});

app.listen(PORT, () => {
    console.log(`🚀 API server listening on http://localhost:${PORT}`);
});
