'use client';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';

export default function AmbiguousGrammarWorkspace() {
  return (
    <>
      <WorkspaceNavbar title="Ambiguous Grammar" subtitle="Understanding Ambiguity in Grammars" />
      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Ambiguous Grammar</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">Understanding ambiguity in context-free grammars and how to resolve it</p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-question-circle text-purple-400 mr-3" />What is Ambiguity?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              A context-free grammar (CFG) is <span className="text-purple-300 font-semibold">ambiguous</span> if there exists at least one 
              string that can be derived in <span className="text-purple-300">more than one way</span> — specifically, if the string has 
              more than one distinct <span className="text-purple-300">parse tree</span> (or equivalently, more than one leftmost derivation).
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ambiguity is a significant concern in both theoretical computer science and practical applications like 
              programming language design and natural language processing. An ambiguous grammar can lead to 
              <span className="text-purple-300"> multiple interpretations</span> of the same input, which is undesirable in contexts 
              where a unique meaning is required.
            </p>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <p className="text-gray-400 text-sm">
                <span className="text-purple-300 font-semibold">Important note:</span> The question of whether a given CFG is ambiguous 
                is <span className="text-red-400">undecidable</span> — there is no algorithm that can always determine if a grammar 
                is ambiguous. However, we can identify common patterns of ambiguity and techniques to resolve them.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-list text-purple-400 mr-3" />Examples of Ambiguous Grammars
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Example 1: Arithmetic Expressions</h3>
                <p className="text-gray-400 text-sm mb-2">The classic ambiguous grammar for arithmetic:</p>
                <p className="font-mono text-purple-300 text-sm mb-2">
                  E → E + E | E × E | (E) | id
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  The string <span className="font-mono text-purple-300">id + id × id</span> has two parse trees — one where addition 
                  is evaluated first (wrong under standard precedence), and one where multiplication is evaluated first.
                </p>
                <div className="flex gap-4 mt-2">
                  <div className="flex-1 bg-black/30 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1 text-center">Parse Tree 1: (id + id) × id</p>
                    <pre className="font-mono text-purple-300 text-xs leading-relaxed">
{`   E
  /|\\
 E + E
 |   /|\\
 id E × E
    |   |
   id  id`}
                    </pre>
                  </div>
                  <div className="flex-1 bg-black/30 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-1 text-center">Parse Tree 2: id + (id × id)</p>
                    <pre className="font-mono text-purple-300 text-xs leading-relaxed">
{`   E
  /|\\
 E × E
/|\\   |
E+E  id
|  |
id id`}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Example 2: Dangling Else</h3>
                <p className="text-gray-400 text-sm mb-2">A classic ambiguity in programming language design:</p>
                <p className="font-mono text-purple-300 text-sm mb-2">
                  S → if E then S | if E then S else S | other
                </p>
                <p className="text-gray-400 text-sm mb-2">
                  The string <span className="font-mono text-purple-300">if E1 then if E2 then S1 else S2</span> has two interpretations:
                </p>
                <ul className="space-y-1 text-gray-400 text-sm ml-4">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">1.</span>
                    <span><span className="font-mono text-purple-300">if E1 then (if E2 then S1 else S2)</span> — else matches inner if</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">2.</span>
                    <span><span className="font-mono text-purple-300">if E1 then (if E2 then S1) else S2</span> — else matches outer if</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Example 3: Associativity</h3>
                <p className="text-gray-400 text-sm mb-2">Grammar with ambiguous operator associativity:</p>
                <p className="font-mono text-purple-300 text-sm mb-2">
                  S → S - S | id
                </p>
                <p className="text-gray-400 text-sm">
                  The string <span className="font-mono text-purple-300">id - id - id</span> can be parsed as either 
                  <span className="font-mono text-purple-300"> (id - id) - id</span> (left-associative) or 
                  <span className="font-mono text-purple-300"> id - (id - id)</span> (right-associative), producing different results.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-3">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-tools text-purple-400 mr-3" />Disambiguation Techniques
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">1. Rewriting the Grammar</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Introduce <span className="text-purple-300">non-terminals</span> to enforce precedence and associativity explicitly.
                </p>
                <p className="text-gray-400 text-sm mb-1">Unambiguous arithmetic grammar:</p>
                <pre className="font-mono text-purple-300 text-sm leading-relaxed">
{`E → E + T | T
T → T × F | F
F → (E) | id`}
                </pre>
                <p className="text-gray-400 text-xs mt-1">
                  This enforces <span className="text-purple-300">×</span> binding tighter than 
                  <span className="text-purple-300"> +</span>, and both are left-associative.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">2. Associativity Rules</h3>
                <p className="text-gray-300 text-sm mb-2">
                  For left-associative operators, use <span className="text-purple-300">left recursion</span>:
                </p>
                <p className="font-mono text-purple-300 text-sm mb-2">S → S - T | T</p>
                <p className="text-gray-300 text-sm mb-2">
                  For right-associative operators, use <span className="text-purple-300">right recursion</span>:
                </p>
                <p className="font-mono text-purple-300 text-sm mb-2">S → T ^ S | T</p>
                <p className="text-gray-400 text-sm">
                  This ensures that repeated applications of the same operator group in the desired direction.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">3. Operator Precedence</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Use <span className="text-purple-300">separate non-terminals</span> for each precedence level:
                </p>
                <pre className="font-mono text-purple-300 text-sm leading-relaxed mb-2">
{`Exp   → Exp + Term | Term      (lowest precedence)
Term  → Term × Factor | Factor (medium precedence)
Factor → (Exp) | id             (highest precedence)`}
                </pre>
                <p className="text-gray-400 text-xs">
                  Each level can only produce operators from lower levels, ensuring correct evaluation order.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">4. Else Matching Convention</h3>
                <p className="text-gray-300 text-sm mb-2">
                  For the dangling else problem, use the <span className="text-purple-300">matched/unmatched</span> convention:
                </p>
                <pre className="font-mono text-purple-300 text-sm leading-relaxed">
{`S     → Matched | Unmatched
Matched   → if E then Matched else Matched | other
Unmatched → if E then S | if E then Matched else Unmatched`}
                </pre>
                <p className="text-gray-400 text-xs mt-1">
                  This enforces that each <span className="font-mono text-purple-300">else</span> matches the nearest 
                  unmatched <span className="font-mono text-purple-300">if</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-lightbulb text-purple-400 mr-3" />Inherent Ambiguity
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Some context-free languages are <span className="text-purple-300 font-semibold">inherently ambiguous</span> — every grammar 
              that generates the language is ambiguous. These languages cannot be described by an unambiguous grammar.
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <h3 className="text-white font-semibold mb-2">Classic Example</h3>
              <p className="font-mono text-purple-300 text-sm mb-2">
                {'L = {a\u207Fb\u207Fc\u1D50d\u1D50 | n, m \u2265 1} \u222A {a\u207Fb\u1D50c\u1D50d\u207F | n, m \u2265 1}'}
              </p>
              <p className="text-gray-400 text-sm">
                This language is inherently ambiguous because strings of the form 
                <span className="font-mono text-purple-300"> aⁿbⁿcⁿdⁿ</span> can be generated by both parts of the union, 
                leading to essentially different derivations in any grammar.
              </p>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Inherent ambiguity is a <span className="text-purple-300">property of the language</span>, not just a particular grammar. 
              While we can often rewrite an ambiguous grammar to be unambiguous (for the same language), inherent ambiguity means 
              that <span className="text-red-400">no such rewriting exists</span> — the language itself forces ambiguity.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-5">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-cogs text-purple-400 mr-3" />Parse Trees and Derivations
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Understanding ambiguity requires understanding <span className="text-purple-300">parse trees</span>. A parse tree is a 
              graphical representation of a derivation, showing how the start symbol produces a string through grammar productions.
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <p className="text-purple-300 font-mono text-sm mb-2">Key Facts:</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Each <span className="text-purple-300">parse tree</span> corresponds to exactly one leftmost derivation and one rightmost derivation.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>A grammar is ambiguous if there are <span className="text-purple-300">two distinct parse trees</span> for the same string.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Two different leftmost (or rightmost) derivations imply two different parse trees.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Simply having multiple derivations is not ambiguity — they must be <span className="text-purple-300">structurally different</span>.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-code text-purple-400 mr-3" />Practical Implications
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ambiguity has significant practical consequences in several areas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Programming Languages</h3>
                <p className="text-gray-400 text-sm">
                  Programming language grammars must be unambiguous to ensure that every program has a 
                  <span className="text-purple-300"> single, well-defined meaning</span>. Compilers rely on this property for 
                  code generation.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Natural Language Processing</h3>
                <p className="text-gray-400 text-sm">
                  Natural languages are inherently ambiguous. NLP systems use statistical models and context to 
                  <span className="text-purple-300"> disambiguate</span> between multiple possible parse trees.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Parser Design</h3>
                <p className="text-gray-400 text-sm">
                  LL and LR parsers typically require unambiguous grammars. Parser generators often 
                  <span className="text-purple-300"> report conflicts</span> that arise from ambiguity.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Formal Verification</h3>
                <p className="text-gray-400 text-sm">
                  In formal methods and verification, ambiguous specifications can lead to 
                  <span className="text-purple-300"> incorrect conclusions</span> or verification gaps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
