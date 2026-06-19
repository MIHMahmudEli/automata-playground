'use client';
import { useEffect } from 'react';

export default function ParticleBackground() {
  useEffect(() => {
    const container = document.getElementById('particles-container');
    if (!container || container.children.length > 0) return;
    const colors = ['#8b5cf6', '#ec4899', '#a78bfa', '#f472b6'];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(particle);
    }
  }, []);

  return <div id="particles-container" />;
}
