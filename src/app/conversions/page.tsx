'use client';
import { useState, useCallback } from 'react';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';
import { AutomataCore } from '@/lib/automata-core';

type ConversionMode = 'nfa-to-dfa' | 're-to-nfa' | 'cfg-to-cnf';

export default function ConversionsPage() {
  const [mode, setMode] = useState<ConversionMode>('nfa-to-dfa');
  const [steps, setSteps] = useState<string[]>([]);
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const showMessage = useCallback((text: string, type: string) => {
    setMessages(prev => [...prev, { text, type }]);
    setTimeout(() => setMessages(prev => prev.slice(1)), 4000);
  }, []);

  const [nfaInput, setNfaInput] = useState({ states: '', alphabet: '', startState: '', acceptStates: '', transitions: '' });
  const [reInput, setReInput] = useState('');
  const [cfgInput, setCfgInput] = useState({ variables: '', terminals: '', startSymbol: '', productions: '' });

  const modes: Array<{ id: ConversionMode; label: string; icon: string }> = [
    { id: 'nfa-to-dfa', label: 'NFA → DFA', icon: 'fa-arrow-right-arrow-left' },
    { id: 're-to-nfa', label: 'RE → NFA', icon: 'fa-code' },
    { id: 'cfg-to-cnf', label: 'CFG → CNF', icon: 'fa-sitemap' },
  ];

  const runConversion = useCallback(async () => {
    setLoading(true);
    setSteps([]);
    setResult(null);
    try {
      if (mode === 'nfa-to-dfa') {
        const parsed = {
          states: AutomataCore.parseCommaSeparated(nfaInput.states),
          alphabet: AutomataCore.parseCommaSeparated(nfaInput.alphabet),
          startState: nfaInput.startState.trim(),
          acceptStates: AutomataCore.parseCommaSeparated(nfaInput.acceptStates),
          transitions: AutomataCore.parseTransitions(nfaInput.transitions),
        };
        if (parsed.states.length === 0) throw new Error('States are required');
        if (parsed.alphabet.length === 0) throw new Error('Alphabet is required');

        setSteps(prev => [...prev, 'Validating NFA...']);
        await new Promise(r => setTimeout(r, 300));
        setSteps(prev => [...prev, `NFA has ${parsed.states.length} states and alphabet {${parsed.alphabet.join(', ')}}`]);
        await new Promise(r => setTimeout(r, 300));

        const nfaTransitions = parsed.transitions;
        const nfaStates = parsed.states;
        const startState = parsed.startState;
        const acceptStates = parsed.acceptStates;

        const epsilonClosure = (stateSet: Set<string>) => {
          const closure = new Set(stateSet);
          let queue = Array.from(stateSet);
          while (queue.length > 0) {
            const s = queue.shift()!;
            for (const t of nfaTransitions) {
              if (t.from === s && t.symbol === 'ε' && !closure.has(t.to)) {
                closure.add(t.to);
                queue.push(t.to);
              }
            }
          }
          return closure;
        };

        setSteps(prev => [...prev, 'Computing ε-closures...']);
        await new Promise(r => setTimeout(r, 300));

        const dfaStates: string[] = [];
        const dfaTransitions: Array<{ from: string; symbol: string; to: string }> = [];
        const dfaAcceptStates: string[] = [];
        const stateMap = new Map<string, string>();
        const startClosure = epsilonClosure(new Set([startState]));
        const startLabel = `{${Array.from(startClosure).sort().join(',')}}`;
        stateMap.set(Array.from(startClosure).sort().join(','), startLabel);
        dfaStates.push(startLabel);

        const queue: string[][] = [Array.from(startClosure).sort()];
        while (queue.length > 0) {
          const current = queue.shift()!;
          const currentLabel = stateMap.get(current.join(','))!;

          for (const sym of parsed.alphabet) {
            const next = new Set<string>();
            for (const s of current) {
              for (const t of nfaTransitions) {
                if (t.from === s && t.symbol === sym) {
                  next.add(t.to);
                }
              }
            }
            const nextClosure = epsilonClosure(next);
            if (nextClosure.size === 0) continue;
            const sorted = Array.from(nextClosure).sort();
            const key = sorted.join(',');
            if (!stateMap.has(key)) {
              const label = `{${sorted.join(',')}}`;
              stateMap.set(key, label);
              dfaStates.push(label);
              queue.push(sorted);
            }
            dfaTransitions.push({ from: currentLabel, symbol: sym, to: stateMap.get(key)! });
          }
        }

        for (const [key, label] of stateMap) {
          const statesInSet = key.split(',');
          if (statesInSet.some(s => acceptStates.includes(s))) {
            dfaAcceptStates.push(label);
          }
        }

        setSteps(prev => [
          ...prev,
          `Computed ε-closure of start state: ${startLabel}`,
          `Generated ${dfaStates.length} DFA states from ${nfaStates.length} NFA states`,
          `Created ${dfaTransitions.length} DFA transitions`,
          `DFA accept states: ${dfaAcceptStates.join(', ') || 'none'}`,
          'Conversion complete!',
        ]);
        setResult(JSON.stringify({
          states: dfaStates.join(', '),
          alphabet: parsed.alphabet.join(', '),
          startState: startLabel,
          acceptStates: dfaAcceptStates.join(', '),
          transitions: dfaTransitions.map(t => `${t.from},${t.symbol},${t.to}`).join('\n'),
        }, null, 2));
      }

      if (mode === 're-to-nfa') {
        if (!reInput.trim()) throw new Error('Regular expression is required');
        setSteps(prev => [...prev, `Parsing: ${reInput}`]);
        await new Promise(r => setTimeout(r, 300));

        const re = reInput.trim();
        let counter = 1;

        interface NFAFragment {
          start: string;
          accept: string;
          states: Set<string>;
          alphabet: Set<string>;
          transitions: Array<{ from: string; symbol: string; to: string }>;
        }

        const createFragment = (start: string, accept: string): NFAFragment => ({
          start, accept,
          states: new Set([start, accept]),
          alphabet: new Set<string>(),
          transitions: [],
        });

        const buildNFA = (expr: string, i: number): [NFAFragment, number] => {
          let frag = createFragment(`q${counter++}`, `q${counter++}`);

          while (i < expr.length) {
            const c = expr[i];
            if (c === '(') {
              const [inner, nextI] = buildNFA(expr, i + 1);
              i = nextI;
              const outer = createFragment(`q${counter++}`, `q${counter++}`);
              outer.transitions.push({ from: outer.start, symbol: 'ε', to: inner.start });
              outer.transitions.push({ from: inner.accept, symbol: 'ε', to: outer.accept });
              for (const s of inner.states) outer.states.add(s);
              for (const t of inner.transitions) outer.transitions.push(t);
              for (const a of inner.alphabet) outer.alphabet.add(a);
              frag = outer;
            } else if (c === ')') {
              return [frag, i + 1];
            } else if (c === '|') {
              const [right, nextI] = buildNFA(expr, i + 1);
              i = nextI;
              const outer2 = createFragment(`q${counter++}`, `q${counter++}`);
              outer2.transitions.push({ from: outer2.start, symbol: 'ε', to: frag.start });
              outer2.transitions.push({ from: outer2.start, symbol: 'ε', to: right.start });
              outer2.transitions.push({ from: frag.accept, symbol: 'ε', to: outer2.accept });
              outer2.transitions.push({ from: right.accept, symbol: 'ε', to: outer2.accept });
              for (const s of frag.states) outer2.states.add(s);
              for (const s of right.states) outer2.states.add(s);
              for (const t of frag.transitions) outer2.transitions.push(t);
              for (const t of right.transitions) outer2.transitions.push(t);
              for (const a of frag.alphabet) outer2.alphabet.add(a);
              for (const a of right.alphabet) outer2.alphabet.add(a);
              frag = outer2;
            } else if (c === '*') {
              const outer3 = createFragment(`q${counter++}`, `q${counter++}`);
              outer3.transitions.push({ from: outer3.start, symbol: 'ε', to: frag.start });
              outer3.transitions.push({ from: outer3.start, symbol: 'ε', to: outer3.accept });
              outer3.transitions.push({ from: frag.accept, symbol: 'ε', to: frag.start });
              outer3.transitions.push({ from: frag.accept, symbol: 'ε', to: outer3.accept });
              for (const s of frag.states) outer3.states.add(s);
              for (const t of frag.transitions) outer3.transitions.push(t);
              for (const a of frag.alphabet) outer3.alphabet.add(a);
              frag = outer3;
              i++;
            } else if (c === '+') {
              const outer4 = createFragment(`q${counter++}`, `q${counter++}`);
              outer4.transitions.push({ from: outer4.start, symbol: 'ε', to: frag.start });
              const [starFrag, _] = buildNFA('(' + re.substring(0, re.indexOf('+', i) > 0 ? re.indexOf('+', i) : re.length) + ')*', 0);
              const outer4a = createFragment(`q${counter++}`, `q${counter++}`);
              outer4a.transitions.push({ from: outer4a.start, symbol: 'ε', to: frag.start });
              outer4a.transitions.push({ from: outer4a.start, symbol: 'ε', to: starFrag.start });
              outer4a.transitions.push({ from: frag.accept, symbol: 'ε', to: outer4a.accept });
              outer4a.transitions.push({ from: starFrag.accept, symbol: 'ε', to: outer4a.accept });
              for (const s of frag.states) outer4a.states.add(s);
              for (const s of starFrag.states) outer4a.states.add(s);
              for (const t of frag.transitions) outer4a.transitions.push(t);
              for (const t of starFrag.transitions) outer4a.transitions.push(t);
              for (const a of frag.alphabet) outer4a.alphabet.add(a);
              for (const a of starFrag.alphabet) outer4a.alphabet.add(a);
              frag = outer4a;
              i++;
            } else {
              const symbolFrag = createFragment(`q${counter++}`, `q${counter++}`);
              symbolFrag.transitions.push({ from: symbolFrag.start, symbol: c, to: symbolFrag.accept });
              symbolFrag.alphabet.add(c);

              const concat = createFragment(`q${counter++}`, `q${counter++}`);
              concat.transitions.push({ from: concat.start, symbol: 'ε', to: frag.start });
              concat.transitions.push({ from: frag.accept, symbol: 'ε', to: symbolFrag.start });
              concat.transitions.push({ from: symbolFrag.accept, symbol: 'ε', to: concat.accept });
              for (const s of frag.states) concat.states.add(s);
              for (const s of symbolFrag.states) concat.states.add(s);
              for (const t of frag.transitions) concat.transitions.push(t);
              for (const t of symbolFrag.transitions) concat.transitions.push(t);
              for (const a of frag.alphabet) concat.alphabet.add(a);
              for (const a of symbolFrag.alphabet) concat.alphabet.add(a);
              frag = concat;
              i++;
            }
          }
          return [frag, i];
        };

        const [nfa, _] = buildNFA(re, 0);
        setSteps(prev => [...prev, `Parsed expression: ${re}`]);
        await new Promise(r => setTimeout(r, 300));
        setSteps(prev => [...prev, `Constructed NFA with ${nfa.states.size} states and ${nfa.transitions.length} transitions`]);
        await new Promise(r => setTimeout(r, 300));
        setSteps(prev => [...prev, `NFA alphabet: {${Array.from(nfa.alphabet).join(', ')}}`]);
        await new Promise(r => setTimeout(r, 300));
        setSteps(prev => [...prev, `Start state: ${nfa.start}`]);
        setSteps(prev => [...prev, `Accept state: ${nfa.accept}`]);
        setSteps(prev => [...prev, 'Conversion complete!']);

        const alphabet = Array.from(nfa.alphabet).filter(a => a !== 'ε');
        setResult(JSON.stringify({
          states: Array.from(nfa.states).join(', '),
          alphabet: alphabet.join(', '),
          startState: nfa.start,
          acceptStates: nfa.accept,
          transitions: nfa.transitions
            .filter(t => alphabet.includes(t.symbol) || t.symbol === 'ε')
            .map(t => `${t.from},${t.symbol},${t.to}`)
            .join('\n'),
        }, null, 2));
      }

      if (mode === 'cfg-to-cnf') {
        const parsed = {
          variables: AutomataCore.parseCommaSeparated(cfgInput.variables),
          terminals: AutomataCore.parseCommaSeparated(cfgInput.terminals),
          startSymbol: cfgInput.startSymbol.trim(),
          productions: AutomataCore.parseProductions(cfgInput.productions),
        };
        if (parsed.variables.length === 0) throw new Error('Variables are required');
        if (parsed.productions.length === 0) throw new Error('Productions are required');

        setSteps(prev => [...prev, `Original CFG has ${parsed.variables.length} variables and ${parsed.productions.length} productions`]);
        await new Promise(r => setTimeout(r, 300));

        let productions = [...parsed.productions];
        const start = parsed.startSymbol || parsed.variables[0];

        const nullable = new Set<string>();
        let changed = true;
        while (changed) {
          changed = false;
          for (const p of productions) {
            if (nullable.has(p.variable)) continue;
            if (p.production === 'ε' || p.production.split('').every(c => c === ' ' || nullable.has(c))) {
              nullable.add(p.variable);
              changed = true;
            }
          }
        }
        setSteps(prev => [...prev, `Step 1: Found nullable variables: {${Array.from(nullable).join(', ') || 'none'}}`]);
        await new Promise(r => setTimeout(r, 300));

        const newProductions: Array<{ variable: string; production: string }> = [];
        for (const p of productions) {
          if (p.production === 'ε') continue;
          const symbols = p.production.split('').filter(c => c !== ' ');
          const results: string[] = [p.production];
          for (const n of nullable) {
            const idx = symbols.indexOf(n);
            if (idx >= 0) {
              const without = symbols.filter((_, i) => i !== idx).join('');
              if (without.length > 0 && !results.includes(without)) results.push(without);
            }
          }
          for (const r of results) {
            newProductions.push({ variable: p.variable, production: r });
          }
        }
        productions = newProductions;
        setSteps(prev => [...prev, `Step 2: Eliminated ε-productions (${productions.length} productions remaining)`]);
        await new Promise(r => setTimeout(r, 300));

        const unitPairs = new Map<string, Set<string>>();
        for (const v of parsed.variables) {
          unitPairs.set(v, new Set([v]));
        }
        changed = true;
        while (changed) {
          changed = false;
          for (const p of productions) {
            if (parsed.variables.includes(p.production) && p.production.length === 1) {
              const from = p.variable;
              const to = p.production;
              const toSet = unitPairs.get(to)!;
              const fromSet = unitPairs.get(from)!;
              for (const t of toSet) {
                if (!fromSet.has(t)) {
                  fromSet.add(t);
                  changed = true;
                }
              }
            }
          }
        }
        setSteps(prev => [...prev, `Step 3: Computed unit pair closures`]);
        await new Promise(r => setTimeout(r, 300));

        const noUnit: Array<{ variable: string; production: string }> = [];
        for (const [v, set] of unitPairs) {
          const nonUnit = productions.filter(p => set.has(p.variable) && !(parsed.variables.includes(p.production) && p.production.length === 1));
          for (const p of nonUnit) {
            if (!noUnit.some(n => n.variable === v && n.production === p.production)) {
              noUnit.push({ variable: v, production: p.production });
            }
          }
        }
        productions = noUnit.filter(p => p.variable !== p.production);
        setSteps(prev => [...prev, `Step 4: Eliminated unit productions (${productions.length} productions remaining)`]);
        await new Promise(r => setTimeout(r, 300));

        const termMap = new Map<string, string>();
        let termCounter = 0;
        const cnfProductions: Array<{ variable: string; production: string }> = [];
        for (const p of productions) {
          const symbols = p.production.split('').filter(c => c !== ' ');
          if (symbols.length === 1 && parsed.terminals.includes(symbols[0])) {
            cnfProductions.push(p);
          } else if (symbols.length >= 2) {
            const newSymbols: string[] = [];
            for (const s of symbols) {
              if (parsed.terminals.includes(s)) {
                if (!termMap.has(s)) {
                  const newVar = `X${termCounter++}`;
                  termMap.set(s, newVar);
                  cnfProductions.push({ variable: newVar, production: s });
                }
                newSymbols.push(termMap.get(s)!);
              } else {
                newSymbols.push(s);
              }
            }
            while (newSymbols.length > 2) {
              const newVar = `Y${termCounter++}`;
              const lastTwo = newSymbols.splice(newSymbols.length - 2, 2);
              cnfProductions.push({ variable: newVar, production: lastTwo.join('') });
              newSymbols.push(newVar);
            }
            if (newSymbols.length === 2) {
              cnfProductions.push({ variable: p.variable, production: newSymbols.join('') });
            }
          } else {
            cnfProductions.push(p);
          }
        }

        const allVariables = [...parsed.variables];
        termMap.forEach((v, _) => {
          if (!allVariables.includes(v)) allVariables.push(v);
        });

        setSteps(prev => [...prev, `Step 5: Converted to CNF — ${cnfProductions.length} productions with ${allVariables.length} variables`]);
        await new Promise(r => setTimeout(r, 300));
        setSteps(prev => [...prev, 'Conversion complete!']);

        const varList = [...parsed.variables];
        termMap.forEach((v, k) => {
          if (!varList.includes(v)) varList.push(v);
        });
        setResult(JSON.stringify({
          variables: allVariables.join(', '),
          terminals: parsed.terminals.join(', '),
          startSymbol: start,
          productions: cnfProductions.map(p => `${p.variable}->${p.production}`).join('\n'),
        }, null, 2));
      }
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [mode, nfaInput, reInput, cfgInput, showMessage]);

  return (
    <>
      <WorkspaceNavbar title="Conversion Engine" subtitle="Step-by-Step Transformations" />
      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Conversion Engine</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">
              Step-by-step transformations between automata representations
            </p>
          </div>

          <div className="glass-card rounded-2xl p-2 mb-6 fade-in-up">
            <div className="flex flex-wrap">
              {modes.map(m => (
                <button key={m.id}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition flex items-center justify-center gap-2 ${mode === m.id ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => { setMode(m.id); setSteps([]); setResult(null); setMessages([]); }}>
                  <i className={`fas ${m.icon}`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <i className="fas fa-cog text-purple-400 mr-3" /> Input
                </h2>

                {mode === 'nfa-to-dfa' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">NFA States <span className="text-xs text-gray-500">(comma separated)</span></label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q0, q1, q2" value={nfaInput.states} onChange={e => setNfaInput(p => ({ ...p, states: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Alphabet <span className="text-xs text-gray-500">(comma separated)</span></label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="0, 1" value={nfaInput.alphabet} onChange={e => setNfaInput(p => ({ ...p, alphabet: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Start State</label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q0" value={nfaInput.startState} onChange={e => setNfaInput(p => ({ ...p, startState: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Accept States <span className="text-xs text-gray-500">(comma separated)</span></label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="q2" value={nfaInput.acceptStates} onChange={e => setNfaInput(p => ({ ...p, acceptStates: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Transitions <span className="text-xs text-gray-500">(one per line: from,symbol,to, ε for epsilon)</span></label>
                      <textarea className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm resize-none" rows={4} placeholder="q0,0,q0&#10;q0,1,q0&#10;q0,0,q1&#10;q1,1,q2" value={nfaInput.transitions} onChange={e => setNfaInput(p => ({ ...p, transitions: e.target.value }))} />
                    </div>
                  </div>
                )}

                {mode === 're-to-nfa' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Regular Expression</label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="(0|1)*01" value={reInput} onChange={e => setReInput(e.target.value)} />
                      <p className="text-gray-500 text-xs mt-1">Operators: | (union), * (Kleene star), + (one or more), concatenation by adjacency</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-gray-400 text-sm mb-2">Examples:</p>
                      <div className="flex flex-wrap gap-2">
                        {['(0|1)*', '0*1*', '(a|b)*abb', '0(0|1)*1', '(0|1)+'].map(ex => (
                          <button key={ex} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30 transition" onClick={() => setReInput(ex)}>{ex}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {mode === 'cfg-to-cnf' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Variables <span className="text-xs text-gray-500">(comma separated)</span></label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="S, A, B" value={cfgInput.variables} onChange={e => setCfgInput(p => ({ ...p, variables: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Terminals <span className="text-xs text-gray-500">(comma separated)</span></label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="a, b" value={cfgInput.terminals} onChange={e => setCfgInput(p => ({ ...p, terminals: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Start Symbol</label>
                      <input type="text" className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm" placeholder="S" value={cfgInput.startSymbol} onChange={e => setCfgInput(p => ({ ...p, startSymbol: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-medium mb-2 text-sm">Productions <span className="text-xs text-gray-500">(one per line: A-&gt;aB)</span></label>
                      <textarea className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm resize-none" rows={4} placeholder="S-&gt;AB&#10;S-&gt;a&#10;A-&gt;aA&#10;A-&gt;a&#10;B-&gt;bB&#10;B-&gt;b" value={cfgInput.productions} onChange={e => setCfgInput(p => ({ ...p, productions: e.target.value }))} />
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-gray-400 text-sm mb-2">Examples:</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Simple Palindromes', v: 'S', t: 'a,b', s: 'S', p: 'S->aSa\nS->bSb\nS->a\nS->b\nS->ε' },
                          { label: 'Arithmetic', v: 'E,T,F', t: '+,*,(,),id', s: 'E', p: 'E->E+T\nE->T\nT->T*F\nT->F\nF->(E)\nF->id' },
                        ].map(ex => (
                          <button key={ex.label} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30 transition"
                            onClick={() => setCfgInput({ variables: ex.v, terminals: ex.t, startSymbol: ex.s, productions: ex.p })}>
                            {ex.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button className="btn-primary w-full px-6 py-3 text-white font-semibold rounded-lg" onClick={runConversion} disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Converting...</> : <><i className="fas fa-play mr-2" />Run Conversion</>}
                </button>
              </div>

              {steps.length > 0 && (
                <div className="glass-card rounded-2xl p-6 fade-in-up">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <i className="fas fa-list text-purple-400 mr-3" /> Steps
                  </h2>
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">{i + 1}</span>
                        <p className="text-gray-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-2xl p-6 fade-in-up">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-code text-pink-400 mr-3" /> Result
                </h2>
                {result ? (
                  <pre className="bg-black/40 rounded-xl p-4 font-mono text-purple-300 text-xs overflow-x-auto max-h-[500px] whitespace-pre-wrap">{result}</pre>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-arrow-right-arrow-left text-purple-400 text-2xl" />
                    </div>
                    <p className="text-gray-400 mb-2">Enter input and run the conversion</p>
                    <p className="text-gray-500 text-sm">Step-by-step progress will appear here</p>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-6 fade-in-up">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-book text-purple-400 mr-3" /> About This Conversion
                </h2>
                {mode === 'nfa-to-dfa' && (
                  <div className="text-gray-300 leading-relaxed text-sm">
                    <p className="mb-2">Subset construction converts an NFA (with ε-transitions) into an equivalent DFA.</p>
                    <p className="mb-2">Each DFA state represents a set of NFA states reachable on the same input. The ε-closure of each set is computed to handle ε-transitions.</p>
                    <p className="text-purple-400 font-semibold">Key insight: A DFA may have up to 2ⁿ states for an n-state NFA.</p>
                  </div>
                )}
                {mode === 're-to-nfa' && (
                  <div className="text-gray-300 leading-relaxed text-sm">
                    <p className="mb-2">Thompson&apos;s construction builds an NFA directly from a regular expression using structural induction.</p>
                    <p className="mb-2">Each subexpression is converted into an NFA fragment that is recursively composed using ε-transitions.</p>
                    <p className="text-purple-400 font-semibold">Key insight: The resulting NFA has at most 2n states for an n-symbol RE.</p>
                  </div>
                )}
                {mode === 'cfg-to-cnf' && (
                  <div className="text-gray-300 leading-relaxed text-sm">
                    <p className="mb-2">Converting a CFG to Chomsky Normal Form involves 5 steps: eliminate ε-productions, eliminate unit productions, eliminate useless symbols, introduce new variables for terminals, and break long productions into binary chains.</p>
                    <p className="text-purple-400 font-semibold">Key insight: CNF enables O(n³) parsing via the CYK algorithm.</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {messages.map((msg, i) => (
                  <div key={i} className={`glass-card p-3 border-l-4 text-sm ${msg.type === 'error' ? 'border-red-500' : msg.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}>
                    <div className="flex items-start">
                      <i className={`fas ${msg.type === 'error' ? 'fa-exclamation-circle text-red-400' : msg.type === 'warning' ? 'fa-exclamation-triangle text-yellow-400' : 'fa-info-circle text-blue-400'} mr-2 mt-0.5`} />
                      <p className="text-gray-300">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
