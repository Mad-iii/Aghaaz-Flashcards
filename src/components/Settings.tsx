import React, { useState, useEffect } from 'react';
import { loadSettings, saveSettings } from '../data';
import { AgencySettings } from '../types';
import { 
  Palette, 
  Cloud, 
  Mail, 
  Slack, 
  Lock, 
  Users, 
  CreditCard,
  CheckCircle2,
  BellRing,
  Settings as SettingsIcon,
  UploadCloud,
  XCircle,
  HelpCircle,
  ChevronRight,
  Database,
  Key,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Server
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection, SUPABASE_SQL_SCHEMA } from '../lib/supabase';

export default function Settings() {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [logoInput, setLogoInput] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');

  // Supabase Integration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setLogoInput(loaded.logoUrl);
    setPrimaryColor(loaded.primaryColor);
    setAccentColor(loaded.accentColor);

    // Initial load of Supabase credentials
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url || '');
    setSupabaseKey(config.anonKey || '');
  }, []);

  if (!settings) {
    return (
      <div className="flex-grow flex items-center justify-center p-12 text-gray-500 font-mono text-xs animate-pulse">
        Initializing workspace settings...
      </div>
    );
  }

  const handleToggleIntegration = (key: 'salesforceActive' | 'mailchimpActive' | 'slackActive') => {
    if (!settings) return;
    const updated = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(updated);
  };

  const handleToggleNotification = (key: 'emailAlerts' | 'dailySummary' | 'smsAlerts' | 'assignmentAlerts') => {
    if (!settings) return;
    const updated = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(updated);
  };

  const handleSaveAll = () => {
    if (!settings) return;
    const finalSettings: AgencySettings = {
      ...settings,
      logoUrl: logoInput,
      primaryColor: primaryColor,
      accentColor: accentColor
    };

    saveSettings(finalSettings);
    
    // Save Supabase Configuration
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    
    alert('Global settings and Supabase configurations saved successfully! Brand styling and database sync are active.');
    
    // Force reload page to apply logo change across header instantly
    window.location.reload();
  };

  const handleResetLogo = () => {
    const defaultLogo = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1rU9NVA-UL_VFnPsnmJ8FgGB-BhOwUjE8IGol0rq_S5gkH6Ni-jomWO3oGT-9-_EhImH7X8vj9y4BFMjn_rAHa8H26IyU7z0t0Qs0e8h2sdupTcF3tVUpIn7QcrvUUurRxQs8HSHf877Jb66CzxD0ASeXFk7MSANowF_7kOI2ccAFx4nYfjTUwQux2ChUNl9JqTp2cGEUrDZX9IJa3stFIeBU0lEanzkyJO1RysK1YTHFT2ENldGU2ORR8kI1CATkTsj9gKhqTCOG';
    setLogoInput(defaultLogo);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0A0B0D] text-slate-200 font-sans pb-16">
      
      {/* Top Header Row */}
      <header className="sticky top-0 z-30 bg-[#0F1115]/90 backdrop-blur border-b border-slate-800/60 px-8 py-5 flex justify-between items-center shadow-xs">
        <div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight leading-none mb-1">
            Platform Settings
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Configure your agency brand, trigger alert mechanisms, and customize third-party pipes
          </p>
        </div>
      </header>

      {/* Settings Grid Content */}
      <div className="p-8 max-w-[900px] mx-auto space-y-6">
        
        {/* Brand Identity Card */}
        <section className="bg-[#0F1115] border border-slate-800/80 p-6 rounded-xl shadow-xs text-left">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-800/60">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Brand Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Configuration */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 font-semibold">
                Agency Logo Image URL
              </label>
              
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 border border-slate-800 rounded bg-[#1A1D23] flex items-center justify-center overflow-hidden shrink-0 p-1">
                  <img 
                    alt="Current Logo Preview" 
                    className="w-full h-full object-contain filter" 
                    src={logoInput} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100';
                    }}
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    value={logoInput}
                    onChange={(e) => setLogoInput(e.target.value)}
                    placeholder="Enter image URL..."
                    className="w-full px-3 py-2 text-xs bg-[#1A1D23] border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-semibold text-slate-200"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleResetLogo}
                      className="border border-slate-800 hover:bg-slate-800/50 text-[10px] font-mono font-bold px-3 py-1.5 rounded text-slate-400 cursor-pointer"
                    >
                      Reset Default
                    </button>
                    <p className="text-[9px] text-slate-500 font-sans leading-normal self-center">
                      Best fit: transparent square SVG/PNG.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent colors visualization */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 font-semibold">
                Strategic Accent Colors
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#1A1D23] border border-slate-800/80 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full border border-slate-700/60 shrink-0" style={{ backgroundColor: primaryColor }}></div>
                    <span className="text-xs font-semibold text-slate-200">Primary Color (Navy/Black)</span>
                  </div>
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 px-2 py-0.5 text-right font-mono text-[11px] text-slate-400 bg-transparent border-b border-transparent focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#1A1D23] border border-slate-800/80 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full border border-slate-700/60 shrink-0" style={{ backgroundColor: accentColor }}></div>
                    <span className="text-xs font-semibold text-slate-200">Momentum Accent (Amber)</span>
                  </div>
                  <input 
                    type="text" 
                    value={accentColor} 
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-20 px-2 py-0.5 text-right font-mono text-[11px] text-slate-400 bg-transparent border-b border-transparent focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Settings Card */}
        <section className="bg-[#0F1115] border border-slate-800/80 p-6 rounded-xl shadow-xs text-left">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Integration Settings</h3>
            </div>
            
            <button 
              onClick={() => alert('Custom Webhooks Integration module initiated. Contact Support for Enterprise OAuth.')}
              className="bg-slate-800 border border-slate-700/40 text-slate-300 hover:bg-indigo-600 hover:text-white px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Add Integration
            </button>
          </div>

          <div className="space-y-3">
            {/* Salesforce CRM */}
            <div className="flex items-center justify-between p-4 border border-slate-800/80 hover:border-slate-700 rounded-lg transition-all duration-150">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 leading-tight">Salesforce CRM Integration</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Automate high-growth lead segments directly to pipeline pipelines</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleIntegration('salesforceActive')}
                className={`px-3 py-1 rounded font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer ${
                  settings.salesforceActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700/30'
                }`}
              >
                {settings.salesforceActive ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            {/* Mailchimp */}
            <div className="flex items-center justify-between p-4 border border-slate-800/80 hover:border-slate-700 rounded-lg transition-all duration-150">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 leading-tight">Mailchimp Marketing Flows</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Synchronize nurture email campaigns for small qualification scales</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleIntegration('mailchimpActive')}
                className={`px-3 py-1 rounded font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer ${
                  settings.mailchimpActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700/30'
                }`}
              >
                {settings.mailchimpActive ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>

            {/* Slack Alerts */}
            <div className="flex items-center justify-between p-4 border border-slate-800/80 hover:border-slate-700 rounded-lg transition-all duration-150">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                  <Slack className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200 leading-tight">Slack Momentum channel alerts</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">Trigger instant notifications on dedicated marketing Slack channels</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleIntegration('slackActive')}
                className={`px-3 py-1 rounded font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer ${
                  settings.slackActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700/30'
                }`}
              >
                {settings.slackActive ? 'ACTIVE' : 'CONNECT'}
              </button>
            </div>
          </div>
        </section>

        {/* Supabase Cloud Database Sync Integration */}
        <section className="bg-[#0F1115] border border-slate-800/80 p-6 rounded-xl shadow-xs text-left">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-indigo-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Supabase Cloud Database</h3>
            </div>
            <span className="font-mono text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold tracking-wider uppercase">
              {supabaseUrl && supabaseKey ? 'CONNECTED' : 'LOCAL CACHE MODE'}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Connect this campaign application to your live Supabase cloud database. All configured paths, active sequences, settings, and submitted client inquiries will automatically synchronize to the cloud, allowing multiple visitors and admin dashboards to load identical state simultaneously.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-semibold">
                  Supabase API URL
                </label>
                <div className="relative">
                  <Server className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={supabaseUrl}
                    onChange={(e) => { setSupabaseUrl(e.target.value); setTestResult(null); }}
                    placeholder="https://your-project.supabase.co"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-[#1A1D23] border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-semibold text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-semibold">
                  Supabase Anon API Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={supabaseKey}
                    onChange={(e) => { setSupabaseKey(e.target.value); setTestResult(null); }}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-[#1A1D23] border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-mono text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Test Connection and SQL Schema Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={async () => {
                  if (!supabaseUrl || !supabaseKey) {
                    setTestResult({ success: false, message: 'Please provide both the Supabase URL and Anon API Key before testing.' });
                    return;
                  }
                  setIsTesting(true);
                  setTestResult(null);
                  try {
                    // Temporarily save to test
                    saveSupabaseConfig(supabaseUrl, supabaseKey);
                    const res = await testSupabaseConnection();
                    setTestResult(res);
                  } catch (err: any) {
                    setTestResult({ success: false, message: `Failed to connect: ${err.message || err}` });
                  } finally {
                    setIsTesting(false);
                  }
                }}
                disabled={isTesting}
                className="bg-slate-800 border border-slate-700/40 text-slate-300 hover:bg-slate-700 hover:text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Test Database Connection
              </button>

              <button
                type="button"
                onClick={() => setShowSqlSchema(!showSqlSchema)}
                className="bg-transparent border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                {showSqlSchema ? 'Hide SQL Script' : 'View PostgreSQL SQL Script'}
              </button>
            </div>

            {/* Connection Test feedback */}
            {testResult && (
              <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 leading-normal ${
                testResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* SQL Script Instruction code block */}
            {showSqlSchema && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">PostgreSQL Initialization Script</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded cursor-pointer transition-all"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? 'Copied!' : 'Copy SQL Script'}
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-4 bg-[#0A0B0D] border border-slate-800/80 rounded-lg overflow-x-auto text-[11px] font-mono text-slate-300 max-h-[220px] scrollbar-thin">
                    <code>{SUPABASE_SQL_SCHEMA}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Lead Alerts Preferences & Account actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Lead Alerts checkboxes */}
          <section className="bg-[#0F1115] border border-slate-800/80 p-6 rounded-xl shadow-xs text-left">
            <div className="flex items-center gap-3 mb-5 pb-2 border-b border-slate-800/60">
              <BellRing className="w-4 h-4 text-indigo-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Lead Alerts</h3>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Instant Email Alerts</span>
                <input 
                  type="checkbox" 
                  checked={settings.emailAlerts}
                  onChange={() => handleToggleNotification('emailAlerts')}
                  className="w-4.5 h-4.5 border-slate-800 bg-[#1A1D23] rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Daily Summary Report</span>
                <input 
                  type="checkbox" 
                  checked={settings.dailySummary}
                  onChange={() => handleToggleNotification('dailySummary')}
                  className="w-4.5 h-4.5 border-slate-800 bg-[#1A1D23] rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">High-Value Lead SMS</span>
                <input 
                  type="checkbox" 
                  checked={settings.smsAlerts}
                  onChange={() => handleToggleNotification('smsAlerts')}
                  className="w-4.5 h-4.5 border-slate-800 bg-[#1A1D23] rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">Assignment Notifications</span>
                <input 
                  type="checkbox" 
                  checked={settings.assignmentAlerts}
                  onChange={() => handleToggleNotification('assignmentAlerts')}
                  className="w-4.5 h-4.5 border-slate-800 bg-[#1A1D23] rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </section>

          {/* Account Subactions */}
          <section className="bg-[#0F1115] border border-slate-800/80 p-6 rounded-xl shadow-xs text-left">
            <div className="flex items-center gap-3 mb-5 pb-2 border-b border-slate-800/60">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Account</h3>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => alert('Passcode reset protocol initiated. Secure link dispatched to mahdsadiq180@gmail.com.')}
                className="w-full bg-[#1A1D23] border border-slate-800/80 hover:border-slate-700 p-3 rounded flex items-center justify-between text-xs text-slate-200 font-semibold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                onClick={() => alert('Access roster: 8 strategists. Contact Admin for custom team tokens.')}
                className="w-full bg-[#1A1D23] border border-slate-800/80 hover:border-slate-700 p-3 rounded flex items-center justify-between text-xs text-slate-200 font-semibold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Manage Team (8 users)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button 
                onClick={() => alert('Current tier: Agency Core. Billing updates scheduled on the 1st of next month.')}
                className="w-full bg-[#1A1D23] border border-slate-800/80 hover:border-slate-700 p-3 rounded flex items-center justify-between text-xs text-slate-200 font-semibold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Subscription Plan details</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </section>

        </div>

        {/* Global form actions footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
          <button 
            onClick={() => window.location.reload()}
            className="border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white px-6 py-2 rounded-lg font-mono text-xs uppercase tracking-widest font-semibold cursor-pointer transition-colors"
          >
            Discard Changes
          </button>
          
          <button 
            onClick={handleSaveAll}
            className="bg-indigo-600 text-white hover:bg-indigo-500 px-8 py-2 rounded-lg font-mono text-xs uppercase tracking-widest font-bold shadow-lg shadow-indigo-600/15 cursor-pointer transition-all"
          >
            Save Global Settings
          </button>
        </div>

      </div>

    </div>
  );
}
