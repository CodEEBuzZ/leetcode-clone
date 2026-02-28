// Workspace.jsx
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

  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // Determine which languages are available for the current problem
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

  // Sync editor content and language whenever the problem changes
  useEffect(() => {
    if (!problem?.code_snippets) return;
    
    const availableLangs = Object.keys(problem.code_snippets);
    
    // Default to the first available language if the current selection isn't supported by this problem
    const initialLang = availableLangs.includes(language) ? language : availableLangs[0];
    setLanguage(initialLang);
    
    // Initialize the cache with the starter code snippets from Supabase
    const newCache = {};
    availableLangs.forEach(lang => {
      newCache[lang] = problem.code_snippets[lang];
    });
    
    setCodeCache(newCache);
  }, [problem]); // Trigger refresh when the whole problem object updates

  const handleProtectedAction = (e) => {
    if (!isLoggedIn) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setShowAuthModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    const currentCode = codeCache[language];
    
    try {
      const response = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentCode,
          language: language,
          slug: problem.slug
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Execution Results:\n\nOutput: ${data.output}\nCPU Time: ${data.cpuTime}s\nMemory: ${data.memory}kb`);
      } else {
        alert(`Error: ${data.error || 'Failed to execute code'}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Could not connect to the server. Make sure your backend is running.");
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
          <p className="text-sm">Fetching from Supabase</p>
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
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
               problem.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' : 
               problem.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
            }`}>
              {problem.difficulty}
            </span>
            <p className="text-xs text-gray-400">{problem.slug}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-300">
            Language:
            <select
              value={language}
              onChange={handleLanguageChange}
              className="ml-2 bg-background border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>

          <button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-6 rounded-md shadow-lg transition-colors text-sm"
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
            <ReactMarkdown
              className="prose prose-invert max-w-none"
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <pre className="bg-panel rounded p-3 overflow-auto text-xs font-mono">
                      <code {...props}>{String(children).replace(/\n$/, '')}</code>
                    </pre>
                  ) : (
                    <code className="bg-panel rounded px-1 py-0.5 text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {problem.description}
            </ReactMarkdown>

            {Array.isArray(problem.examples) && problem.examples.length > 0 && (
              <div className="pb-10">
                <h3 className="text-sm font-semibold mb-3">Examples</h3>
                <div className="space-y-4">
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-panel rounded border border-gray-700 p-3 text-xs">
                      <div className="font-semibold text-gray-300 mb-2">
                        Example {ex.example_num || idx + 1}
                      </div>
                      <pre className="bg-background rounded p-2 overflow-auto font-mono whitespace-pre-wrap text-gray-200">
                        {ex.example_text}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div
          className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize transition-colors"
          onMouseDown={handleInnerDividerMouseDown}
        />

        <section
          className="flex flex-col bg-background relative"
          style={{ width: `${100 - descriptionWidth}%` }}
        >
          <div className="flex-1 overflow-hidden relative">
            {!isLoggedIn && (
                <div 
                    className="absolute inset-0 z-20 cursor-pointer bg-black/10"
                    onClick={handleProtectedAction}
                />
            )}

            <Editor
              height="100%"
              language={language === 'python3' ? 'python' : language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={codeCache[language] || ''}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              options={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true 
              }}
            />
          </div>
        </section>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}