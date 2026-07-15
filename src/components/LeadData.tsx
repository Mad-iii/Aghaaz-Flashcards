import React, { useState, useEffect } from 'react';
import { loadLeads, saveLeads, loadSettings } from '../data';
import { Lead } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  Trash2, 
  MoreVertical, 
  ExternalLink,
  Sliders,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

export default function LeadData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);

  useEffect(() => {
    setLeads(loadLeads());
    
    // Dynamic Cloud Sync re-hydration for Leads management list
    import('../lib/supabase').then(async (lib) => {
      if (lib.isSupabaseConfigured()) {
        try {
          const dbLeads = await lib.dbLoadLeads();
          saveLeads(dbLeads);
          setLeads(dbLeads);
        } catch (err) {
          console.error('Failed to async-sync LeadData list from Supabase:', err);
        }
      }
    });
  }, []);

  const settings = loadSettings();

  // Search and status filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this lead?');
    if (!confirmed) return;

    const updated = leads.filter(l => l.id !== id);
    saveLeads(updated);
    setLeads(updated);
    
    // Direct cloud delete
    import('../lib/supabase').then((lib) => {
      if (lib.isSupabaseConfigured()) {
        lib.dbDeleteLead(id).catch(err => console.error('Failed to delete lead from Supabase:', err));
      }
    });

    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
    setShowDropdownId(null);
  };

  const handleUpdateStatus = (id: string, status: 'Finished' | 'Abandoned' | 'In Progress', e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = leads.map(l => {
      if (l.id === id) {
        return { ...l, status };
      }
      return l;
    });
    saveLeads(updated);
    setLeads(updated);
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status });
    }
    setShowDropdownId(null);
  };

  const triggerExport = () => {
    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Score %', 'Status', 'Timestamp'];
    const rows = leads.map(l => [
      l.id,
      l.name,
      l.company,
      l.email,
      l.phone,
      l.score,
      l.status,
      l.createdTime
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aghaaz_leads_database.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0A0B0D] text-slate-200 font-sans pb-16">
      
      {/* Header Panel */}
      <header className="sticky top-0 z-30 bg-[#0F1115]/90 backdrop-blur border-b border-slate-800/60 px-8 py-5 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xs">
        <div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight leading-none mb-1">
            Customer Lead Database
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Real-time engagement tracking, answers path audits, and outreach coordination
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1A1D23] border border-slate-800/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48 focus:w-64 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1D23] border border-slate-800/80 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Finished">Finished</option>
              <option value="Abandoned">Abandoned</option>
              <option value="In Progress">In Progress</option>
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5 pointer-events-none" />
          </div>

          <button 
            onClick={triggerExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-xs font-mono font-bold rounded-lg shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            EXPORT CSV
          </button>
        </div>
      </header>

      {/* Main Database Content Area */}
      <div className="px-8 py-8 max-w-[1200px] mx-auto grid grid-cols-12 gap-6">
        
        {/* Table Column (col-span-12 or col-span-8 if lead selected) */}
        <div className={`${selectedLead ? 'col-span-12 lg:col-span-8' : 'col-span-12'} bg-[#0F1115] border border-slate-800/80 rounded-xl overflow-hidden transition-all duration-300 shadow-sm`}>
          <div className="px-6 py-4 border-b border-slate-800/80 bg-[#1A1D23]/40 flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-white">
              Total Recorded Inquiries ({filteredLeads.length})
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Live Synced Database
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1A1D23]/50 border-b border-slate-800/80 text-[10px] font-mono text-slate-500 uppercase">
                  <th className="px-5 py-3">Lead Information</th>
                  <th className="px-5 py-3">The Path (Choices Made)</th>
                  <th className="px-5 py-3">Status &amp; Score</th>
                  <th className="px-5 py-3">Contact Details</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <tr 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`hover:bg-slate-800/20 transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-500/10 hover:bg-indigo-500/15' : ''
                      }`}
                    >
                      {/* Lead Information with Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/50 text-slate-200 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                            {lead.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-sans text-xs font-bold text-white truncate leading-tight">
                              {lead.name}
                            </p>
                            <p className="font-sans text-[10px] text-slate-400 truncate mt-0.5">
                              {lead.company}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Path choices badges */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[280px]">
                          {lead.choices.map((choice, idx) => (
                            <React.Fragment key={choice.cardId + idx}>
                              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                              <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[9px] font-mono font-medium truncate max-w-[100px]">
                                {choice.answer}
                              </span>
                            </React.Fragment>
                          ))}
                          {lead.choices.length === 0 && (
                            <span className="text-slate-500 text-[10px] italic">No choices registered</span>
                          )}
                        </div>
                      </td>

                      {/* Status and scoring */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-200 shrink-0">
                            {lead.score}%
                          </span>
                        </div>
                        <span className={`inline-block mt-1 text-[9px] font-mono uppercase tracking-widest font-bold ${
                          lead.status === 'Finished' 
                            ? 'text-emerald-400' 
                            : lead.status === 'Abandoned' 
                            ? 'text-amber-400' 
                            : 'text-indigo-400'
                        }`}>
                          ● {lead.status}
                        </span>
                      </td>

                      {/* Contacts */}
                      <td className="px-5 py-4">
                        <div className="text-xs overflow-hidden max-w-[160px]">
                          <p className="text-slate-200 font-semibold truncate hover:text-indigo-400 hover:underline transition-colors" title={lead.email}>
                            {lead.email}
                          </p>
                          <p className="text-slate-400 text-[10px] truncate mt-0.5">
                            {lead.phone}
                          </p>
                        </div>
                      </td>

                      {/* Row actions */}
                      <td className="px-4 py-4 text-right relative" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => setShowDropdownId(showDropdownId === lead.id ? null : lead.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-slate-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {showDropdownId === lead.id && (
                          <div className="absolute right-4 mt-1 bg-[#0F1115] border border-slate-800 rounded-lg shadow-xl py-1 w-36 text-left z-40 animate-slide-up">
                            <button 
                              onClick={() => { setSelectedLead(lead); setShowDropdownId(null); }}
                              className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Profile
                            </button>
                            <button 
                              onClick={(e) => handleUpdateStatus(lead.id, 'Finished', e)}
                              className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              Mark Finished
                            </button>
                            <button 
                              onClick={(e) => handleUpdateStatus(lead.id, 'Abandoned', e)}
                              className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                              Mark Abandoned
                            </button>
                            <hr className="my-1 border-slate-800" />
                            <button 
                              onClick={(e) => handleDeleteLead(lead.id, e)}
                              className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Lead
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-xs">
                      No matching customer inquiries found in database
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 bg-[#1A1D23]/40 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Showing 1-{filteredLeads.length} of {filteredLeads.length} entries</span>
            <div className="flex gap-1.5">
              <button className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[10px] font-mono font-bold">1</button>
              <button className="px-2.5 py-1 text-slate-500 hover:text-white rounded text-[10px] font-mono transition-colors">2</button>
              <span className="px-1 text-slate-600">...</span>
              <button className="px-2.5 py-1 text-slate-500 hover:text-white rounded text-[10px] font-mono transition-colors">32</button>
            </div>
          </div>
        </div>

        {/* Detailed Profile Drawer Column (col-span-4, slides in when selected) */}
        {selectedLead && (
          <aside className="col-span-12 lg:col-span-4 bg-[#0F1115] border border-slate-800 shadow-xl rounded-xl p-5 flex flex-col justify-between animate-slide-up relative">
            
            <button 
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-500 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              {/* Profile header */}
              <div className="text-center pb-5 border-b border-slate-800/60 mb-5">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700/50 text-slate-200 font-mono font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {selectedLead.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <h3 className="font-display font-bold text-lg text-white leading-tight">
                  {selectedLead.name}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {selectedLead.company}
                </p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold rounded ${
                  selectedLead.status === 'Finished' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : selectedLead.status === 'Abandoned' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {selectedLead.status}
                </span>
              </div>

              {/* Path Flow Logs */}
              <div className="space-y-4 mb-6">
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
                  Intake Path &amp; Answers
                </span>
                
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {selectedLead.choices.map((choice, idx) => (
                    <div key={idx} className="bg-[#1A1D23] border border-slate-800/60 rounded-lg p-3 text-xs">
                      <p className="text-slate-500 text-[10px] font-mono uppercase">
                        {choice.question}
                      </p>
                      <p className="text-slate-200 font-semibold mt-0.5">
                        {choice.answer}
                      </p>
                    </div>
                  ))}
                  
                  {selectedLead.choices.length === 0 && (
                    <p className="text-slate-500 text-xs italic">No selection traces registered for this inquiry</p>
                  )}
                </div>
              </div>

              {/* Score card summary */}
              <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20 text-center">
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-indigo-300">
                  Calculated Momentum Score
                </span>
                <p className="font-display text-4xl font-black text-indigo-400 tracking-tight mt-1">
                  {selectedLead.score}%
                </p>
                <p className="text-[10px] text-indigo-300/80 mt-1 font-sans leading-relaxed">
                  High strategic priority segment. Momentum leads represent maximum pipeline capability.
                </p>
              </div>
            </div>

            {/* Quick Contacts Actions */}
            <div className="pt-4 border-t border-slate-800/60 space-y-2 mt-4">
              <a 
                href={`mailto:${selectedLead.email}`}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-colors"
              >
                Launch Mail Outreach
              </a>
              <button 
                onClick={(e) => handleDeleteLead(selectedLead.id, e)}
                className="w-full border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 py-2 rounded-lg font-mono text-[9px] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                Delete Record
              </button>
            </div>

          </aside>
        )}

      </div>

    </div>
  );
}
