import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automata Theory Platform - Master Formal Languages",
  description: "Interactive platform for learning and visualizing automata theory concepts including DFA, NFA, CFG, PDA, and Turing Machines.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
