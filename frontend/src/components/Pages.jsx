import { useEffect, useState } from 'react';
import { fetchMessages, fetchTemplates, fetchApprovals, approveMessage, fetchAnalytics, fetchSettings } from '../services/api';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, BarChart, Settings, Clock, Check } from 'lucide-react';

export function MessagesPage() {
  const [messages, setMessages] = useState([]);
  useEffect(() => { fetchMessages().then(setMessages); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Clock className="w-6 h-6 text-brand-500" /> My Messages</h2>
      <div className="space-y-4">
        {messages.length === 0 ? <p className="text-slate-400">No messages found.</p> : messages.map(msg => (
          <div key={msg.id} className="glass-panel p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold bg-brand-500/20 text-brand-300 px-2 py-1 rounded">{msg.audience}</span>
              <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <p className="text-slate-200 text-sm">{msg.simplified_text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  useEffect(() => { fetchTemplates().then(setTemplates); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><FileText className="w-6 h-6 text-brand-500" /> Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="glass-panel p-5 cursor-pointer hover:border-brand-500 transition-colors">
            <span className="text-xs text-slate-400 uppercase tracking-wider">{t.category}</span>
            <h3 className="text-lg font-bold text-slate-100 mt-1 mb-2">{t.title}</h3>
            <p className="text-slate-400 text-sm line-clamp-3">{t.content}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  useEffect(() => { fetchApprovals().then(setApprovals); }, []);

  const handleApprove = async (id) => {
    await approveMessage(id);
    setApprovals(approvals.filter(a => a.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-brand-500" /> Pending Approvals</h2>
      <div className="space-y-4">
        {approvals.length === 0 ? <p className="text-slate-400">No pending approvals.</p> : approvals.map(a => (
          <div key={a.id} className="glass-panel p-5 flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded mb-2 inline-block">Pending</span>
              <p className="text-slate-200 text-sm max-w-xl">{a.simplified_text}</p>
            </div>
            <button onClick={() => handleApprove(a.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" /> Approve
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function AnalyticsPage() {
  const [data, setData] = useState({ messages_generated: 0, messages_published: 0 });
  useEffect(() => { fetchAnalytics().then(setData); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><BarChart className="w-6 h-6 text-brand-500" /> Analytics</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-8 text-center">
          <div className="text-5xl font-bold text-brand-400 mb-2">{data.messages_generated}</div>
          <div className="text-slate-400 uppercase tracking-wide text-sm">Messages Generated</div>
        </div>
        <div className="glass-panel p-8 text-center">
          <div className="text-5xl font-bold text-green-400 mb-2">{data.messages_published}</div>
          <div className="text-slate-400 uppercase tracking-wide text-sm">Messages Published</div>
        </div>
      </div>
    </motion.div>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState({});
  useEffect(() => { fetchSettings().then(setSettings); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Settings className="w-6 h-6 text-brand-500" /> Settings</h2>
      <div className="glass-panel p-6 space-y-4 max-w-lg">
        <div className="flex justify-between items-center">
          <span className="text-slate-200">Theme</span>
          <span className="text-brand-400 capitalize">{settings.theme || 'Dark'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-200">Notifications</span>
          <span className="text-brand-400">{settings.notifications ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </motion.div>
  );
}
