import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { API_BASE } from '../config/api';

const DEFAULT_LANG = 'javascript';

export default function Workspace({ problem }) {
  const [language, setLanguage] = useState(DEFAULT_LANG);
  const [codeCache, setCodeCache] = useState({});
  const [descriptionWidth, setDescriptionWidth] = useState(50);

  // Terminal State
  const [outputHeight, setOutputHeight] = useState(200);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState("output");

  // Execution & AI State
  const [aiHint, setAiHint] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [runStatus, setRunStatus] = useState(null);

  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // --- DATA PARSING ---
  const formattedDescription = useMemo(() => {
    if (!problem?.description) return "";
    return problem.description.replace(/\\n/g, '\n');
  }, [problem]);

  const parsedExamples = useMemo(() => {
    if (!problem?.examples) return [];
    try {
      return Array.isArray(problem.examples) ? problem.examples : JSON.parse(problem.examples);
    } catch (e) { return []; }
  }, [problem]);

  const languages = useMemo(() => problem?.code_snippets ? Object.keys(problem.code_snippets) : [], [problem]);

  useEffect(() => {
    if (!problem?.code_snippets) return;
    const initialLang = languages.includes(language) ? language : languages[0];
    setLanguage(initialLang);
    const newCache = {};
    languages.forEach(lang => { newCache[lang] = problem.code_snippets[lang]; });
    setCodeCache(newCache);
    setExecutionResult(null);
  }, [problem]);

  // --- RESIZE HANDLERS ---
  const handleInnerDividerMouseDown = (e) => {
    e.preventDefault();
    const onMove = (ev) => {
      const rect = containerRef.current.getBoundingClientRect();
      let next = ((ev.clientX - rect.left) / rect.width) * 100;
      setDescriptionWidth(Math.min(75, Math.max(20, next)));
    };
    const stop = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', stop);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stop);
  };

  const handleOutputResizeMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = outputHeight;
    const onMove = (ev) => {
      const delta = startY - ev.clientY; // Dragging up increases height
      const newHeight = Math.max(42, Math.min(600, startHeight + delta));
      setOutputHeight(newHeight);
      if (newHeight > 50) setIsOutputCollapsed(false);
    };
    const stop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
  };

  // --- ACTIONS ---
  const handleSubmit = async () => {
    setRunStatus("running");
    setExecutionResult({ loading: true });
    setIsOutputCollapsed(false);
    try {
      const response = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeCache[language], language, slug: problem.slug }),
      });
      const data = await response.json();
      setRunStatus(response.ok ? "success" : "error");
      setExecutionResult(response.ok ? { success: true, ...data } : { success: false, error: data.error });
    } catch {
      setRunStatus("error");
      setExecutionResult({ success: false, error: "Connection failed." });
    }
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemTitle: problem.title, userCode: codeCache[language], language })
      });
      const data = await response.json();
      setAiHint(data.suggestion);
    } catch { setAiHint("AI offline."); }
    finally { setIsAiLoading(false); }
  };

  if (!problem) return <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#1a1a1a]">Select a problem...</div>;

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#1e1e1e]">
        <div>
          <h2 className="text-lg font-bold">{problem.title}</h2>
          <span className="text-[10px] text-green-400 uppercase">{problem.difficulty}</span>
        </div>
        <div className="flex items-center gap-4">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#0d1117] border border-gray-700 rounded px-2 py-1 text-xs">
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <button onClick={handleAskAI} className="bg-indigo-600 px-4 py-1.5 rounded-md text-sm font-bold">✨ Ask AI</button>
          <button onClick={handleSubmit} className="bg-blue-600 px-6 py-1.5 rounded-md text-sm font-bold">Run</button>
        </div>
      </header>

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Description */}
        <section style={{ width: `${descriptionWidth}%` }} className="border-r border-gray-800 overflow-y-auto p-8 custom-scrollbar">
          {aiHint && <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl mb-6 text-sm whitespace-pre-wrap">{aiHint}</div>}
          <ReactMarkdown className="prose prose-invert whitespace-pre-wrap">{formattedDescription}</ReactMarkdown>
          {parsedExamples.map((ex, i) => (
            <div key={i} className="mt-6 bg-[#262626] p-4 rounded-xl border border-gray-800 font-mono text-sm">
              <div className="text-blue-400 text-xs mb-2 uppercase">Example {ex.example_num || i+1}</div>
              <div className="whitespace-pre-wrap">{ex.example_text}</div>
            </div>
          ))}
        </section>

        {/* Vertical Divider */}
        <div className="w-1 bg-gray-800 cursor-col-resize hover:bg-blue-500 transition-colors" onMouseDown={handleInnerDividerMouseDown} />

        {/* Editor & Terminal */}
        <section style={{ width: `${100 - descriptionWidth}%` }} className="flex flex-col bg-[#0d1117]">
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={codeCache[language] || ""}
              onChange={(val) => setCodeCache(prev => ({ ...prev, [language]: val }))}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 20 } }}
            />
          </div>

          {/* Terminal */}
          <div 
            className="flex flex-col bg-[#090c10] border-t border-gray-800 relative" 
            style={{ height: isOutputCollapsed ? '42px' : `${outputHeight}px` }}
          >
            {/* Horizontal Resize Handle */}
            <div 
              className="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-blue-500 z-10" 
              onMouseDown={handleOutputResizeMouseDown} 
            />

            {/* Terminal Header */}
            <div className="flex justify-between items-center px-6 h-[41px] bg-[#161b22] shrink-0">
              <div className="flex gap-4">
                {["output", "testcase"].map(tab => (
                  <button key={tab} onClick={() => {setActiveTerminalTab(tab); setIsOutputCollapsed(false);}} 
                    className={`text-[10px] font-bold uppercase ${activeTerminalTab === tab ? "text-blue-500" : "text-gray-500"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsOutputCollapsed(!isOutputCollapsed)} className="text-gray-500 hover:text-white text-[10px] font-bold">
                {isOutputCollapsed ? "EXPAND" : "COLLAPSE"}
              </button>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 overflow-auto p-6 font-mono text-sm">
              {activeTerminalTab === "output" ? (
                executionResult?.loading ? <div className="text-yellow-500 animate-pulse">Running...</div> :
                executionResult?.success ? <pre className="text-green-400">{executionResult.output}</pre> :
                executionResult?.error ? <pre className="text-red-400">{executionResult.error}</pre> :
                <span className="text-gray-600 italic">No output yet.</span>
              ) : (
                <span className="text-gray-600">Testcase configuration coming soon.</span>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
