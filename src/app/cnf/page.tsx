'use client';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';
import Link from 'next/link';

export default function CNFWorkspace() {
  return (
    <>
      <WorkspaceNavbar title="Chomsky Normal Form" subtitle="Standardized Grammar Form" />
      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Chomsky Normal Form</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">
              A restricted form of context-free grammars where all productions follow a specific structure
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-question-circle text-purple-400 mr-3" />
              What is Chomsky Normal Form?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              A context-free grammar is in <span className="gradient-text font-semibold">Chomsky Normal Form</span> (CNF)
              if every production rule is of the form:
            </p>
            <div className="bg-white/5 rounded-xl p-4 mb-4 border border-purple-500/20">
              <code className="font-mono text-purple-300 text-lg block text-center">
                A → BC &nbsp;&nbsp;|&nbsp;&nbsp; A → a
              </code>
              <p className="text-gray-400 text-sm text-center mt-2">
                where A, B, C are variables (non-terminals), and a is a terminal symbol.
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Additionally, the start symbol S may produce the empty string ε. CNF is widely used because it
              enables efficient parsing algorithms like the CYK algorithm.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Any context-free grammar can be converted into an equivalent CNF grammar through a systematic
              process of transformations.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-list-ol text-purple-400 mr-3" />
              Steps to Convert to CNF
            </h2>
            <ol className="space-y-4 list-none">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">1</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Eliminate ε-productions</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    For each nullable variable (one that derives ε), add new productions that simulate
                    removing it from any rule. Remove all A → ε productions (except possibly S → ε).
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">2</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Eliminate Unit Productions</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Remove all productions of the form A → B where both are variables. For each such
                    pair, add A → α for every non-unit production B → α.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">3</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Eliminate Useless Symbols</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Remove variables that cannot derive any terminal string (non-productive) and
                    variables that are not reachable from the start symbol.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">4</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">Restructure Remaining Productions</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    Replace each terminal in mixed productions (e.g., A → aB) with a new variable
                    (A → C<sub>a</sub>B, C<sub>a</sub> → a). Break long productions (A → BCD)
                    into binary chains (A → BX, X → CD).
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-microchip text-purple-400 mr-3" />
              CYK Algorithm
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The <span className="text-purple-400 font-semibold">Cocke-Younger-Kasami (CYK)</span> algorithm is
              a parsing algorithm for context-free grammars in Chomsky Normal Form. It determines whether a given
              string can be generated by the grammar using dynamic programming.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-white font-semibold mb-2 text-sm">How it works</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-purple-400 text-xs mt-1.5" />
                    <span>Construct a triangular table of size n×n where n is the input string length</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-purple-400 text-xs mt-1.5" />
                    <span>Fill bottom row with variables that directly produce each terminal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-purple-400 text-xs mt-1.5" />
                    <span>Work upward: for each cell, check all splits of the substring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-chevron-right text-purple-400 text-xs mt-1.5" />
                    <span>Accept if the start symbol is in the top-right cell</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <h3 className="text-white font-semibold mb-2 text-sm">Complexity</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-clock text-purple-400 text-xs mt-1.5" />
                    <span><strong className="text-white">Time:</strong> O(n³ · |G|) where n is string length, |G| is grammar size</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-database text-purple-400 text-xs mt-1.5" />
                    <span><strong className="text-white">Space:</strong> O(n² · |V|) where |V| is the number of variables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-purple-400 text-xs mt-1.5" />
                    <span><strong className="text-white">Membership:</strong> Decides if w ∈ L(G) in polynomial time</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <p className="text-sm text-gray-300">
                <i className="fas fa-lightbulb text-yellow-400 mr-2" />
                The CYK algorithm is widely used in natural language processing and compiler
                design for parsing strings against a formal grammar.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-exchange-alt text-purple-400 mr-3" />
              Try It Out
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Use our <Link href="/conversions" className="text-purple-400 hover:text-purple-300 underline">Conversion Engine</Link> to
              convert any CFG into Chomsky Normal Form step by step, or build a CFG in the
              <Link href="/cfg" className="text-purple-400 hover:text-purple-300 underline ml-1">CFG Workspace</Link>.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/conversions" className="btn-primary px-6 py-3 text-white font-semibold rounded-lg inline-flex items-center">
                <i className="fas fa-exchange-alt mr-2" />Go to Conversions
              </Link>
              <Link href="/cfg" className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition border border-white/10 inline-flex items-center">
                <i className="fas fa-pen mr-2" />CFG Workspace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
