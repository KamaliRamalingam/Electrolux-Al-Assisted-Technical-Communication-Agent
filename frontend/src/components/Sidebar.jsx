import { motion } from 'framer-motion';
import { PenSquare, MessageSquare, FileJson, CheckSquare, Clock, BarChart3, Settings } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { icon: PenSquare, label: 'Create Message' },
    { icon: MessageSquare, label: 'My Messages' },
    { icon: FileJson, label: 'Templates' },
    { icon: CheckSquare, label: 'Approvals' },
    { icon: Clock, label: 'History' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900/80 border-r border-slate-800 fixed left-0 top-0 flex flex-col pt-6 backdrop-blur-md z-20">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="font-bold text-white">AI</span>
        </div>
        <span className="font-semibold text-slate-100 tracking-wide">CommAssist</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => setActivePage(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activePage === item.label 
                  ? 'bg-brand-500/10 text-brand-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            US
          </div>
          <div className="text-left text-sm">
            <div className="font-medium text-slate-200">User Profile</div>
            <div className="text-xs text-slate-500">user@company.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
