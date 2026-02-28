import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');

    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-500">CU LeetCode</Link>

            <div className="flex items-center gap-6">
                <Link to="/problems" className="text-gray-300 hover:text-white">Dashboard</Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        {/* The Profile Link */}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition"
                        >
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                                {user.email[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">Profile</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-400 hover:text-red-400"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;