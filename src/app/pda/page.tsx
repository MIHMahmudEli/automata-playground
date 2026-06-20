'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';
import { AutomataCore } from '@/lib/automata-core';
import { AutomataVisualizer } from '@/lib/automata-visualizer';
import { AutomataAI } from '@/lib/automata-ai';

export default function PDAWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<AutomataVisualizer | null>(null);
  const [states, setStates] = useState('');
  const [inputAlphabet, setInputAlphabet] = useState('');
  const [stackAlphabet, setStackAlphabet] = useState('');
  const [startState, setStartState] = useState('');
  const [startStackSymbol, setStartStackSymbol] = useState('');
  const [acceptStates, setAcceptStates] = useState('');
  const [transitions, setTransitions] = useState('');
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
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
    visualizerRef.current.renderPDA(validationData as any);
  }, []);

  const generatePDA = useCallback(() => {
    const input = { states, inputAlphabet, stackAlphabet, startState, startStackSymbol, acceptStates, transitions };
    const validation = AutomataCore.validatePDA(input);
    const msgs: Array<{ type: string; text: string }> = [];
    validation.errors.forEach(e => msgs.push({ type: 'error', text: e }));
    validation.warnings.forEach(w => msgs.push({ type: 'warning', text: w }));
    setMessages(msgs);
    if (!validation.valid) return;
    doRender(validation.data);
  }, [states, inputAlphabet, stackAlphabet, startState, startStackSymbol, acceptStates, transitions, doRender]);

  const askAI = useCallback(async () => {
    if (!aiQuestion) return;
    setAiLoading(true);
    try {
      const result = await AutomataAI.generateFromQuestion(aiQuestion, 'PDA');
      const newStates = result.data.states.join(', ');
      const newInputAlphabet = result.data.inputAlphabet.join(', ');
      const newStackAlphabet = result.data.stackAlphabet.join(', ');
      const newStart = result.data.startState;
      const newStartStack = result.data.startStackSymbol;
      const newAccept = result.data.acceptStates.join(', ');
      const newTrans = result.data.transitions.map((t: any) => `${t.from},${t.input},${t.stackTop},${t.to},${t.stackPush}`).join('\n');
      setStates(newStates);
      setInputAlphabet(newInputAlphabet);
      setStackAlphabet(newStackAlphabet);
      setStartState(newStart);
      setStartStackSymbol(newStartStack);
      setAcceptStates(newAccept);
      setTransitions(newTrans);
      if (result.explanation) showMessage(result.explanation, 'info');
      const input = { states: newStates, inputAlphabet: newInputAlphabet, stackAlphabet: newStackAlphabet, startState: newStart, startStackSymbol: newStartStack, acceptStates: newAccept, transitions: newTrans };
      const validation = AutomataCore.validatePDA(input);
      if (validation.valid) doRender(validation.data);
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setAiLoading(false);
    }
  }, [aiQuestion, doRender, showMessage]);

  const clearAll = useCallback(() => {
    setStates(''); setInputAlphabet(''); setStackAlphabet('');
    setStartState(''); setStartStackSymbol(''); setAcceptStates(''); setTransitions('');
    setMessages([]); setGenerated(false);
    visualizerRef.current?.destroy();
    visualizerRef.current = null;
  }, []);

  const exportPNG = useCallback(() => {
    if (!visualizerRef.current?.cy) { showMessage('Generate a PDA first!', 'error'); return; }
    const png = visualizerRef.current.exportPNG();
    if (png) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = 'pda-graph.png';
      link.click();
    }
  }, [showMessage]);

  const resetView = useCallback(() => {
    visualizerRef.current?.resetView();
  }, []);

  const loadExample = useCallback((name: string) => {
    const examples: Record<string, any> = {
      anbn: {
        states: 'q0, q1, q2',
        inputAlphabet: 'a, b',
        stackAlphabet: 'Z, X',
        start: 'q0',
        startStack: 'Z',
        accept: 'q2',
        transitions: 'q0,a,Z,q0,XZ\nq0,a,X,q0,XX\nq0,b,X,q1,ε\nq1,b,X,q1,ε\nq1,ε,Z,q2,Z'
      },
      wwr: {
        states: 'q0, q1, q2',
        inputAlphabet: 'a, b',
        stackAlphabet: 'Z, A, B',
        start: 'q0',
        startStack: 'Z',
        accept: 'q2',
        transitions: 'q0,a,Z,q0,AZ\nq0,a,A,q0,AA\nq0,a,B,q0,AB\nq0,b,Z,q0,BZ\nq0,b,A,q0,BA\nq0,b,B,q0,BB\nq0,ε,Z,q1,Z\nq0,ε,A,q1,A\nq0,ε,B,q1,B\nq1,a,A,q1,ε\nq1,b,B,q1,ε\nq1,ε,Z,q2,Z'
      },
      equalab: {
        states: 'q0, q1',
        inputAlphabet: 'a, b',
        stackAlphabet: 'Z, X',
        start: 'q0',
        startStack: 'Z',
        accept: 'q1',
        transitions: 'q0,a,Z,q0,XZ\nq0,a,X,q0,XX\nq0,a,Z,q0,XZ\nq0,b,X,q0,ε\nq0,ε,Z,q1,Z'
      },
    };
    const ex = examples[name];
    if (ex) {
      setStates(ex.states); setInputAlphabet(ex.inputAlphabet); setStackAlphabet(ex.stackAlphabet);
      setStartState(ex.start); setStartStackSymbol(ex.startStack); setAcceptStates(ex.accept);
      setTransitions(ex.transitions);
      const input = { states: ex.states, inputAlphabet: ex.inputAlphabet, stackAlphabet: ex.stackAlphabet, startState: ex.start, startStackSymbol: ex.startStack, acceptStates: ex.accept, transitions: ex.transitions };
      const validation = AutomataCore.validatePDA(input);
      if (validation.valid) doRender(validation.data);
    }
  }, [doRender]);

  useEffect(() => {
    return () => { visualizerRef.current?.destroy(); };
  }, []);

  return (
    <>
      <WorkspaceNavbar title="PDA Workspace" subtitle="Pushdown Automaton" />
      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Pushdown Automaton</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">Design and visualize PDAs with stack-based computation</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 border-2 border-purple-500/30 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                  <i className="fas fa-robot text-6xl" />
                </div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-magic text-purple-400 mr-3 animate-pulse" />
                  AI Automata Builder
                </h2>
                <div className="relative">
                  <input type="text" className="input-field w-full pl-4 pr-12 py-3 rounded-xl text-sm" placeholder="e.g. 'PDA for a^n b^n'" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} />
                  <button onClick={askAI} className="absolute right-2 top-1 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-500 transition">
                    <i className="fas fa-paper-plane text-white text-xs" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="text-[10px] text-purple-300 hover:text-white transition" onClick={() => setAiQuestion('a^n b^n PDA')}>&quot;a^n b^n&quot;</button>
                  <button className="text-[10px] text-purple-300 hover:text-white transition" onClick={() => setAiQuestion('w w^R PDA')}>&quot;w w^R&quot;</button>
                </div>
                {aiLoading && (
                  <div className="mt-4 text-center">
                    <i className="fas fa-spinner fa-spin text-purple-400 mr-2" />
                    <span className="text-xs text-gray-400">AI is thinking...</span>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-cog text-purple-400 mr-3" /> PDA Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">States <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q0, q1, q2" value={states} onChange={e => setStates(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Input Alphabet <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="a, b" value={inputAlphabet} onChange={e => setInputAlphabet(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Stack Alphabet <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="Z, X" value={stackAlphabet} onChange={e => setStackAlphabet(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Start State</label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q0" value={startState} onChange={e => setStartState(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Start Stack Symbol</label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="Z" value={startStackSymbol} onChange={e => setStartStackSymbol(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Accept States <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q2" value={acceptStates} onChange={e => setAcceptStates(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Transitions <span className="text-xs text-gray-500">(one per line: from,input,stackTop,to,stackPush)</span></label>
                    <textarea className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm resize-none" rows={6} placeholder="q0,a,Z,q0,XZ&#10;q0,a,X,q0,XX&#10;q0,b,X,q1,ε&#10;q1,b,X,q1,ε&#10;q1,ε,Z,q2,Z" value={transitions} onChange={e => setTransitions(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-primary flex-1 px-6 py-3 text-white font-semibold rounded-lg" onClick={generatePDA}>
                      <i className="fas fa-play mr-2" />Generate PDA
                    </button>
                    <button className="px-6 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition border border-white/10" onClick={clearAll}>
                      <i className="fas fa-trash mr-2" />Clear
                    </button>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-gray-400 text-sm mb-3">Quick Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('anbn')}>aⁿ bⁿ</button>
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('wwr')}>w wᴿ</button>
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('equalab')}>Equal a&apos;s and b&apos;s</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fas fa-eye text-pink-400 mr-3" /> Visualization
              </h2>
              <div className="bg-white/5 rounded-xl border border-white/10 relative h-[250px] sm:h-[350px] md:h-[400px]" id="pda-graph-container" ref={containerRef}>
                {!generated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-layer-group text-purple-400 text-3xl" />
                      </div>
                      <p className="text-gray-400 mb-2">Your PDA will appear here</p>
                      <p className="text-gray-500 text-sm">Configure and click &quot;Generate PDA&quot;</p>
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
                  <i className="fas fa-info-circle mr-1" />Green = start, Pink = accept
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
