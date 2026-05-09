import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <div className="text-center mb-10 relative">
      <div className="flex justify-center md:absolute md:right-0 md:top-0 mb-4 md:mb-0 w-fit mx-auto md:mx-0 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs font-medium text-slate-300 tracking-wide">AI Agent Active</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4 border border-brand-500/20"
      >
        <Sparkles className="w-4 h-4" />
        <span>MCP-Powered AI Orchestration</span>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 mb-4"
      >
        Electrolux AI Communication Hub
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg text-slate-400 max-w-2xl mx-auto"
      >
        Translate complex technical updates into clear business communication.
      </motion.p>
    </div>
  );
}
