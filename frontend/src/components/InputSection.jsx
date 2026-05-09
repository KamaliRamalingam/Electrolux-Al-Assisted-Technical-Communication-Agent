import { motion } from 'framer-motion';
import { FileText, Users, Globe, Mic, Wand2, Loader2 } from 'lucide-react';

export default function InputSection({ 
  text, setText, 
  audience, setAudience, 
  language, setLanguage,
  tone, setTone,
  onSimplify, isProcessing 
}) {
  const maxChars = 2000;
  
  const audienceOptions = ['All Employees', 'Frontline Workers', 'IT Teams', 'Factory Staff', 'Executives', 'Pilot Users', 'Regional Teams'];
  const languageOptions = ['English', 'Swedish', 'German', 'French'];
  const toneOptions = ['Professional', 'Friendly', 'Executive', 'Urgent', 'Simplified', 'Technical-lite'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel p-6 mb-8 relative z-10"
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText className="w-4 h-4 text-brand-400" />
              Original Update
            </label>
            <div className={`text-xs ${text.length > maxChars ? 'text-red-400' : 'text-slate-500'}`}>
              {text.length}/{maxChars}
            </div>
          </div>
          <div className="glow-border">
            <textarea
              className={`w-full h-48 bg-slate-950/50 border ${text.length > maxChars ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-brand-500'} rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-all`}
              placeholder="Paste technical update here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Users className="w-3.5 h-3.5" /> Target Audience
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isProcessing}
            >
              {audienceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Globe className="w-3.5 h-3.5" /> Language
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isProcessing}
            >
              {languageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Mic className="w-3.5 h-3.5" /> Tone
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isProcessing}
            >
              {toneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={onSimplify}
          disabled={!text.trim() || isProcessing || text.length > maxChars}
          className="w-full mt-2 relative overflow-hidden group bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Generate Message</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
