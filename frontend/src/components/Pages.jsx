import { useEffect, useState } from 'react';
import { fetchMessages, fetchTemplates, fetchApprovals, approveMessage, fetchSettings } from '../services/api';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, BarChart, Settings, Clock, Check, Users, MessageSquare, TrendingUp, AlertCircle, Send, MoreHorizontal, ShieldCheck, Zap } from 'lucide-react';

export function MessagesPage() {
  const [messages, setMessages] = useState([]);
  
  // Mix real messages with fake data for demonstration
  useEffect(() => { 
    fetchMessages().then(data => {
      const fakeHistory = [
        { id: 901, simplified_text: 'The Kubernetes cluster ingress controller experienced TLS certificate rotation failure...', audience: 'IT Staff', created_at: new Date(Date.now() - 3600000).toISOString(), status: 'Draft', channel: 'Slack', confidence: 'Medium' },
        { id: 902, simplified_text: 'Quarterly earnings have exceeded expectations by 15%. Great job team!', audience: 'Management', created_at: new Date(Date.now() - 86400000).toISOString(), status: 'Published', channel: 'Viva Engage', confidence: 'High' },
        { id: 903, simplified_text: 'A software rollout issue temporarily affected firmware updates for connected appliances.', audience: 'Frontline Workers', created_at: new Date(Date.now() - 172800000).toISOString(), status: 'Published', channel: 'Teams', confidence: 'High' }
      ];
      setMessages([...data, ...fakeHistory]);
    }); 
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2"><Clock className="w-6 h-6 text-brand-500" /> Communication History</h2>
          <p className="text-slate-400 mt-1">Enterprise archive of all AI-assisted communications.</p>
        </div>
      </div>
      
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-500 uppercase bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Message Snippet</th>
                <th className="px-6 py-4">Audience</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">AI Confidence</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">No messages found.</td></tr>
              ) : messages.map((msg, idx) => (
                <tr key={msg.id || idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200 max-w-md truncate">{msg.simplified_text}</td>
                  <td className="px-6 py-4"><span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs border border-slate-700">{msg.audience}</span></td>
                  <td className="px-6 py-4">{msg.channel || 'Slack'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      msg.status === 'Published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      msg.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {msg.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${
                      msg.confidence === 'High' ? 'text-green-400' : msg.confidence === 'Medium' ? 'text-yellow-400' : 'text-brand-400'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5" /> {msg.confidence || 'High'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(msg.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  const kpis = [
    { title: 'Total Communications', value: '1,248', trend: '+12.5%', color: 'text-brand-400', icon: <MessageSquare className="w-5 h-5 text-brand-400" /> },
    { title: 'Successfully Published', value: '892', trend: '+18.2%', color: 'text-green-400', icon: <Send className="w-5 h-5 text-green-400" /> },
    { title: 'Scheduled Posts', value: '45', trend: 'Stable', color: 'text-purple-400', icon: <Clock className="w-5 h-5 text-purple-400" /> },
    { title: 'Support Tickets Saved', value: '342', trend: '+28.4%', color: 'text-yellow-400', icon: <TrendingUp className="w-5 h-5 text-yellow-400" /> }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
            <BarChart className="w-8 h-8 text-brand-500" /> Enterprise Dashboard
          </h2>
          <p className="text-slate-400">Monitor communication operations, AI performance, and enterprise metrics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-panel p-6 flex flex-col justify-between hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">{kpi.icon}</div>
            </div>
            <div className="flex items-end justify-between">
              <span className={`text-4xl font-bold tracking-tight ${kpi.color}`}>{kpi.value}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${kpi.trend === 'Stable' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Engagement Charts / Performance (Fake Visuals) */}
        <div className="xl:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-500" /> Audience Engagement Trends
            </h3>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          {/* Fake Bar Chart Representation */}
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[45, 60, 35, 80, 55, 90, 75, 40, 65, 85, 70, 95].map((h, i) => (
              <div key={i} className="w-full flex flex-col justify-end group">
                <div 
                  className="w-full bg-brand-600/50 hover:bg-brand-500 rounded-t-md transition-all relative border-t border-l border-r border-brand-400/30" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h * 120} views
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-500 mt-2">W{i+1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Impact Insights */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-400" /> AI Impact Insights
          </h3>
          
          <div className="space-y-6 flex-1">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex gap-4">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0"></div>
                <div>
                  <p className="text-sm text-slate-200 leading-relaxed">AI reduced technical jargon by <strong className="text-brand-400 font-semibold">84%</strong> across all frontline communications this week.</p>
                  <span className="text-xs font-medium text-slate-500 mt-2 block uppercase tracking-wider">System Metric</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex gap-4">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0"></div>
                <div>
                  <p className="text-sm text-slate-200 leading-relaxed">Average readability score improved from College level to <strong className="text-emerald-400 font-semibold">8th Grade</strong> level.</p>
                  <span className="text-xs font-medium text-slate-500 mt-2 block uppercase tracking-wider">Audience Analysis</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex gap-4">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0"></div>
                <div>
                  <p className="text-sm text-slate-200 leading-relaxed"><strong className="text-purple-400 font-semibold">1,204 sensitive data points</strong> (API keys, IP addresses) were auto-masked by governance tools.</p>
                  <span className="text-xs font-medium text-slate-500 mt-2 block uppercase tracking-wider">Governance Log</span>
                </div>
              </div>
            </div>
          </div>
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
