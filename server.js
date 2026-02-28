require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const supabase = require('./supabaseClient');

// ✨ YOUR CODE ADDED: Gemini Import
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✨ YOUR CODE ADDED: Gemini Initialization
const geminiApiKey = process.env.GEMINI_API_KEY || "PASTE_YOUR_GEMINI_KEY_HERE";
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

// ==========================================
// ✨ YOUR CODE ADDED: AI ASSISTANT ROUTE
// ==========================================
app.post('/api/ai-help', async (req, res) => {
    try {
        const { problemTitle, problemDescription, userCode, language } = req.body;
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
// ==========================================


/**
 * GET ALL PROBLEMS
 * Fetches the list for the dashboard
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
 * Fetches full details + test cases using the slug
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
    const { code, language, slug } = req.body;
    const config = languageConfig[language];

    if (!config) return res.status(400).json({ error: `Unsupported language: ${language}` });

    const program = {
        script: code,
        language: config.lang,
        versionIndex: config.version,
        // Using the keys we verified earlier
        clientId: process.env.JDOODLE_CLIENT_ID || "ef0b7d273b58056a7318ee3e841205bb",
        clientSecret: process.env.JDOODLE_CLIENT_SECRET || "58da4f0b8a9e44764996a1519df8c35e127d78982edfc5b74a5087b0590b7186"
    };

    try {
        const response = await axios.post('https://api.jdoodle.com/v1/execute', program);
        // ✨ This matches the frontend 'executionResult' state exactly
        res.json({
            output: response.data.output,
            cpuTime: response.data.cpuTime,
            memory: response.data.memory
        });
    } catch (error) {
        res.status(500).json({ error: "JDoodle Execution Failed" });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    // TODO: Replace with Supabase Auth
    res.status(200).json({ success: true, userId: 'user_supabase_placeholder' });
});

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    // TODO: Replace with Supabase Auth signUp
    res.status(501).json({ success: false, message: 'Registration not yet implemented. Use Supabase Auth.' });
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    // TODO: Replace with Supabase Auth resetPasswordForEmail
    res.status(501).json({ success: false, message: 'Password reset not yet implemented. Use Supabase Auth.' });
});

app.get('/', (req, res) => {
    res.send('Server is running with Supabase Connection!');
});

app.listen(PORT, () => {
    console.log(`🚀 API server listening on http://localhost:${PORT}`);
});