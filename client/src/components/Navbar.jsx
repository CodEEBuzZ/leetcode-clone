import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                localStorage.setItem('userId', session.user.id);
            }
        };
        getSession();

        // 2. Listen for auth changes (Login/Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            if (currentUser) {
                localStorage.setItem('userId', currentUser.id);
            } else {
                localStorage.removeItem('userId');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // User state and localStorage are handled by onAuthStateChange listener
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition flex items-center gap-2">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-lg">CU</span>
                LeetCode
            </Link>

            <div className="flex items-center gap-6">
                {/* Navigation Links */}
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition text-sm font-medium">
                    Dashboard
                </Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Profile Link */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition group"
                        >
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase transition">
                                {/* Shows first letter of username from metadata, or email as fallback */}
                                {user?.user_metadata?.username?.[0] || user?.email?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-medium text-white group-hover:text-blue-400">
                                {user?.user_metadata?.username || 'User'}
                            </span>
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link 
                        to="/login" 
                        className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-sm font-bold text-white transition shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
