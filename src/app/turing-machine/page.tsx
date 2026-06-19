'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';
import { AutomataCore } from '@/lib/automata-core';
import { AutomataVisualizer } from '@/lib/automata-visualizer';
import { AutomataAI } from '@/lib/automata-ai';

export default function TMWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<AutomataVisualizer | null>(null);
  const [states, setStates] = useState('');
  const [inputAlphabet, setInputAlphabet] = useState('');
  const [tapeAlphabet, setTapeAlphabet] = useState('');
  const [startState, setStartState] = useState('');
  const [acceptState, setAcceptState] = useState('');
  const [rejectState, setRejectState] = useState('');
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
    visualizerRef.current.renderTM(validationData as any);
  }, []);

  const generateTM = useCallback(() => {
    const input = { states, inputAlphabet, tapeAlphabet, startState, acceptState, rejectState, transitions };
    const validation = AutomataCore.validateTM(input);
    const msgs: Array<{ type: string; text: string }> = [];
    validation.errors.forEach(e => msgs.push({ type: 'error', text: e }));
    validation.warnings.forEach(w => msgs.push({ type: 'warning', text: w }));
    setMessages(msgs);
    if (!validation.valid) return;
    doRender(validation.data);
  }, [states, inputAlphabet, tapeAlphabet, startState, acceptState, rejectState, transitions, doRender]);

  const askAI = useCallback(async () => {
    if (!aiQuestion) return;
    setAiLoading(true);
    try {
      const result = await AutomataAI.generateFromQuestion(aiQuestion, 'TM');
      const newStates = result.data.states.join(', ');
      const newInputAlphabet = result.data.inputAlphabet.join(', ');
      const newTapeAlphabet = result.data.tapeAlphabet.join(', ');
      const newStart = result.data.startState;
      const newAccept = result.data.acceptState;
      const newReject = result.data.rejectState;
      const newTrans = result.data.transitions.map((t: any) => `${t.from},${t.read},${t.to},${t.write},${t.direction}`).join('\n');
      setStates(newStates);
      setInputAlphabet(newInputAlphabet);
      setTapeAlphabet(newTapeAlphabet);
      setStartState(newStart);
      setAcceptState(newAccept);
      setRejectState(newReject);
      setTransitions(newTrans);
      if (result.explanation) showMessage(result.explanation, 'info');
      const input = { states: newStates, inputAlphabet: newInputAlphabet, tapeAlphabet: newTapeAlphabet, startState: newStart, acceptState: newAccept, rejectState: newReject, transitions: newTrans };
      const validation = AutomataCore.validateTM(input);
      if (validation.valid) doRender(validation.data);
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setAiLoading(false);
    }
  }, [aiQuestion, doRender, showMessage]);

  const clearAll = useCallback(() => {
    setStates(''); setInputAlphabet(''); setTapeAlphabet('');
    setStartState(''); setAcceptState(''); setRejectState(''); setTransitions('');
    setMessages([]); setGenerated(false);
    visualizerRef.current?.destroy();
    visualizerRef.current = null;
  }, []);

  const exportPNG = useCallback(() => {
    if (!visualizerRef.current?.cy) { showMessage('Generate a TM first!', 'error'); return; }
    const png = visualizerRef.current.exportPNG();
    if (png) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = 'turing-machine-graph.png';
      link.click();
    }
  }, [showMessage]);

  const resetView = useCallback(() => {
    visualizerRef.current?.resetView();
  }, []);

  const loadExample = useCallback((name: string) => {
    const examples: Record<string, any> = {
      '0n1n': {
        states: 'q0, q1, q2, q3, q4, qa, qr',
        inputAlphabet: '0, 1',
        tapeAlphabet: '0, 1, X, Y, B',
        start: 'q0',
        accept: 'qa',
        reject: 'qr',
        transitions: 'q0,0,q1,X,R\nq1,0,q1,0,R\nq1,Y,q1,Y,R\nq1,1,q2,Y,L\nq2,0,q2,0,L\nq2,Y,q2,Y,L\nq2,X,q0,X,R\nq0,Y,q3,Y,R\nq3,Y,q3,Y,R\nq3,B,qa,B,S'
      },
      increment: {
        states: 'q0, q1, q2, qa, qr',
        inputAlphabet: '0, 1',
        tapeAlphabet: '0, 1, B',
        start: 'q0',
        accept: 'qa',
        reject: 'qr',
        transitions: 'q0,0,q0,0,R\nq0,1,q0,1,R\nq0,B,q1,B,L\nq1,0,q2,1,S\nq1,1,q1,0,L\nq1,B,qa,1,S'
      },
      palindrome: {
        states: 'q0, q1, q2, q3, q4, qa, qr',
        inputAlphabet: 'a, b',
        tapeAlphabet: 'a, b, X, Y, B',
        start: 'q0',
        accept: 'qa',
        reject: 'qr',
        transitions: 'q0,a,q1,X,R\nq0,b,q2,Y,R\nq0,B,qa,B,S\nq1,a,q1,a,R\nq1,b,q1,b,R\nq1,B,q3,B,L\nq2,a,q2,a,R\nq2,b,q2,b,R\nq2,B,q4,B,L\nq3,a,q3,a,L\nq3,b,q3,b,L\nq3,X,q0,X,R\nq4,a,q4,a,L\nq4,b,q4,b,L\nq4,Y,q0,Y,R'
      },
    };
    const ex = examples[name];
    if (ex) {
      setStates(ex.states); setInputAlphabet(ex.inputAlphabet); setTapeAlphabet(ex.tapeAlphabet);
      setStartState(ex.start); setAcceptState(ex.accept); setRejectState(ex.reject);
      setTransitions(ex.transitions);
      const input = { states: ex.states, inputAlphabet: ex.inputAlphabet, tapeAlphabet: ex.tapeAlphabet, startState: ex.start, acceptState: ex.accept, rejectState: ex.reject, transitions: ex.transitions };
      const validation = AutomataCore.validateTM(input);
      if (validation.valid) doRender(validation.data);
    }
  }, [doRender]);

  useEffect(() => {
    return () => { visualizerRef.current?.destroy(); };
  }, []);

  return (
    <>
      <WorkspaceNavbar title="Turing Machine" subtitle="Universal Computational Model" />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Turing Machine</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">Design and visualize Turing Machines — the universal model of computation</p>
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
                  <input type="text" className="input-field w-full pl-4 pr-12 py-3 rounded-xl text-sm" placeholder="e.g. 'TM for 0^n 1^n'" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} />
                  <button onClick={askAI} className="absolute right-2 top-1 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-500 transition">
                    <i className="fas fa-paper-plane text-white text-xs" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="text-[10px] text-purple-300 hover:text-white transition" onClick={() => setAiQuestion('0^n 1^n TM')}>&quot;0ⁿ 1ⁿ&quot;</button>
                  <button className="text-[10px] text-purple-300 hover:text-white transition" onClick={() => setAiQuestion('Binary increment TM')}>&quot;Binary increment&quot;</button>
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
                  <i className="fas fa-cog text-purple-400 mr-3" /> Turing Machine Configuration
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">States <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q0, q1, qa, qr" value={states} onChange={e => setStates(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Input Alphabet <span className="text-xs text-gray-500">(comma separated)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="0, 1" value={inputAlphabet} onChange={e => setInputAlphabet(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Tape Alphabet <span className="text-xs text-gray-500">(comma separated, B = blank)</span></label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="0, 1, X, Y, B" value={tapeAlphabet} onChange={e => setTapeAlphabet(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Start State</label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q0" value={startState} onChange={e => setStartState(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Accept State</label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="qa" value={acceptState} onChange={e => setAcceptState(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Reject State</label>
                    <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="qr" value={rejectState} onChange={e => setRejectState(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2 text-sm">Transitions <span className="text-xs text-gray-500">(one per line: from,read,to,write,direction)</span></label>
                    <textarea className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm resize-none" rows={6} placeholder="q0,0,q1,X,R&#10;q1,0,q1,0,R&#10;q1,1,q2,Y,L&#10;q2,0,q2,0,L&#10;q2,X,q0,X,R&#10;q0,Y,q3,Y,R&#10;q3,B,qa,B,S" value={transitions} onChange={e => setTransitions(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-primary flex-1 px-6 py-3 text-white font-semibold rounded-lg" onClick={generateTM}>
                      <i className="fas fa-play mr-2" />Generate TM
                    </button>
                    <button className="px-6 py-3 bg-white/5 text-white font-semibold rounded-lg hover:bg-white/10 transition border border-white/10" onClick={clearAll}>
                      <i className="fas fa-trash mr-2" />Clear
                    </button>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-gray-400 text-sm mb-3">Quick Examples:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('0n1n')}>0ⁿ 1ⁿ</button>
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('increment')}>Binary Increment</button>
                      <button className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition text-xs" onClick={() => loadExample('palindrome')}>Palindrome</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fas fa-eye text-pink-400 mr-3" /> Visualization
              </h2>
              <div className="bg-white/5 rounded-xl border border-white/10 relative h-[400px]" id="tm-graph-container" ref={containerRef}>
                {!generated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-microchip text-purple-400 text-3xl" />
                      </div>
                      <p className="text-gray-400 mb-2">Your Turing Machine will appear here</p>
                      <p className="text-gray-500 text-sm">Configure and click &quot;Generate TM&quot;</p>
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
                  <i className="fas fa-info-circle mr-1" />Green = start, Pink = accept, Red = reject
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
