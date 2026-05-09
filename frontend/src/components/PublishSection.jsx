import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { publishToSlack } from '../services/api';

export default function PublishSection({ result }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  if (!result) return null;

  const handleSlackPublish = async () => {
    setIsPublishing(true);
    setToastMessage(null);
    try {
      await publishToSlack(result.final_output);
      setToastMessage('Message posted to Slack successfully');
    } catch (error) {
      setToastMessage('Error posting to Slack');
      console.error(error);
    } finally {
      setIsPublishing(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-8"
    >
      <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Send className="w-5 h-5 text-brand-500" />
        Publish To
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Slack Card */}
        <button
          onClick={handleSlackPublish}
          disabled={isPublishing}
          className="relative group glass-panel rounded-xl p-5 hover:bg-slate-800/80 transition-all border border-slate-700 hover:border-brand-500 flex flex-col items-center justify-center gap-3 text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 group-hover:bg-brand-500/20 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521h-6.313A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.521A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.523-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E5A823"/>
              </svg>
            </div>
          )}
          <div>
            <h4 className="font-semibold text-slate-100 group-hover:text-brand-400 transition-colors">Slack</h4>
            <span className="text-xs text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full mt-1 inline-block border border-brand-500/20">ACTIVE</span>
          </div>
        </button>

        {/* Viva Engage Card (Disabled) */}
        <div className="relative glass-panel rounded-xl p-5 border border-slate-800 opacity-60 flex flex-col items-center justify-center gap-3 text-center cursor-not-allowed">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900">
            <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M2.25 10.5V21h19.5V10.5H2.25zM21.75 9h-19.5V3h19.5v6z"/></svg>
          </div>
          <div>
            <h4 className="font-semibold text-slate-400">Viva Engage</h4>
            <span className="text-xs text-slate-500 mt-1 inline-block">Coming Soon</span>
          </div>
        </div>

        {/* Microsoft Teams Card (Disabled) */}
        <div className="relative glass-panel rounded-xl p-5 border border-slate-800 opacity-60 flex flex-col items-center justify-center gap-3 text-center cursor-not-allowed">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900">
            <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 10.5h4.5v10.5h-4.5zM3 10.5h10.5V21H3zM3 3h18v6H3z"/></svg>
          </div>
          <div>
            <h4 className="font-semibold text-slate-400">Microsoft Teams</h4>
            <span className="text-xs text-slate-500 mt-1 inline-block">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 px-6 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3 z-50"
        >
          {toastMessage.includes('Error') ? (
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
          {toastMessage}
        </motion.div>
      )}
    </motion.div>
  );
}
