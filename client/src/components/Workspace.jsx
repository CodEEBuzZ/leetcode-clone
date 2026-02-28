import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { API_BASE } from '../config/api';
import AuthModal from './AuthModal';

const DEFAULT_LANG = 'javascript';

export default function Workspace({ problem, layoutSignal }) {
  const [language, setLanguage] = useState(DEFAULT_LANG);
  const [codeCache, setCodeCache] = useState({});
  const [descriptionWidth, setDescriptionWidth] = useState(50);

  // --- AUTHENTICATION STATE ---
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✨ AI MENTOR STATE
  const [aiHint, setAiHint] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ✨ OUTPUT TERMINAL STATE (Moved inside the component)
  const [executionResult, setExecutionResult] = useState(null);

  const containerRef = useRef(null);
  const editorRef = useRef(null);

  const languages = useMemo(() => {
    if (!problem || !problem.code_snippets) return [];
    return Object.keys(problem.code_snippets);
  }, [problem]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!problem?.code_snippets) return;
    const availableLangs = Object.keys(problem.code_snippets);
    const initialLang = availableLangs.includes(language) ? language : availableLangs[0];
    setLanguage(initialLang);
    const newCache = {};
    availableLangs.forEach(lang => {
      newCache[lang] = problem.code_snippets[lang];
    });
    setCodeCache(newCache);
    setAiHint('');
    setExecutionResult(null); // Clear terminal on problem change
  }, [problem]);

  const handleProtectedAction = (e) => {
    if (!isLoggedIn) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setShowAuthModal(true);
    }
  };

  // ✨ UPDATED: Handles Beautiful Terminal Output instead of alerts
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setExecutionResult({ loading: true });

    try {
      const currentCode = codeCache[language];
      const response = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          language: language,
          slug: problem.slug
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setExecutionResult({
          success: true,
          output: data.output,
          cpuTime: data.cpuTime,
          memory: data.memory
        });
      } else {
        setExecutionResult({ success: false, error: data.error || 'Execution failed' });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setExecutionResult({ success: false, error: "Could not connect to the server." });
    }
  };

  const handleAskAI = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setIsAiLoading(true);
    setAiHint('');
    try {
      const currentCode = codeCache[language] || '';
      const response = await fetch(`${API_BASE}/api/ai-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          userCode: currentCode,
          language: language
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAiHint(data.suggestion);
      } else {
        setAiHint('Oops! The AI Mentor is currently offline.');
      }
    } catch (error) {
      setAiHint('Failed to connect to the AI Mentor.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setLanguage(e.target.value);
  };

  const handleCodeChange = (newCode) => {
    setCodeCache(prev => ({
      ...prev,
      [language]: newCode ?? ''
    }));
  };

  const handleInnerDividerMouseDown = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMouseMove = (moveEvent) => {
      const offsetX = moveEvent.clientX - rect.left;
      let next = (offsetX / rect.width) * 100;
      next = Math.min(75, Math.max(25, next));
      setDescriptionWidth(next);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    setTimeout(() => editor.layout(), 0);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, [descriptionWidth, layoutSignal]);

  if (!problem || !problem.description) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-background">
        <div className="text-center">
          <p className="text-lg font-medium">Loading problem details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-panel sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold text-white">{problem.title}</h2>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' :
              problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
              }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-300">
            Language:
            <select
              value={language}
              onChange={handleLanguageChange}
              className="ml-2 bg-background border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </label>

          <button
            onClick={handleAskAI}
            disabled={isAiLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-1.5 px-4 rounded-md text-sm"
          >
            {isAiLoading ? "Thinking..." : "✨ Ask AI"}
          </button>

          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-6 rounded-md text-sm"
          >
            Submit
          </button>
        </div>
      </header>

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <section
          className="border-r border-gray-800 flex flex-col bg-background"
          style={{ width: `${descriptionWidth}%` }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiHint && (
              <div className="mb-4 p-4 bg-purple-900/40 border border-purple-500/50 rounded-xl relative">
                <button onClick={() => setAiHint('')} className="absolute top-2 right-2 text-purple-300">✕</button>
                <h3 className="text-purple-300 font-bold mb-2 text-sm">✨ AI Mentor Hint</h3>
                <div className="text-sm text-gray-200 whitespace-pre-wrap">{aiHint}</div>
              </div>
            )}

            <ReactMarkdown className="prose prose-invert max-w-none">
              {problem.description}
            </ReactMarkdown>
            {problem.examples && Array.isArray(problem.examples) && (
              <div className="mt-8 space-y-6">
                <h3 className="text-white font-bold text-lg border-b border-gray-800 pb-2">Examples</h3>
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700 space-y-3">
                    <h4 className="text-blue-400 font-bold text-sm">Example {index + 1}:</h4>
                    <div className="font-mono text-sm space-y-2">
                      <div className="flex flex-col sm:flex-row gap-1">
                        <span className="text-gray-500 min-w-[60px]">Input:</span>
                        <span className="text-gray-200 bg-black/30 px-2 py-0.5 rounded">{example.input}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <span className="text-gray-500 min-w-[60px]">Output:</span>
                        <span className="text-gray-200 bg-black/30 px-2 py-0.5 rounded">{example.output}</span>
                      </div>
                      {example.explanation && (
                        <div className="mt-2 text-gray-400">
                          <span className="text-gray-500 font-semibold">Explanation: </span>
                          <p className="inline italic">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" onMouseDown={handleInnerDividerMouseDown} />

        <section className="flex flex-col bg-background relative" style={{ width: `${100 - descriptionWidth}%` }}>
          {/* EDITOR AREA */}
          <div className="flex-1 overflow-hidden relative border-b border-gray-800">
            {!isLoggedIn && <div className="absolute inset-0 z-20 bg-black/10" onClick={handleProtectedAction} />}
            <Editor
              height="100%"
              language={language === 'python3' ? 'python' : language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={codeCache[language] || ''}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              options={{ minimap: { enabled: false }, automaticLayout: true }}
            />
          </div>

          {/* ✨ BEAUTIFUL OUTPUT TERMINAL */}
          <div className="h-48 bg-[#0d1117] flex flex-col font-mono text-sm border-t border-gray-800">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
              <span className="text-gray-400 font-bold text-xs uppercase">Output</span>
              {executionResult && <button onClick={() => setExecutionResult(null)} className="text-gray-500 hover:text-white text-xs">Clear</button>}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!executionResult ? (
                <p className="text-gray-600">Run code to see output...</p>
              ) : executionResult.loading ? (
                <p className="text-blue-400 animate-pulse">Running code...</p>
              ) : executionResult.success ? (
                <div className="space-y-2">
                  <p className="text-green-400 font-bold">✓ Success!</p>
                  <pre className="text-gray-200 bg-black/30 p-2 rounded border border-gray-800">{executionResult.output}</pre>
                </div>
              ) : (
                <p className="text-red-400">Error: {executionResult.error}</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}