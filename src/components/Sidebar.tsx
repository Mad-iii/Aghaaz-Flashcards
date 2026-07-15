import React from 'react';
import { loadSettings } from '../data';
import { 
  LayoutDashboard, 
  GitFork, 
  UserSquare2, 
  Settings, 
  PlusCircle, 
  LogOut, 
  Eye, 
  HelpCircle 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExitAdmin: () => void;
  onTriggerNewCard?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onExitAdmin, onTriggerNewCard }: SidebarProps) {
  const settings = loadSettings();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flow-builder', label: 'Flow Builder', icon: GitFork },
    { id: 'lead-data', label: 'Lead Data', icon: UserSquare2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 bg-[#0F1115] border-r border-slate-800/50 flex flex-col p-5 z-40">
      
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3">
        <img 
          alt="Aghaaz Logo" 
          className="h-10 w-10 object-contain rounded bg-slate-900 p-1 border border-slate-800" 
          src={settings.logoUrl} 
        />
        <div className="overflow-hidden">
          <h1 className="font-display font-bold text-lg text-white leading-tight tracking-tight">
            Aghaaz Admin
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
            Strategic Momentum
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-[11px] uppercase tracking-wider font-medium transition-all ${
                isActive 
                  ? 'bg-slate-800/80 text-white font-bold border border-slate-700/50 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Quick Action Button & Back Button */}
      <div className="pt-4 border-t border-slate-800/50 space-y-2">
        <button 
          onClick={onTriggerNewCard}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-lg font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          New Question Card
        </button>

        <button 
          onClick={onExitAdmin}
          className="w-full bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-200 py-2.5 px-4 rounded-lg font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Eye className="w-4 h-4" />
          View Live Deck
        </button>
      </div>

      {/* Admin Profile Panel & Support Links */}
      <div className="mt-6 pt-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 p-2 bg-[#1A1D23]/60 border border-slate-800/50 rounded-lg mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800/50 shrink-0">
            <img 
              className="w-full h-full object-cover" 
              alt="Strategist portrait"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM4C6zI3mgu3KJ9T-0yO0P4sp9FzOPy7K7md1VUsKR7lxsI5ILco8oqrVAqrup2lZjjsN1BsojcLsGai_dE6v2fdawcIZ_b2CyLCXROOHIOERNtBuxC_D7foecWa0WAkWL6WqzpdewpbFxOzGsWq6a9riMBWwBNFt-4LZtl4_A0EfQEFvyKkoYDovWBJOm1gQHTwMtfDIO0L0Smw5RrjUgXyDwsiK24-4cIQ1i0bEWifZwIVYpTX-Jbk9MkavHeWRZ-qIk_HyDiE73" 
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate leading-tight">Admin Profile</p>
            <p className="font-mono text-[9px] text-slate-500 uppercase tracking-wider truncate">Lead Strategist</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-slate-500">
          <button 
            onClick={() => onTabChange('settings')}
            className="flex items-center gap-1 hover:text-white transition-colors font-mono text-[10px] uppercase"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Support
          </button>
          
          <button 
            onClick={onExitAdmin}
            className="flex items-center gap-1 hover:text-rose-400 transition-colors font-mono text-[10px] uppercase"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

    </aside>
  );
}
