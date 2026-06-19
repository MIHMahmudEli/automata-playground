'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';
import { AutomataCore } from '@/lib/automata-core';
import { AutomataVisualizer } from '@/lib/automata-visualizer';

export default function CFGWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<AutomataVisualizer | null>(null);
  const [variables, setVariables] = useState('');
  const [terminals, setTerminals] = useState('');
  const [startSymbol, setStartSymbol] = useState('');
  const [productions, setProductions] = useState('');
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
  const [generated, setGenerated] = useState(false);

  const showMessage = useCallback((text: string, type: string) => {
    setMessages(prev => [...prev, { text, type }]);
    setTimeout(() => setMessages(prev => prev.slice(1)), 4000);
  }, []);

  const doRender = useCallback((validationData: Record<string, unknown>) => {
    if (!containerRef.current) return;
    setGenerated(true);
    visualizerRef.current?.destroy();
    visualizerRef.current = new AutomataVisualizer(containerRef.current);
    visualizerRef.current.renderCFG(validationData as any);
  }, []);

  const generateCFG = useCallback(() => {
    const input = { variables, terminals, startSymbol, productions };
    const validation = AutomataCore.validateCFG(input);
    const msgs: Array<{ type: string; text: string }> = [];
    validation.errors.forEach(e => msgs.push({ type: 'error', text: e }));
    validation.warnings.forEach(w => msgs.push({ type: 'warning', text: w }));
    setMessages(msgs);
    if (!validation.valid) return;
    doRender(validation.data);
  }, [variables, terminals, startSymbol, productions, doRender]);

  const clearAll = useCallback(() => {
    setVariables(''); setTerminals(''); setStartSymbol(''); setProductions('');
    setMessages([]); setGenerated(false);
    visualizerRef.current?.destroy();
    visualizerRef.current = null;
  }, []);

  const exportPNG = useCallback(() => {
    if (!visualizerRef.current?.cy) { showMessage('Generate a CFG first!', 'error'); return; }
    const png = visualizerRef.current.exportPNG();
    if (png) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = 'cfg-graph.png';
      link.click();
    }
  }, [showMessage]);

  const resetView = useCallback(() => {
    visualizerRef.current?.resetView();
  }, []);

  const loadExample = useCallback((name: string) => {
    const examples: Record<string, any> = {
      expressions: {
        variables: 'E, T, F',
        terminals: '+, *, (, ), id',
        start: 'E',
        productions: 'E->E+T\nE->T\nT->T*F\nT->F\nF->(E)\nF->id'
      },
      balanced: {
        variables: 'S',
        terminals: '(, )',
        start: 'S',
        productions: 'S->SS\nS->(S)\nS->ε'
      },
      palindromes: {
        variables: 'S',
        terminals: 'a, b',
        start: 'S',
        productions: 'S->aSa\nS->bSb\nS->a\nS->b\nS->ε'
      },
    };
    const ex = examples[name];
    if (ex) {
      setVariables(ex.variables); setTerminals(ex.terminals); setStartSymbol(ex.start);
      setProductions(ex.productions);
      const input = { variables: ex.variables, terminals: ex.terminals, startSymbol: ex.start, productions: ex.productions };
      const validation = AutomataCore.validateCFG(input);
      if (validation.valid) doRender(validation.data);
    }
  }, [doRender]);

  useEffect(() => {
    return () => { visualizerRef.current?.destroy(); };
  }, []);

  return (
    <>
      <WorkspaceNavbar title="CFG Workspace" subtitle="Context-Free Grammar" />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Context-Free Grammar</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">Create, visualize, and validate context-free grammars</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-cog text-purple-400 mr-3" /> CFG Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Variables <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="S, A, B" value={variables} onChange={e => setVariables(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Terminals <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="a, b, +, (, )" value={terminals} onChange={e => setTerminals(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Start Symbol</label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="S" value={startSymbol} onChange={e => setStartSymbol(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Productions <span className="text-xs text-gray-500">(one per line: A-&gt;aB or A→aB)</span></label>
                    <textarea className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm resize-none" rows={6} placeholder="S-&gt;AB&#10;A-&gt;aA&#10;A-&gt;a&#10;B-&gt;bB&#10;B-&gt;b" value={productions} onChange={e => setProductions(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-primary flex-1 px-6 py-3 text-white font-semibold rounded-lg" onClick={generateCFG}>
                      <i className="fas fa-play mr-2" />Generate CFG
                    </button>
                    <button className="px-6 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition border border-white/10" onClick={clearAll}>
                      <i className="fas fa-trash mr-2" />Clear
                    </button>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-gray-400 text-sm mb-3">Quick Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('expressions')}>Arithmetic Expressions</button>
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('balanced')}>Balanced Parentheses</button>
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('palindromes')}>Palindromes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fas fa-eye text-pink-400 mr-3" /> Visualization
              </h2>
              <div className="bg-white/5 rounded-xl border border-white/10 relative h-[400px]" id="cfg-graph-container" ref={containerRef}>
                {!generated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-project-diagram text-purple-400 text-3xl" />
                      </div>
                      <p className="text-gray-400 mb-2">Your CFG will appear here</p>
                      <p className="text-gray-500 text-sm">Configure and click &quot;Generate CFG&quot;</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`glass-card p-3 border-l-4 text-sm ${msg.type === 'error' ? 'border-red-500' : msg.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}>
                    <div className="flex items-start">
                      <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-circle text-red-400' : msg.type === 'warning' ? 'fa-exclamation-triangle text-yellow-400' : 'fa-info-circle text-blue-400'} mr-2 mt-0.5`} />
                      <p className="text-gray-300">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition text-sm" onClick={exportPNG}>
                    <i className="fas fa-download mr-2" />PNG
                  </button>
                  <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition text-sm" onClick={resetView}>
                    <i className="fas fa-sync mr-2" />Reset
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  <i className="fas fa-info-circle mr-1" />Variables = rectangles, Terminals = ellipses
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
