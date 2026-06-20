'use client';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';

export default function EpsilonNFAWorkspace() {
  return (
    <>
      <WorkspaceNavbar title="ε-NFA Workspace" subtitle="Epsilon Non-deterministic Finite Automaton" />
      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Epsilon Non-deterministic Finite Automaton</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">Understanding ε-NFAs and their role in automata theory</p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-question-circle text-purple-400 mr-3" />What is an ε-NFA?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              An <span className="text-purple-300 font-semibold">ε-NFA</span> (Epsilon Non-deterministic Finite Automaton) is an extension of the standard NFA that allows 
              transitions on the <span className="font-mono text-purple-300">ε</span> (epsilon) symbol — the empty string. This means the automaton can change 
              states without consuming any input symbol.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Formally, an ε-NFA is a 5-tuple <span className="font-mono text-purple-300">(Q, Σ, δ, q₀, F)</span> where the transition function 
               <span className="font-mono text-purple-300">{'δ: Q \u00D7 (\u03A3 \u222A {\u03B5}) \u2192 P(Q)'}</span> maps a state and either an input symbol or {'\u03B5'} to a 
              <span className="text-purple-300"> set</span> of possible next states.
            </p>
            <p className="text-gray-300 leading-relaxed">
              ε-NFAs are particularly useful because they make it easier to model certain language constructs, such as optional 
              elements or repeated patterns. They serve as an intermediate step in algorithms like converting regular expressions 
              to NFAs (Thompson's construction).
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-circle-nodes text-purple-400 mr-3" />Epsilon Closure
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The <span className="text-purple-300 font-semibold">ε-closure</span> of a state is the set of all states reachable from that state 
              by following zero or more ε-transitions. This concept is fundamental to understanding how ε-NFAs compute.
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <p className="text-purple-300 font-mono text-sm mb-2">Algorithm: ε-closure(state)</p>
              <ul className="space-y-1 text-gray-400 text-sm font-mono">
                <li className="flex items-start"><span className="text-purple-400 mr-2">1.</span> Add the state itself to the closure set</li>
                <li className="flex items-start"><span className="text-purple-400 mr-2">2.</span> For each state in the closure, follow its ε-transitions</li>
                <li className="flex items-start"><span className="text-purple-400 mr-2">3.</span> Add any newly found states to the closure</li>
                <li className="flex items-start"><span className="text-purple-400 mr-2">4.</span> Repeat until no new states can be added</li>
              </ul>
            </div>
            <p className="text-gray-300 leading-relaxed">
              When processing an input string, the ε-NFA first computes the ε-closure of the start state, then for each input 
              symbol, computes the set of reachable states through that symbol, followed by ε-closure again.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-3">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-exchange-alt text-purple-400 mr-3" />Converting ε-NFA to NFA
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Every ε-NFA can be converted to an equivalent NFA (without ε-transitions) that recognizes the same language. 
              The conversion process eliminates ε-transitions by computing ε-closures and incorporating them into the transition function.
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <p className="text-purple-300 font-mono text-sm mb-2">Conversion Steps:</p>
              <ol className="space-y-2 text-gray-400 text-sm">
                <li><span className="text-purple-400 font-medium">1.</span> Compute ε-closure for each state</li>
                <li><span className="text-purple-400 font-medium">2.</span> Define new transition function: <span className="font-mono text-purple-300">δ'(q, a) = ε-closure(δ(q, a))</span></li>
                <li><span className="text-purple-400 font-medium">3.</span> Include any state whose ε-closure contains an accept state as an accept state</li>
                <li><span className="text-purple-400 font-medium">4.</span> Remove all ε-transitions from the transition function</li>
              </ol>
            </div>
            <p className="text-gray-300 leading-relaxed">
              The resulting NFA has the same number of states but no ε-transitions. This NFA can then be further converted 
              to a DFA using the standard subset construction algorithm if needed.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-list text-purple-400 mr-3" />Examples
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Example 1: Optional Zero</h3>
                <p className="text-gray-300 text-sm mb-2">Language: Strings that may optionally start with 0, followed by one or more 1s</p>
                <p className="font-mono text-purple-300 text-sm">States: q0, q1, q2</p>
                <p className="font-mono text-purple-300 text-sm">Transitions: q0 →ε→ q1 | q0 →0→ q1 | q1 →1→ q2 | q2 →1→ q2</p>
                <p className="text-gray-400 text-xs mt-2">Accept state: q2 | Start state: q0</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Example 2: a* b*</h3>
                <p className="text-gray-300 text-sm mb-2">Language: Zero or more as followed by zero or more bs</p>
                <p className="font-mono text-purple-300 text-sm">States: q0, q1, q2</p>
                <p className="font-mono text-purple-300 text-sm">Transitions: q0 →a→ q0 | q0 →ε→ q1 | q1 →b→ q1 | q1 →ε→ q2</p>
                <p className="text-gray-400 text-xs mt-2">Accept state: q2 | Start state: q0</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Example 3: Union of Languages</h3>
                <p className="text-gray-300 text-sm mb-2">Language: Strings that are either &quot;00&quot; or &quot;11&quot;</p>
                <p className="font-mono text-purple-300 text-sm">States: q0, q1, q2, q3, q4</p>
                <p className="font-mono text-purple-300 text-sm">Transitions: q0 →ε→ q1 | q0 →ε→ q3 | q1 →0→ q2 | q2 →0→ q4 | q3 →1→ q4</p>
                <p className="text-gray-400 text-xs mt-2">Accept state: q4 | Start state: q0</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-5">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-lightbulb text-purple-400 mr-3" />Key Insights
            </h2>
            <ul className="space-y-3 text-gray-300 leading-relaxed">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-400 mr-3 mt-1" />
                <span>ε-transitions <span className="text-purple-300">do not consume input</span> — they allow the automaton to change states spontaneously.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-400 mr-3 mt-1" />
                <span>The <span className="text-purple-300">expressive power</span> of ε-NFAs, NFAs, and DFAs is identical — they all recognize regular languages.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-400 mr-3 mt-1" />
                <span>ε-NFAs are primarily a <span className="text-purple-300">design convenience</span> — they make it easier to construct automata from regular expressions.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-400 mr-3 mt-1" />
                <span>Thompson's construction uses ε-NFAs to <span className="text-purple-300">compositionally build</span> automata for complex regular expressions.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-green-400 mr-3 mt-1" />
                <span>The subset construction (powerset construction) can convert any ε-NFA to an <span className="text-purple-300">equivalent DFA</span>.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
