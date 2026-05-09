import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Check, ShieldCheck, Zap, Activity } from 'lucide-react';

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

export default function OutputSection({ result, isProcessing }) {
  const [copied, setCopied] = useState(false);

  if (isProcessing) {
    return (
      <div className="glass-panel p-6 mb-8 relative z-10 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6"></div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
          <div className="h-10 bg-slate-800 rounded w-full"></div>
          <div className="h-10 bg-slate-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.final_output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.5 }}
      className="glass-panel p-6 mb-8 relative z-10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          AI Generated Content
        </h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-medium bg-brand-500/10 text-brand-400 px-2 py-1 rounded-md border border-brand-500/20">
            <Activity className="w-3.5 h-3.5" /> 98% Match
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="bg-slate-950 border border-slate-700 rounded-xl p-5 text-slate-200 min-h-[160px] relative overflow-hidden group mb-6">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-purple-500"></div>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="leading-relaxed whitespace-pre-wrap">
            <TypewriterText text={result.final_output} />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Governance Checks</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Sensitive Data Masked
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Policy Compliant
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Explainability</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="w-4 h-4 text-brand-400" />
              Technical Terms Simplified
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Zap className="w-4 h-4 text-brand-400" />
              Target: <span className="capitalize text-brand-300">{result.audience}</span>
            </div>
          </div>
        </div>
      </div>

      {result.docs_used && result.docs_used.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            Enterprise Context Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.docs_used.map((doc, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/20 rounded-lg text-xs font-medium text-brand-300">
                ✓ {doc}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
