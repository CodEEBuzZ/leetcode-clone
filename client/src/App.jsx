// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from './config/api';
import ProblemDashboard from './components/ProblemDashboard';
import Workspace from './components/Workspace';
import Login from './components/login.jsx';
import Welcome from './components/Welcome';
import Topbar from './components/Topbar';
import Profile from './components/Profile';

function ChevronRightIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [dashboardWidth, setDashboardWidth] = useState(40);
  const [showProblemList, setShowProblemList] = useState(true);

  const mainRef = useRef(null);
  const isAuthenticated = !!localStorage.getItem('userId');

  // Load the initial list of problems (titles and basic info)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await axios.get(`${API_BASE}/api/problems`);
        if (!cancelled) {
          setProblems(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load problems');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // NEW: Fetch the full problem details from Supabase when a user clicks a row
  const handleSelectProblem = async (problemSummary) => {
    try {
      setLoading(true);
      // Fetches full details (description, snippets, test cases) using the slug
      const res = await axios.get(`${API_BASE}/api/problems/${problemSummary.slug}`);
      setSelectedProblem(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load full problem details:", err);
      setError("Could not load problem details.");
      setLoading(false);
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

  return (
    <Router>
      <Topbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          isAuthenticated ? (
            <div className="h-screen flex flex-col bg-background text-gray-100">
              <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-panel sticky top-0 z-20">
                <span className="text-lg font-semibold">CU LeetCode Clone</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('userId');
                    window.location.href = '/';
                  }}
                  className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-500 font-bold text-white"
                >
                  Logout
                </button>
              </header>

              {loading && <div className="flex-1 flex items-center justify-center">Loading data from Supabase...</div>}
              {error && <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>}

              {!loading && !error && (
                <main ref={mainRef} className="flex-1 flex overflow-hidden">
                  {showProblemList ? (
                    <>
                      <div className="h-full border-r border-gray-900 flex flex-col bg-panel" style={{ width: `${dashboardWidth}%` }}>
                        <ProblemDashboard
                          problems={problems}
                          selectedTopic={selectedTopic}
                          onSelectTopic={setSelectedTopic}
                          searchQuery={searchQuery}
                          onSearchQueryChange={setSearchQuery}
                          onSelectProblem={handleSelectProblem} // Changed to use our fetcher
                          selectedSlug={selectedProblem?.slug}
                          onToggleSidebar={() => setShowProblemList(false)}
                        />
                      </div>
                      <div className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" onMouseDown={handleOuterDividerMouseDown} />
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

                  <div className="flex-1 flex flex-col bg-background">
                    <Workspace
                      problem={selectedProblem}
                      layoutSignal={showProblemList ? 'expanded' : 'full'}
                    />
                  </div>
                </main>
              )}
            </div>
          ) : <Navigate to="/login" />
        } />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
