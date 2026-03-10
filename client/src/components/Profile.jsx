import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronLeft = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── DSA Roadmap Data ─────────────────────────────────────────────────────────
const DSA_ROADMAP = [
  { id: 'arrays',        title: 'Arrays & Strings',      icon: '▦', color: '#38bdf8', topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum', "Kadane's Algorithm"] },
  { id: 'linkedlist',    title: 'Linked List',            icon: '⬡', color: '#a78bfa', topics: ['Singly & Doubly LL', 'Fast & Slow Pointers', 'Reversal', 'Merge & Cycle Detection'] },
  { id: 'stack-queue',   title: 'Stack & Queue',          icon: '⫶', color: '#fb923c', topics: ['Monotonic Stack', 'Deque', 'LRU Cache Design', 'Next Greater Element'] },
  { id: 'hashing',       title: 'Hashing',                icon: '#', color: '#34d399', topics: ['HashMap', 'HashSet', 'Frequency Maps', 'Anagram Problems'] },
  { id: 'trees',         title: 'Trees',                  icon: '⌥', color: '#f472b6', topics: ['BFS / DFS', 'BST Operations', 'LCA', 'Diameter & Height'] },
  { id: 'heap',          title: 'Heap / Priority Queue',  icon: '⬠', color: '#facc15', topics: ['Min/Max Heap', 'Top K Elements', 'Kth Largest', 'Merge K Lists'] },
  { id: 'graphs',        title: 'Graphs',                 icon: '◎', color: '#22d3ee', topics: ['DFS / BFS', 'Topological Sort', 'Union-Find', 'Dijkstra / Bellman-Ford'] },
  { id: 'backtracking',  title: 'Backtracking',           icon: '↺', color: '#f87171', topics: ['Subsets', 'Permutations', 'Combinations', 'N-Queens'] },
  { id: 'binary-search', title: 'Binary Search',          icon: '⌖', color: '#818cf8', topics: ['Classic BS', 'Search on Answer', 'Rotated Array', 'Binary Search on Trees'] },
  { id: 'dp',            title: 'Dynamic Programming',    icon: '◈', color: '#fb7185', topics: ['1D DP', '2D DP / Grid', 'Knapsack', 'LCS / LIS', 'DP on Trees'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const diffTextColor = (d) => {
  if (!d) return '';
  if (d.toLowerCase() === 'easy')   return 'text-green-400';
  if (d.toLowerCase() === 'medium') return 'text-yellow-400';
  return 'text-red-400';
};
const diffBadgeClass = (d) => {
  if (d === 'Easy')   return 'bg-green-950 text-green-400';
  if (d === 'Medium') return 'bg-yellow-950 text-yellow-400';
  return 'bg-red-950 text-red-400';
};

// ─── RoadmapNode ──────────────────────────────────────────────────────────────
const RoadmapNode = ({ node, index, completedTopics, onToggleTopic }) => {
  const [expanded, setExpanded] = useState(false);
  const completedCount = node.topics.filter(t => completedTopics.has(`${node.id}::${t}`)).length;
  const progress = (completedCount / node.topics.length) * 100;

  return (
    <div
      style={{
        animationDelay: `${index * 50}ms`,
        borderColor: expanded ? node.color : 'rgba(255,255,255,0.06)',
        boxShadow: expanded ? `0 0 16px ${node.color}1a` : 'none',
      }}
      className="roadmap-node rounded-xl border bg-gray-900/60 backdrop-blur-sm transition-all duration-300"
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center gap-2.5 text-left">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: `${node.color}18`, color: node.color, border: `1px solid ${node.color}33` }}
        >
          {node.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-semibold text-white text-xs truncate">{node.title}</span>
            <span className="text-xs shrink-0 mono" style={{ color: node.color }}>{completedCount}/{node.topics.length}</span>
          </div>
          <div className="mt-1 h-0.5 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: node.color }} />
          </div>
        </div>
        <span
          className="text-gray-600 text-xs transition-transform duration-300 shrink-0"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        >▼</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-1">
          {node.topics.map(topic => {
            const key = `${node.id}::${topic}`;
            const done = completedTopics.has(key);
            return (
              <button
                key={topic}
                onClick={() => onToggleTopic(key)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/5 transition-all"
              >
                <div
                  className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{ borderColor: done ? node.color : 'rgba(255,255,255,0.2)', background: done ? node.color : 'transparent' }}
                >
                  {done && <span className="text-black text-[9px] font-black">✓</span>}
                </div>
                <span
                  className="text-xs transition-colors"
                  style={{ color: done ? node.color : 'rgba(255,255,255,0.55)', textDecoration: done ? 'line-through' : 'none' }}
                >
                  {topic}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
// Accepts all ProblemDashboard props so App.js can pass them straight in.
const Profile = ({
  problems = [],
  selectedTopic,
  onSelectTopic,
  searchQuery = '',
  onSearchQueryChange,
  onSelectProblem,
  selectedSlug,
}) => {
  // Profile state
  const [userProfile, setUserProfile]       = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading]               = useState(true);

  // Roadmap state
  const [completedTopics, setCompletedTopics] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('dsa_progress') || '[]')); }
    catch { return new Set(); }
  });

  // Layout state
  const [topicSidebarCollapsed, setTopicSidebarCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab]               = useState('roadmap');
  const [rightPanelOpen, setRightPanelOpen]               = useState(true);

  // Roadmap helpers
  const totalTopics    = DSA_ROADMAP.reduce((a, n) => a + n.topics.length, 0);
  const totalCompleted = completedTopics.size;
  const overallPct     = Math.round((totalCompleted / totalTopics) * 100);

  const onToggleTopic = (key) => {
    setCompletedTopics(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      try { localStorage.setItem('dsa_progress', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  // Fetch Supabase profile
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [profileRes, submissionsRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('submissions')
              .select('problem_id, status, problems ( title, difficulty, slug )')
              .eq('user_id', user.id).eq('status', 'Accepted'),
          ]);
          if (profileRes.data)     setUserProfile(profileRes.data);
          if (submissionsRes.data) {
            setSolvedProblems(Array.from(
              new Map(submissionsRes.data
                .filter(i => i.problems)
                .map(i => [i.problem_id, i.problems])
              ).values()
            ));
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Problem filtering
  const topics = useMemo(() => {
    const s = new Set();
    problems.forEach(p => (p.topics || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter(p => {
      const matchTopic = !selectedTopic || (p.topics || []).includes(selectedTopic);
      const matchQuery = !q || p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
      return matchTopic && matchQuery;
    });
  }, [problems, selectedTopic, searchQuery]);

  const easyCount   = solvedProblems.filter(p => p?.difficulty === 'Easy').length;
  const mediumCount = solvedProblems.filter(p => p?.difficulty === 'Medium').length;
  const hardCount   = solvedProblems.filter(p => p?.difficulty === 'Hard').length;

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-500 text-xs mono">Loading…</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Sora:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Sora', sans-serif; margin: 0; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .roadmap-node { animation: fadeUp 0.35s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .prob-row:hover td { background: rgba(255,255,255,0.025); }
        .panel-enter { animation: panelIn 0.2s ease both; }
        @keyframes panelIn { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      <div
        className="flex flex-col text-white"
        style={{ height: '100vh', background: 'radial-gradient(ellipse at 10% 0%, #0c1a2e 0%, #030712 55%)' }}
      >
        {/* ── Top Bar ── */}
        <div className="shrink-0 border-b border-white/5 px-5 py-2.5 flex items-center justify-between">
          <span className="mono text-blue-400 text-xs font-bold tracking-widest uppercase">⌘ CodeForge</span>
          <div className="flex items-center gap-3 text-xs mono text-gray-600">
            <span>{userProfile?.username || 'Coder'}</span>
            <span className="text-gray-800">·</span>
            <span className="text-blue-500/70 border border-blue-500/20 px-2 py-0.5 rounded-full">
              ◆ {userProfile?.rank_score || 0} pts
            </span>
          </div>
        </div>

        {/* ── 3-Panel Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ════ PANEL 1 · Topics Sidebar ════ */}
          <aside
            className="shrink-0 border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden"
            style={{ width: topicSidebarCollapsed ? '40px' : '160px', background: 'rgba(5,10,20,0.6)' }}
          >
            <div className="px-2 py-2.5 border-b border-white/5 flex items-center shrink-0">
              {!topicSidebarCollapsed && (
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mono">Topics</span>
              )}
              <button
                onClick={() => setTopicSidebarCollapsed(v => !v)}
                className="p-1 hover:bg-white/5 rounded text-gray-600 hover:text-gray-300 transition-colors ml-auto"
              >
                {topicSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
              </button>
            </div>

            {!topicSidebarCollapsed && (
              <div className="flex-1 overflow-y-auto py-2 px-1.5">
                <button
                  onClick={() => onSelectTopic?.(null)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs mb-0.5 transition-colors ${
                    !selectedTopic
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  All Topics
                </button>
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => onSelectTopic?.(topic)}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs mb-0.5 transition-colors truncate ${
                      selectedTopic === topic
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* ════ PANEL 2 · Problems List ════ */}
          <section
            className="shrink-0 flex flex-col border-r border-white/5 overflow-hidden"
            style={{ width: '380px' }}
          >
            {/* Search */}
            <div
              className="shrink-0 px-3 py-2.5 border-b border-white/5 flex items-center gap-2"
              style={{ background: 'rgba(5,10,20,0.5)' }}
            >
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none">⌕</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => onSearchQueryChange?.(e.target.value)}
                  placeholder="Search problems…"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/8 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <span className="mono text-[10px] text-gray-700 whitespace-nowrap shrink-0">
                {filteredProblems.length}/{problems.length}
              </span>
            </div>

            {/* Problem rows */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th
                      className="px-3 py-2 text-left text-gray-600 font-semibold border-b border-white/5 sticky top-0"
                      style={{ background: 'rgba(5,10,20,0.95)' }}
                    >Problem</th>
                    <th
                      className="px-3 py-2 text-left text-gray-600 font-semibold border-b border-white/5 sticky top-0 w-14"
                      style={{ background: 'rgba(5,10,20,0.95)' }}
                    >Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map(p => (
                    <tr
                      key={p.slug}
                      onClick={() => onSelectProblem?.(p)}
                      className={`prob-row cursor-pointer transition-colors ${
                        selectedSlug === p.slug ? 'bg-blue-600/10' : ''
                      }`}
                      style={selectedSlug === p.slug ? { borderLeft: '2px solid #3b82f6' } : {}}
                    >
                      <td className="px-3 py-2.5 border-b border-white/4">
                        <div className="font-medium text-gray-200 leading-snug">{p.title}</div>
                        <div className="text-gray-700 mono mt-0.5 text-[10px]">{p.slug}</div>
                        {(p.topics || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.topics.slice(0, 3).map(t => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-600 text-[9px] uppercase tracking-wide">{t}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={`px-3 py-2.5 border-b border-white/4 font-semibold ${diffTextColor(p.difficulty)}`}>
                        {p.difficulty}
                      </td>
                    </tr>
                  ))}
                  {filteredProblems.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-10 text-center text-gray-700 italic">No problems found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ════ PANEL 3 · Profile + Roadmap ════ */}
          {rightPanelOpen ? (
            <div className="flex-1 flex flex-col overflow-hidden panel-enter min-w-0">

              {/* Tab bar */}
              <div
                className="shrink-0 border-b border-white/5 flex items-center px-3 gap-0.5"
                style={{ background: 'rgba(5,10,20,0.5)' }}
              >
                {[
                  { id: 'roadmap', label: '🗺 Roadmap' },
                  { id: 'profile', label: '👤 Profile' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id)}
                    className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all ${
                      activeRightTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-600 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={() => setRightPanelOpen(false)}
                  className="ml-auto p-1 hover:bg-white/5 rounded text-gray-700 hover:text-gray-400 transition-colors"
                  title="Collapse"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── Tab: PROFILE ── */}
              {activeRightTab === 'profile' && (
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shrink-0"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}
                    >
                      {(userProfile?.username || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold tracking-tight">{userProfile?.username || 'Coder'}</h2>
                      <p className="text-gray-600 mono text-[10px] mt-0.5">{userProfile?.email || 'no email'}</p>
                      <div className="mt-1.5 inline-block mono text-[10px] px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                        ◆ Rank {userProfile?.rank_score || 0}
                      </div>
                    </div>
                  </div>

                  {/* Solve stats */}
                  <div>
                    <p className="mono text-[10px] uppercase tracking-widest text-gray-700 mb-2">Problems Solved</p>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-4xl font-extrabold">{solvedProblems.length}</span>
                      <span className="text-gray-600 text-sm mb-1">total</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Easy',   count: easyCount,   color: '#4ade80', bg: 'rgba(74,222,128,0.06)' },
                        { label: 'Medium', count: mediumCount, color: '#facc15', bg: 'rgba(250,204,21,0.06)' },
                        { label: 'Hard',   count: hardCount,   color: '#f87171', bg: 'rgba(248,113,113,0.06)' },
                      ].map(({ label, count, color, bg }) => (
                        <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: bg, border: `1px solid ${color}20` }}>
                          <div className="text-xl font-bold mono" style={{ color }}>{count}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: `${color}99` }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5" />

                  {/* Solved list */}
                  <div>
                    <p className="mono text-[10px] uppercase tracking-widest text-gray-700 mb-2">Recently Solved</p>
                    <ul className="flex flex-col gap-0.5">
                      {solvedProblems.length > 0 ? solvedProblems.slice(0, 15).map((prob, idx) => (
                        <li key={idx} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/4 cursor-default transition-colors">
                          <span className="text-xs text-gray-300 truncate pr-2">{prob?.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 mono ${diffBadgeClass(prob?.difficulty)}`}>
                            {prob?.difficulty}
                          </span>
                        </li>
                      )) : (
                        <li className="text-center text-gray-700 italic text-xs py-6">No problems solved yet 🚀</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── Tab: ROADMAP ── */}
              {activeRightTab === 'roadmap' && (
                <div className="flex-1 overflow-y-auto">
                  {/* Sticky header */}
                  <div
                    className="sticky top-0 z-10 px-5 py-3 border-b border-white/5 flex items-center justify-between"
                    style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(8px)' }}
                  >
                    <div>
                      <h3 className="font-extrabold text-sm">DSA Roadmap</h3>
                      <p className="text-[10px] text-gray-600 mt-0.5">Arrays → DP · track your mastery</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="mono text-xl font-bold text-blue-400">{overallPct}%</div>
                        <div className="text-[10px] text-gray-700 mono">{totalCompleted}/{totalTopics} topics</div>
                      </div>
                      <div className="relative w-11 h-11">
                        <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5"/>
                          <circle
                            cx="18" cy="18" r="14" fill="none"
                            stroke="#38bdf8" strokeWidth="3.5"
                            strokeDasharray={`${overallPct * 0.88} 100`}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="mono text-[9px] font-bold text-blue-400">{overallPct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid of nodes */}
                  <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {DSA_ROADMAP.map((node, index) => (
                      <div key={node.id} className="relative">
                        <div
                          className="absolute -top-1.5 -left-1.5 z-10 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black mono"
                          style={{ background: node.color, color: '#000' }}
                        >
                          {index + 1}
                        </div>
                        <RoadmapNode
                          node={node}
                          index={index}
                          completedTopics={completedTopics}
                          onToggleTopic={onToggleTopic}
                        />
                      </div>
                    ))}
                  </div>

                  {overallPct === 100 && (
                    <div className="mx-4 mb-5 rounded-2xl p-5 text-center border border-yellow-500/25 bg-yellow-500/5">
                      <div className="text-3xl mb-1">🏆</div>
                      <h3 className="font-extrabold text-yellow-400 text-sm">DSA Mastered!</h3>
                      <p className="text-gray-600 text-xs mt-1">You completed the entire roadmap. Legendary.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          ) : (
            /* Collapsed right panel — restore strip */
            <div
              className="flex flex-col items-center pt-3 px-1.5 border-l border-white/5"
              style={{ background: 'rgba(5,10,20,0.4)' }}
            >
              <button
                onClick={() => setRightPanelOpen(true)}
                className="p-1.5 hover:bg-white/5 rounded text-gray-600 hover:text-gray-300 transition-colors"
                title="Expand"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span
                className="mt-3 mono text-[9px] text-gray-700 uppercase tracking-widest"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Profile · Roadmap
              </span>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Profile;
