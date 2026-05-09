import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <div className="text-center mb-10">
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
        Enterprise AI Communication Assistant
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
