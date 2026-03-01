import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from './config/api';
import { supabase } from './supabaseClient';
import ProblemDashboard from './components/ProblemDashboard';
import Workspace from './components/Workspace';
import Login from './components/login.jsx';
import Welcome from './components/Welcome';
import Profile from './components/Profile';
import Navbar from './components/Navbar';

function ChevronRightIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true); // Sidebar/List loading
  const [problemLoading, setProblemLoading] = useState(false); // Workspace content loading
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [dashboardWidth, setDashboardWidth] = useState(40);
  const [showProblemList, setShowProblemList] = useState(true);

  const mainRef = useRef(null);

  // 1. Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Optimized Initial Load: Fetch only list metadata
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Suggestion: Update your backend to support a "shallow" query if possible
        const res = await axios.get(`${API_BASE}/api/problems?select=id,title,slug,difficulty,topics`);
        if (!cancelled) {
          setProblems(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load dashboard data');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // 3. Lazy Load Problem Details
  const handleSelectProblem = async (problemSummary) => {
    // If we click the same problem, don't re-fetch
    if (selectedProblem?.slug === problemSummary.slug) return;

    try {
      setProblemLoading(true);
      const res = await axios.get(`${API_BASE}/api/problems/${problemSummary.slug}`);
      setSelectedProblem(res.data);
    } catch (err) {
      console.error("❌ Failed to load problem details:", err);
      setError("Could not load problem details.");
    } finally {
      setProblemLoading(false);
    }
  };

  const handleOuterDividerMouseDown = (e) => {
    e.preventDefault();
    const container = mainRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMouseMove = (moveEvent) => {
      const offsetX = moveEvent.clientX - rect.left;
      let next = (offsetX / rect.width) * 100;
      next = Math.min(75, Math.max(20, next));
      setDashboardWidth(next);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Checking Session...</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          user ? (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-background text-gray-100 overflow-hidden">
              {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-900/80 border border-red-500 px-6 py-2 rounded-full text-sm">
                  {error}
                </div>
              )}

              <main ref={mainRef} className="flex-1 flex overflow-hidden">
                {/* Sidebar Section */}
                {showProblemList ? (
                  <>
                    <div className="h-full border-r border-gray-900 flex flex-col bg-panel" style={{ width: `${dashboardWidth}%` }}>
                      <ProblemDashboard
                        problems={problems}
                        selectedTopic={selectedTopic}
                        onSelectTopic={setSelectedTopic}
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                        onSelectProblem={handleSelectProblem}
                        selectedSlug={selectedProblem?.slug}
                        onToggleSidebar={() => setShowProblemList(false)}
                        isLoading={loading}
                      />
                    </div>
                    <div className="w-1 bg-gray-800 hover:bg-blue-600 cursor-col-resize transition-colors" onMouseDown={handleOuterDividerMouseDown} />
                  </>
                ) : (
                  <div className="w-10 border-r border-gray-900 flex justify-center items-start pt-3 bg-background">
                    <button
                      onClick={() => setShowProblemList(true)}
                      className="p-1.5 hover:bg-gray-700 rounded text-gray-400 transition-colors"
                      title="Show Problems"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Workspace Section */}
                <div className="flex-1 flex flex-col bg-background relative">
                  {problemLoading && (
                    <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-gray-400">Loading Problem...</span>
                       </div>
                    </div>
                  )}
                  <Workspace
                    problem={selectedProblem}
                    layoutSignal={showProblemList ? 'expanded' : 'full'}
                  />
                </div>
              </main>
            </div>
          ) : <Navigate to="/login" />
        } />

        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
