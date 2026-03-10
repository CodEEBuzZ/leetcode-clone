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

// ─── DSA Roadmap Categories mapped to DB Tags ───────────────────────
const DSA_CATEGORIES = [
  { id: 'arrays',        title: 'Arrays & Strings',      icon: '▦', color: '#38bdf8', matchTags: ['array', 'string', 'arrays', 'strings', 'two pointers', 'sliding window'] },
  { id: 'linkedlist',    title: 'Linked List',            icon: '⬡', color: '#a78bfa', matchTags: ['linked list', 'linked lists', 'linkedlist'] },
  { id: 'stack-queue',   title: 'Stack & Queue',          icon: '⫶', color: '#fb923c', matchTags: ['stack', 'queue', 'stacks', 'queues', 'monotonic stack'] },
  { id: 'hashing',       title: 'Hashing',                icon: '#', color: '#34d399', matchTags: ['hash table', 'hashing', 'hash map', 'hashmap', 'hashset'] },
  { id: 'trees',         title: 'Trees',                  icon: '⌥', color: '#f472b6', matchTags: ['tree', 'trees', 'binary tree', 'bst', 'depth-first search'] },
  { id: 'heap',          title: 'Heap / Priority Queue',  icon: '⬠', color: '#facc15', matchTags: ['heap', 'priority queue'] },
  { id: 'graphs',        title: 'Graphs',                 icon: '◎', color: '#22d3ee', matchTags: ['graph', 'graphs', 'bfs', 'dfs', 'breadth-first search'] },
  { id: 'backtracking',  title: 'Backtracking',           icon: '↺', color: '#f87171', matchTags: ['backtracking', 'recursion'] },
  { id: 'binary-search', title: 'Binary Search',          icon: '⌖', color: '#818cf8', matchTags: ['binary search'] },
  { id: 'dp',            title: 'Dynamic Programming',    icon: '◈', color: '#fb7185', matchTags: ['dp', 'dynamic programming', 'memoization'] },
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

// ─── RoadmapNode ─────────────────
const RoadmapNode = ({ node, index, solvedSlugs, onSelectProblem }) => {
  const [expanded, setExpanded] = useState(false);
  
  const completedCount = node.problems.filter(p => solvedSlugs.has(p.slug)).length;
  const progress = node.problems.length === 0 ? 0 : (completedCount / node.problems.length) * 100;

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
            <span className="text-xs shrink-0 mono" style={{ color: node.color }}>{completedCount}/{node.problems.length}</span>
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
          {node.problems.length > 0 ? (
            node.problems.map(prob => {
              const done = solvedSlugs.has(prob.slug);
              return (
                <button
                  key={prob.slug}
                  onClick={() => onSelectProblem?.(prob)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-white/5 transition-all group"
                  title="Click to solve problem"
                >
                  <div
                    className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{ borderColor: done ? node.color : 'rgba(255,255,255,0.2)', background: done ? node.color : 'transparent' }}
                  >
                    {done && <span className="text-black text-[9px] font-black">✓</span>}
                  </div>
                  <span
                    className="text-xs transition-colors truncate flex-1"
                    style={{ color: done ? node.color : 'rgba(255,255,255,0.8)', textDecoration: done ? 'line-through' : 'none' }}
                  >
                    {prob.title}
                  </span>
                  <span className={`text-[9px] mono px-1.5 rounded ${diffTextColor(prob.difficulty)}`}>
                    {prob.difficulty}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="text-gray-500 text-[10px] italic py-2 px-2 text-center">
              No problems found for this topic yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = ({ onSelectProblem }) => {
  // Database & Profile state
  const [dbProblems, setDbProblems]         = useState([]); 
  const [userProfile, setUserProfile]       = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading]               = useState(true);

  // Layout state
  const [activeRightTab, setActiveRightTab] = useState('roadmap');

  // Fetch Supabase profile AND Problems
  useEffect(() => {
    (async () => {
      try {
        const { data: problemsData } = await supabase
          .from('problems')
          .select('id, title, slug, difficulty, topics');
        
        if (problemsData) {
          setDbProblems(problemsData);
        }

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


  //Dynamic Roadmap Generation
  const dynamicRoadmap = useMemo(() => {
    return DSA_CATEGORIES.map(cat => {
      const categoryProblems = dbProblems.filter(p => {
        if (!p.topics) return false;
        const lowerTopics = p.topics.map(t => t.toLowerCase());
        return lowerTopics.some(t => cat.matchTags.includes(t));
      });
      return { ...cat, problems: categoryProblems };
    });
  }, [dbProblems]);

  // Roadmap Progress Calculations
  const solvedSlugs = useMemo(() => new Set(solvedProblems.map(p => p.slug)), [solvedProblems]);
  
  const totalTopics = dynamicRoadmap.reduce((acc, node) => acc + node.problems.length, 0);
  const totalCompleted = dynamicRoadmap.reduce((acc, node) => acc + node.problems.filter(p => solvedSlugs.has(p.slug)).length, 0);
  const overallPct = totalTopics === 0 ? 0 : Math.round((totalCompleted / totalTopics) * 100);

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
      `}</style>

      <div
        className="flex flex-col text-white"
        style={{ height: '100vh', background: 'radial-gradient(ellipse at 10% 0%, #0c1a2e 0%, #030712 55%)' }}
      >
        {/* ── Top Bar ── */}
        {/* <div className="shrink-0 border-b border-white/5 px-5 py-2.5 flex items-center justify-between">
          <span className="mono text-blue-400 text-xs font-bold tracking-widest uppercase">⌘ CodeForge</span>
          <div className="flex items-center gap-3 text-xs mono text-gray-600">
            <span>{userProfile?.username || 'Coder'}</span>
            <span className="text-gray-800">·</span>
            <span className="text-blue-500/70 border border-blue-500/20 px-2 py-0.5 rounded-full">
              ◆ {userProfile?.rank_score || 0} pts
            </span>
          </div>
        </div> */}

        {/* ── 1-Panel Body (Full Width Profile/Roadmap) ── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Tab bar */}
            <div
              className="shrink-0 border-b border-white/5 flex items-center px-6 gap-2"
              style={{ background: 'rgba(5,10,20,0.5)' }}
            >
              {[
                { id: 'roadmap', label: '🗺 Roadmap' },
                { id: 'profile', label: '👤 Profile' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-all ${
                    activeRightTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-600 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {/* ✨ AI GENERATE BUTTON MOVED HERE */}
               {/* <div className="ml-auto py-2">
                <button
                  onClick={handleGenerateProblem}
                  className="bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg px-5 py-1.5 text-xs font-bold shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <span className="text-sm">✨</span> Generate Custom AI Problem
                </button>
              </div> */}
            </div> 

            {/* ── Tab: PROFILE ── */}
            {activeRightTab === 'profile' && (
              <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8 max-w-5xl mx-auto w-full">
                {/* Avatar + info */}
                <div className="flex items-center gap-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shrink-0"
                    style={{ background: 'linear-gradient(135deg,#3b82f6,#7c3aed)', boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}
                  >
                    {(userProfile?.username || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">{userProfile?.username || 'Coder'}</h2>
                    <p className="text-gray-500 mono text-sm mt-1">{userProfile?.email || 'no email'}</p>
                    <div className="mt-3 inline-block mono text-xs px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                      ◆ Rank Score: {userProfile?.rank_score || 0}
                    </div>
                  </div>
                </div>

                {/* Solve stats */}
                <div className="mt-4">
                  <p className="mono text-xs uppercase tracking-widest text-gray-600 mb-4">Problems Solved</p>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-6xl font-extrabold text-white">{solvedProblems.length}</span>
                    <span className="text-gray-500 text-lg mb-2">total solved</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Easy',   count: easyCount,   color: '#4ade80', bg: 'rgba(74,222,128,0.06)' },
                      { label: 'Medium', count: mediumCount, color: '#facc15', bg: 'rgba(250,204,21,0.06)' },
                      { label: 'Hard',   count: hardCount,   color: '#f87171', bg: 'rgba(248,113,113,0.06)' },
                    ].map(({ label, count, color, bg }) => (
                      <div key={label} className="rounded-2xl p-6 text-center" style={{ background: bg, border: `1px solid ${color}20` }}>
                        <div className="text-4xl font-bold mono" style={{ color }}>{count}</div>
                        <div className="text-xs mt-2 font-semibold uppercase tracking-wider" style={{ color: `${color}99` }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 my-2" />

                {/* Solved list */}
                <div>
                  <p className="mono text-xs uppercase tracking-widest text-gray-600 mb-4">Recently Solved</p>
                  <ul className="flex flex-col gap-2">
                    {solvedProblems.length > 0 ? solvedProblems.slice(0, 15).map((prob, idx) => (
                      <li key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/5 cursor-default transition-colors">
                        <span className="text-sm font-medium text-gray-200">{prob?.title}</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold shrink-0 mono ${diffBadgeClass(prob?.difficulty)}`}>
                          {prob?.difficulty}
                        </span>
                      </li>
                    )) : (
                      <li className="text-center text-gray-600 italic text-sm py-10 bg-white/5 rounded-xl border border-white/5">No problems solved yet. Time to get coding! 🚀</li>
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
                  className="sticky top-0 z-10 px-8 py-6 border-b border-white/5 flex items-center justify-between"
                  style={{ background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(8px)' }}
                >
                  <div>
                    <h3 className="font-extrabold text-2xl">DSA Mastery Roadmap</h3>
                    <p className="text-xs text-gray-500 mt-2">Track your progress from Data Structures to advanced Dynamic Programming.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="mono text-3xl font-bold text-blue-400">{overallPct}%</div>
                      <div className="text-xs text-gray-600 mono mt-1">{totalCompleted} / {totalTopics} problems</div>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5"/>
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="#38bdf8" strokeWidth="3.5"
                          strokeDasharray={`${overallPct * 0.88} 100`}
                          strokeLinecap="round"
                          style={{ filter: 'drop-shadow(0 0 4px #38bdf8)' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="mono text-xs font-bold text-blue-400">{overallPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid of nodes */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                  {dynamicRoadmap.map((node, index) => (
                    <div key={node.id} className="relative">
                      <div
                        className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black mono shadow-lg"
                        style={{ background: node.color, color: '#000' }}
                      >
                        {index + 1}
                      </div>
                      <RoadmapNode
                        node={node}
                        index={index}
                        solvedSlugs={solvedSlugs}
                        onSelectProblem={onSelectProblem}
                      />
                    </div>
                  ))}
                </div>

                {overallPct === 100 && totalTopics > 0 && (
                  <div className="max-w-4xl mx-auto mb-10 rounded-2xl p-8 text-center border border-yellow-500/25 bg-yellow-500/5">
                    <div className="text-5xl mb-3">🏆</div>
                    <h3 className="font-extrabold text-yellow-400 text-xl">DSA Mastered!</h3>
                    <p className="text-gray-400 text-sm mt-2">You completed the entire roadmap. You are ready for any technical interview.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
