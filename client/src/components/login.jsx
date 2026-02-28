import React, { useState } from 'react';
import { API_BASE } from '../config/api';

const Login = () => {
    // State to toggle between forms: 'login', 'register', or 'forgot'
    const [view, setView] = useState('login');

    // Form input states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('userId', data.userId);
                // CHANGE: Redirect to '/' because that is where your ProblemDashboard lives in App.jsx
                window.location.href = '/';
            } else {
                setMessage(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setMessage("An error occurred during login.");
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        setMessage('Creating account...');
        try {
            const response = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.success) {
                setMessage("Registration successful! You can now log in.");
                setView('login'); // Switch to login view so they can sign in
            } else {
                setMessage(data.message || "Registration failed");
            }
        } catch (err) {
            console.error("Register error:", err);
            setMessage("An error occurred. Please try again.");
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setMessage('Sending password reset link...');
        try {
            const response = await fetch(`${API_BASE}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.success) {
                setMessage("Check your email for the reset link!");
            } else {
                setMessage(data.message || "Failed to send reset link.");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-extrabold mb-6 text-blue-500">
                {view === 'login' && "Login to Code Assistant"}
                {view === 'register' && "Create an Account"}
                {view === 'forgot' && "Reset Your Password"}
            </h1>

            {message && (
                <div className="mb-4 p-3 bg-gray-800 border border-yellow-500/50 rounded-lg text-yellow-400 text-center max-w-xs animate-pulse">
                    {message}
                </div>
            )}

            {/* LOGIN FORM */}
            {view === 'login' && (
                <form onSubmit={handleLoginSubmit} className="flex flex-col bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
                    <label className="text-xs font-semibold text-gray-400 uppercase ml-2 mb-1">Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        className="border border-gray-600 bg-gray-700 p-3 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label className="text-xs font-semibold text-gray-400 uppercase ml-2 mb-1">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="border border-gray-600 bg-gray-700 p-3 mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all">
                        Login
                    </button>

                    <div className="flex flex-col items-center mt-6 space-y-3">
                        <button
                            type="button"
                            onClick={() => { setView('forgot'); setMessage(''); }}
                            className="text-sm text-blue-400 hover:text-blue-300 transition"
                        >
                            Forgot Password?
                        </button>
                        <div className="h-px w-full bg-gray-700"></div>
                        <span className="text-sm text-gray-400">
                            New here? <button type="button" onClick={() => { setView('register'); setMessage(''); }} className="text-blue-400 hover:text-blue-300 font-bold ml-1">Register Account</button>
                        </span>
                    </div>
                </form>
            )}

            {/* REGISTER FORM */}
            {view === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
                    <input
                        type="text"
                        placeholder="Username"
                        className="border border-gray-600 bg-gray-700 p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="border border-gray-600 bg-gray-700 p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border border-gray-600 bg-gray-700 p-3 mb-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="border border-gray-600 bg-gray-700 p-3 mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl font-bold shadow-lg transition-all">
                        Create Account
                    </button>
                    <button
                        type="button"
                        onClick={() => { setView('login'); setMessage(''); }}
                        className="text-sm text-gray-400 hover:text-gray-300 mt-6"
                    >
                        &larr; Already have an account? Login
                    </button>
                </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {view === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="flex flex-col bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
                    <p className="text-sm text-gray-300 mb-6 text-center">
                        Enter your email and we'll send a reset link.
                    </p>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="border border-gray-600 bg-gray-700 p-3 mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold transition-all">
                        Send Reset Link
                    </button>
                    <button
                        type="button"
                        onClick={() => { setView('login'); setMessage(''); }}
                        className="text-sm text-gray-400 hover:text-gray-300 mt-6"
                    >
                        &larr; Back to Login
                    </button>
                </form>
            )}
        </div>
    );
};

export default Login;
