'use client';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';

export default function RegularLanguagesWorkspace() {
  return (
    <>
      <WorkspaceNavbar title="Regular Languages" subtitle="Foundation of Finite Automata" />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Regular Languages</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">The foundation of finite automata and formal language theory</p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-question-circle text-purple-400 mr-3" />Definition
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              A <span className="text-purple-300 font-semibold">regular language</span> is a formal language that can be recognized by a 
              finite automaton. These are the simplest class of languages in the Chomsky hierarchy, corresponding to 
              <span className="text-purple-300"> Type-3 grammars</span>.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Formally, a language <span className="font-mono text-purple-300">L</span> over an alphabet 
              <span className="font-mono text-purple-300"> Σ</span> is regular if there exists:
            </p>
            <ul className="space-y-2 text-gray-300 leading-relaxed ml-6 list-disc">
              <li>A <span className="text-purple-300">Deterministic Finite Automaton (DFA)</span> that accepts exactly L</li>
              <li>A <span className="text-purple-300">Non-deterministic Finite Automaton (NFA)</span> that accepts exactly L</li>
              <li>A <span className="text-purple-300">Regular Expression</span> that describes exactly L</li>
              <li>A <span className="text-purple-300">Regular Grammar</span> that generates exactly L</li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-shapes text-purple-400 mr-3" />Closure Properties
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Regular languages are <span className="text-purple-300 font-semibold">closed</span> under various operations, meaning applying 
              these operations to regular languages always produces another regular language.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Union</h3>
                <p className="font-mono text-purple-300 text-sm">L₁ ∪ L₂</p>
                <p className="text-gray-400 text-xs mt-1">All strings in either language</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Concatenation</h3>
                <p className="font-mono text-purple-300 text-sm">L₁ · L₂</p>
                <p className="text-gray-400 text-xs mt-1">All strings xy with x in L₁, y in L₂</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Kleene Star</h3>
                <p className="font-mono text-purple-300 text-sm">L*</p>
                <p className="text-gray-400 text-xs mt-1">Zero or more concatenations of strings in L</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Complement</h3>
                <p className="font-mono text-purple-300 text-sm">Σ* \ L</p>
                <p className="text-gray-400 text-xs mt-1">All strings not in L</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Intersection</h3>
                <p className="font-mono text-purple-300 text-sm">L₁ ∩ L₂</p>
                <p className="text-gray-400 text-xs mt-1">Strings in both languages</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Difference</h3>
                <p className="font-mono text-purple-300 text-sm">L₁ \ L₂</p>
                <p className="text-gray-400 text-xs mt-1">Strings in L₁ but not in L₂</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Reversal</h3>
                <p className="font-mono text-purple-300 text-sm">L^R</p>
                <p className="text-gray-400 text-xs mt-1">Every string reversed</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Homomorphism</h3>
                <p className="font-mono text-purple-300 text-sm">h(L)</p>
                <p className="text-gray-400 text-xs mt-1">Symbols replaced via a mapping</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-3">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-pump-soap text-purple-400 mr-3" />Pumping Lemma for Regular Languages
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The <span className="text-purple-300 font-semibold">pumping lemma</span> is a fundamental property of regular languages used 
              to prove that certain languages are <span className="text-red-400">not</span> regular. It states:
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <p className="italic text-gray-300 leading-relaxed">
                If L is a regular language, then there exists a constant <span className="font-mono text-purple-300">p</span> (the pumping length) 
                such that any string <span className="font-mono text-purple-300">s</span> in L with 
                <span className="font-mono text-purple-300"> |s| ≥ p</span> can be divided into three parts 
                <span className="font-mono text-purple-300"> s = xyz</span> satisfying:
              </p>
              <ol className="mt-3 space-y-1 text-gray-400 text-sm ml-4 list-decimal">
                <li><span className="font-mono text-purple-300">xyⁱz ∈ L</span> for all <span className="font-mono text-purple-300">i ≥ 0</span></li>
                <li><span className="font-mono text-purple-300">|y| &gt; 0</span> (y is non-empty)</li>
                <li><span className="font-mono text-purple-300">|xy| ≤ p</span></li>
              </ol>
            </div>
            <p className="text-gray-300 leading-relaxed">
              To prove a language is <span className="text-red-400">not regular</span>, assume it is regular, then find a string that 
              cannot be pumped (divided and repeated) while staying in the language. This contradiction proves non-regularity.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-project-diagram text-purple-400 mr-3" />Relationship to Automata
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Regular languages sit at the <span className="text-purple-300">lowest level</span> of the Chomsky hierarchy, yet they form the 
              foundation of all formal language theory. Their relationships to various computational models are well-understood:
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <p className="text-purple-300 font-mono text-sm mb-2">Equivalence Classes:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Regular Languages = Languages recognized by DFAs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Regular Languages = Languages recognized by NFAs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Regular Languages = Languages described by Regular Expressions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Regular Languages = Languages generated by Regular Grammars</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Beyond regular languages lie <span className="text-blue-400">context-free languages</span> (recognized by PDAs), 
              <span className="text-yellow-400">context-sensitive languages</span>, and 
              <span className="text-red-400">recursively enumerable languages</span> (recognized by Turing machines). 
              Each level adds more computational power.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-5">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-list text-purple-400 mr-3" />Examples
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Regular Languages</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li><span className="font-mono text-purple-300">{'{0, 1}*'}</span> — All binary strings</li>
                  <li><span className="font-mono text-purple-300">{'{0\u207F | n \u2265 0}'}</span> — Zero or more 0s</li>
                  <li><span className="font-mono text-purple-300">{'w \u2208 {0,1}* | w ends with 01'}</span> — Ends with 01</li>
                  <li><span className="font-mono text-purple-300">{'w \u2208 {a,b}* | |w| is even'}</span> — Even-length strings</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Non-Regular Languages</h3>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li><span className="font-mono text-red-400">{'{0\u207F1\u207F | n \u2265 0}'}</span> — Equal number of 0s and 1s (CFL)</li>
                  <li><span className="font-mono text-red-400">{'ww | w \u2208 {0,1}*'}</span> — Repeated strings (CSL)</li>
                  <li><span className="font-mono text-red-400">{'{0\u207F | n is prime}'}</span> — Prime-length strings</li>
                  <li><span className="font-mono text-red-400">{'a\u207Fb\u207Fc\u207F | n \u2265 0}'}</span> — Triple counting (CSL)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-cogs text-purple-400 mr-3" />Myhill-Nerode Theorem
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The <span className="text-purple-300 font-semibold">Myhill-Nerode theorem</span> provides an alternative characterization of regular 
              languages using the concept of <span className="text-purple-300">distinguishability</span>. It states that a language L is regular 
              if and only if the equivalence relation <span className="font-mono text-purple-300">~L</span> has a finite number of equivalence classes.
            </p>
            <p className="text-gray-300 leading-relaxed mb-3">
              Two strings <span className="font-mono text-purple-300">x</span> and <span className="font-mono text-purple-300">y</span> are 
              distinguishable with respect to L if there exists a suffix <span className="font-mono text-purple-300">z</span> such that exactly 
              one of <span className="font-mono text-purple-300">xz</span> and <span className="font-mono text-purple-300">yz</span> is in L.
            </p>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-gray-400 text-sm mb-2">
                <span className="text-purple-300 font-semibold">Key insight:</span> The number of equivalence classes in the Myhill-Nerode 
                relation equals the minimum number of states in any DFA that recognizes L. This provides a 
                <span className="text-purple-300"> lower bound</span> on DFA size.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
