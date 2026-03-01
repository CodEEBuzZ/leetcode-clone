import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Updated path: Go up one level from 'components' to 'src' to find supabaseClient.js
import { supabase } from '../supabaseClient';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check active session on component mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
            {/* Logo / Home Link */}
            <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
                CU LeetCode
            </Link>

            <div className="flex items-center gap-6">
                {/* Navigation Links */}
                <Link to="/problems" className="text-gray-300 hover:text-white transition">
                    Dashboard
                </Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Profile Link with Avatar */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition group"
                        >
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white group-hover:bg-blue-400 transition">
                                {/* Safe navigation: handles cases where email might be missing */}
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-white">Profile</span>
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    /* Login Button for unauthenticated users */
                    <Link 
                        to="/login" 
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold text-white transition shadow-lg shadow-blue-900/20"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
