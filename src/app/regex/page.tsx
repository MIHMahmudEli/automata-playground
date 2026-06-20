'use client';
import WorkspaceNavbar from '@/components/WorkspaceNavbar';

export default function RegexWorkspace() {
  const patterns = [
    { pattern: '.', desc: 'Any single character except newline' },
    { pattern: '^', desc: 'Start of string' },
    { pattern: '$', desc: 'End of string' },
    { pattern: '*', desc: 'Zero or more occurrences of preceding pattern' },
    { pattern: '+', desc: 'One or more occurrences of preceding pattern' },
    { pattern: '?', desc: 'Zero or one occurrence (optional) of preceding pattern' },
    { pattern: '|', desc: 'Alternation (OR) between two patterns' },
    { pattern: '()', desc: 'Grouping and capturing' },
    { pattern: '[]', desc: 'Character class — matches any one character inside' },
    { pattern: '{n,m}', desc: 'Between n and m occurrences of preceding pattern' },
  ];

  return (
    <>
      <WorkspaceNavbar title="Regular Expressions" subtitle="Pattern Matching & Formal Languages" />
      <div className="pt-20 sm:pt-24 pb-10 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="gradient-text">Regular Expressions</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-2 sm:px-0">Pattern matching constructs equivalent to regular languages and finite automata</p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-question-circle text-purple-400 mr-3" />What are Regular Expressions?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              A <span className="text-purple-300 font-semibold">regular expression</span> (regex or regexp) is a sequence of characters that defines a 
              search pattern. In formal language theory, regular expressions describe <span className="text-purple-300">regular languages</span> — the 
              same class of languages recognized by finite automata.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Regular expressions provide a concise and declarative way to specify patterns. They are widely used in text processing, 
              input validation, lexical analysis, and search operations across virtually all programming languages.
            </p>
            <p className="text-gray-300 leading-relaxed">
              The theoretical foundation of regular expressions comes from <span className="text-purple-300">Kleene's theorem</span>, which establishes 
              the equivalence between regular expressions, finite automata, and regular grammars.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-2">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-th-list text-purple-400 mr-3" />Basic Patterns
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Regular expressions are built from <span className="text-purple-300">atomic patterns</span> combined with 
              <span className="text-purple-300"> operators</span>. The three fundamental operations are:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Concatenation</h3>
                <p className="text-gray-400 text-sm">Writing patterns in sequence</p>
                <p className="font-mono text-purple-300 text-xs mt-2">ab → matches &quot;ab&quot;</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Union (Alternation)</h3>
                <p className="text-gray-400 text-sm">Choice between patterns</p>
                <p className="font-mono text-purple-300 text-xs mt-2">a|b → matches &quot;a&quot; or &quot;b&quot;</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Kleene Star</h3>
                <p className="text-gray-400 text-sm">Zero or more repetitions</p>
                <p className="font-mono text-purple-300 text-xs mt-2">a* → matches &quot;&quot;, &quot;a&quot;, &quot;aa&quot;, ...</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              These three operations — concatenation, alternation, and Kleene star — form the <span className="text-purple-300">core building blocks</span> 
              of regular expressions. Additional constructs like anchors, character classes, and quantifiers are syntactic sugar built on this foundation.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-3">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-table text-purple-400 mr-3" />Common Regex Operators
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium">Pattern</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {patterns.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="py-3 px-4"><code className="font-mono text-purple-300">{item.pattern}</code></td>
                      <td className="py-3 px-4 text-gray-300">{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-list text-purple-400 mr-3" />Examples
            </h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Email Validation</h3>
                <p className="font-mono text-purple-300 text-sm break-all">{'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'}</p>
                <p className="text-gray-400 text-xs mt-2">Matches standard email addresses</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Phone Number (US)</h3>
                <p className="font-mono text-purple-300 text-sm">{'^\\(\\d{3}\\)\\s?\\d{3}[-.]?\\d{4}$'}</p>
                <p className="text-gray-400 text-xs mt-2">Matches formats like (555) 123-4567</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Binary Strings Ending with 01</h3>
                <p className="font-mono text-purple-300 text-sm">(0|1)*01</p>
                <p className="text-gray-400 text-xs mt-2">Regular expression equivalent to an NFA that accepts strings ending with 01</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">Even Number of 0s</h3>
                <p className="font-mono text-purple-300 text-sm">(1*01*01*)*</p>
                <p className="text-gray-400 text-xs mt-2">All binary strings with an even count of 0s</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">URL Matching</h3>
                <p className="font-mono text-purple-300 text-sm break-all">^https?://[a-zA-Z0-9.-]+(?::\d+)?(?:/[^\s]*)?$</p>
                <p className="text-gray-400 text-xs mt-2">Matches HTTP/HTTPS URLs with optional port and path</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-5">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-project-diagram text-purple-400 mr-3" />Regular Expressions and Automata
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              <span className="text-purple-300 font-semibold">Kleene's theorem</span> establishes a fundamental equivalence: a language is regular 
              if and only if it can be described by a regular expression. This means every regular expression corresponds to a finite 
              automaton and vice versa.
            </p>
            <div className="bg-white/5 rounded-xl p-5 mb-4 border border-white/10">
              <p className="text-purple-300 font-mono text-sm mb-2">Conversion Pipeline:</p>
              <p className="text-gray-400 text-sm mb-1">
                <span className="font-mono text-purple-300">Regex</span>
                <i className="fas fa-arrow-right mx-3 text-purple-500" />
                <span className="font-mono text-purple-300">ε-NFA</span>
                <i className="fas fa-arrow-right mx-3 text-purple-500" />
                <span className="font-mono text-purple-300">NFA</span>
                <i className="fas fa-arrow-right mx-3 text-purple-500" />
                <span className="font-mono text-purple-300">DFA</span>
                <i className="fas fa-arrow-right mx-3 text-purple-500" />
                <span className="font-mono text-purple-300">Minimized DFA</span>
              </p>
            </div>
            <ul className="space-y-2 text-gray-300 leading-relaxed">
              <li className="flex items-start">
                <i className="fas fa-arrow-right text-purple-400 mr-3 mt-1" />
                <span><span className="text-purple-300">Thompson's construction</span> converts a regex to an ε-NFA compositionally.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-arrow-right text-purple-400 mr-3 mt-1" />
                <span><span className="text-purple-300">Subset construction</span> converts an NFA to an equivalent DFA.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-arrow-right text-purple-400 mr-3 mt-1" />
                <span><span className="text-purple-300">DFA minimization</span> produces the optimal DFA with the fewest states.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6 fade-in-up stagger-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              <i className="fas fa-exclamation-triangle text-purple-400 mr-3" />Limitations
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Despite their power, regular expressions have fundamental limitations arising from the 
              <span className="text-purple-300"> pumping lemma for regular languages</span>:
            </p>
            <ul className="space-y-2 text-gray-300 leading-relaxed">
              <li className="flex items-start">
                <i className="fas fa-times-circle text-red-400 mr-3 mt-1" />
                <span>Cannot match <span className="font-mono text-purple-300">aⁿbⁿ</span> (balanced parentheses) — requires a context-free grammar.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-times-circle text-red-400 mr-3 mt-1" />
                <span>Cannot handle <span className="font-mono text-purple-300">nested structures</span> like HTML or recursive patterns.</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-times-circle text-red-400 mr-3 mt-1" />
                <span>Limited <span className="font-mono text-purple-300">counting ability</span> — cannot verify that counts match across patterns.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
