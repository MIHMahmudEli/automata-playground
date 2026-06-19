'use client';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const topics = [
  { href: '/dfa', title: 'DFA', desc: 'Deterministic Finite Automaton - Single path computation with deterministic state transitions.', icon: 'fa-circle-nodes', delay: 'stagger-1' },
  { href: '/nfa', title: 'NFA', desc: 'Non-deterministic Finite Automaton - Multiple possible paths and state transitions.', icon: 'fa-code-branch', delay: 'stagger-2' },
  { href: '/epsilon-nfa', title: 'ε-NFA', desc: 'Epsilon NFA - NFA with epsilon (empty string) transitions for enhanced flexibility.', icon: 'fa-project-diagram', delay: 'stagger-3' },
  { href: '/regular-languages', title: 'Regular Languages', desc: 'Languages recognized by finite automata with closure properties and pumping lemma.', icon: 'fa-language', delay: 'stagger-4' },
  { href: '/regex', title: 'Regular Expressions', desc: 'Pattern matching expressions equivalent to regular languages and finite automata.', icon: 'fa-code', delay: 'stagger-5' },
  { href: '/cfg', title: 'CFG', desc: 'Context-Free Grammar - Formal grammar for generating context-free languages.', icon: 'fa-sitemap', delay: 'stagger-6' },
  { href: '/ambiguous-grammar', title: 'Ambiguous Grammar', desc: 'Grammars with multiple parse trees for the same string and disambiguation techniques.', icon: 'fa-question-circle', delay: 'stagger-7' },
  { href: '/cnf', title: 'CNF', desc: 'Chomsky Normal Form - Standardized grammar form for context-free grammars.', icon: 'fa-layer-group', delay: 'stagger-8' },
  { href: '/pda', title: 'PDA', desc: 'Pushdown Automaton - Finite automaton with stack memory for context-free languages.', icon: 'fa-layer-group', delay: 'stagger-9' },
  { href: '/turing-machine', title: 'Turing Machine', desc: 'Universal computational model with infinite tape memory and bidirectional movement.', icon: 'fa-microchip', delay: 'stagger-10' },
];

export default function Home() {
  const scrollToTopics = () => {
    document.getElementById('topics')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <ParticleBackground />
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="fade-in-up stagger-1">
            <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
              Interactive Learning Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mt-8 mb-6 fade-in-up stagger-2">
            Master <span className="gradient-text">Automata Theory</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed fade-in-up stagger-3">
            Explore, visualize, and understand formal languages and automata through interactive tools and comprehensive workspaces.
          </p>
          <div className="flex items-center justify-center space-x-4 fade-in-up stagger-4">
            <button onClick={scrollToTopics} className="px-8 py-4 explore-btn text-white font-semibold rounded-xl relative">
              <span className="relative z-10">Explore Topics</span>
            </button>
            <button onClick={scrollToAbout} className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition duration-200 border border-white/20">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section id="topics" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Topic</h2>
            <p className="text-gray-400 text-lg">Select a topic to start your learning journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div key={topic.href} className={`glass-card rounded-2xl p-6 fade-in-up ${topic.delay}`}>
                <div className="icon-wrapper w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <i className={`fas ${topic.icon} text-white text-2xl`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{topic.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{topic.desc}</p>
                <Link href={topic.href} className="explore-btn inline-block px-6 py-3 text-white font-semibold rounded-lg text-sm">
                  <span className="relative z-10 flex items-center">
                    Explore <i className="fas fa-arrow-right ml-2" />
                  </span>
                </Link>
              </div>
            ))}
            <div className="glass-card rounded-2xl p-6 fade-in-up stagger-11 border-2 border-purple-500/20">
              <div className="icon-wrapper w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-purple-600 to-indigo-600">
                <i className="fas fa-magic text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Conversion Engine</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Step-by-step transformation algorithms: NFA to DFA, RE to NFA, and CFG to CNF.
              </p>
              <Link href="/conversions" className="explore-btn inline-block px-6 py-3 text-white font-semibold rounded-lg text-sm">
                <span className="relative z-10 flex items-center">
                  Launch Engine <i className="fas fa-rocket ml-2" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">About This Platform</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            This interactive platform is designed to help students and enthusiasts master the fundamentals of
            automata theory and formal languages. Each topic provides comprehensive tools for visualization,
            exploration, and deep understanding of theoretical computer science concepts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass-card rounded-xl p-6">
              <div className="text-purple-400 text-3xl mb-3"><i className="fas fa-brain" /></div>
              <h3 className="text-white font-bold text-xl mb-2">Interactive Learning</h3>
              <p className="text-gray-400 text-sm">Hands-on visualization and interactive tools for better understanding</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <div className="text-pink-400 text-3xl mb-3"><i className="fas fa-graduation-cap" /></div>
              <h3 className="text-white font-bold text-xl mb-2">Comprehensive</h3>
              <p className="text-gray-400 text-sm">Complete coverage of all major automata theory topics</p>
            </div>
            <div className="glass-card rounded-xl p-6">
              <div className="text-purple-400 text-3xl mb-3"><i className="fas fa-rocket" /></div>
              <h3 className="text-white font-bold text-xl mb-2">Modern Interface</h3>
              <p className="text-gray-400 text-sm">Beautiful, responsive design for seamless learning experience</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <i className="fas fa-project-diagram text-white text-sm" />
            </div>
            <span className="text-white font-bold text-lg">Automata Theory Platform</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">Empowering students to master theoretical computer science</p>
          <p className="text-gray-500 text-xs">&copy; 2024 Automata Theory Platform. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
