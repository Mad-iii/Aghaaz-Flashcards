import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Card, Lead, AgencySettings, Chain } from '../types';
import { defaultChains, defaultLeads, defaultSettings } from '../data';

// Key names for localStorage
const SUPABASE_URL_KEY = 'aghaaz_supabase_url';
const SUPABASE_KEY_KEY = 'aghaaz_supabase_key';

export interface SupabaseConfig {
  url: string | null;
  anonKey: string | null;
}

// Get credentials from either UI configuration or Environment Variables
export const getSupabaseConfig = (): SupabaseConfig => {
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY);

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || null;
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || null;

  return {
    url: localUrl || envUrl || null,
    anonKey: localKey || envKey || null
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (url) {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
  }

  if (key) {
    localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return !!(url && anonKey);
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    supabaseInstance = null;
    return null;
  }
  
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    // Return existing or create new client
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: false
        }
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// SQL Schema script for copying
export const SUPABASE_SQL_SCHEMA = `-- Run this in your Supabase SQL Editor to create the tables!

-- 1. Create table for active chain ID
CREATE TABLE IF NOT EXISTS public.aghaaz_active_chain_id (
  id TEXT PRIMARY KEY DEFAULT 'active_id',
  chain_id TEXT NOT NULL
);

-- 2. Create table for settings
CREATE TABLE IF NOT EXISTS public.aghaaz_settings (
  id TEXT PRIMARY KEY DEFAULT 'settings_id',
  logo_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  salesforce_active BOOLEAN,
  mailchimp_active BOOLEAN,
  slack_active BOOLEAN,
  email_alerts BOOLEAN,
  daily_summary BOOLEAN,
  sms_alerts BOOLEAN,
  assignment_alerts BOOLEAN
);

-- 3. Create table for chains
CREATE TABLE IF NOT EXISTS public.aghaaz_chains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cards JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create table for leads
CREATE TABLE IF NOT EXISTS public.aghaaz_leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  choices JSONB,
  score INTEGER,
  status TEXT,
  timestamp TEXT,
  created_time TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional - bypasses default block if no policy exists)
-- Or disable RLS for direct client operations if testing (recommended for fast proof-of-concept)
ALTER TABLE public.aghaaz_active_chain_id DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aghaaz_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aghaaz_chains DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aghaaz_leads DISABLE ROW LEVEL SECURITY;
`;

// Helper to test connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await client.from('aghaaz_active_chain_id').select('chain_id').limit(1);
    if (error) {
      // Check if table missing
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase! However, the tables do not exist yet. Please run the SQL schema script in your SQL Editor.' 
        };
      }
      return { success: false, message: `Database error: ${error.message} (Code: ${error.code})` };
    }
    return { success: true, message: 'Connection successful! All tables are accessible.' };
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message || err}` };
  }
};

/* ============================================================================
   ASYNC DATA PERSISTENCE LAYER FOR SUPABASE
   These sync client state seamlessly.
   ============================================================================ */

export const dbLoadActiveChainId = async (): Promise<string> => {
  const client = getSupabase();
  if (!client) return 'chain-default';
  try {
    const { data, error } = await client
      .from('aghaaz_active_chain_id')
      .select('chain_id')
      .eq('id', 'active_id')
      .maybeSingle();

    if (error) throw error;
    if (data) return data.chain_id;

    // Seed default if not exists
    await dbSaveActiveChainId('chain-default');
    return 'chain-default';
  } catch (err) {
    console.error('Supabase load active chain ID failed, falling back:', err);
    return 'chain-default';
  }
};

export const dbSaveActiveChainId = async (chainId: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client
      .from('aghaaz_active_chain_id')
      .upsert({ id: 'active_id', chain_id: chainId });
  } catch (err) {
    console.error('Supabase save active chain ID failed:', err);
  }
};

export const dbLoadChains = async (): Promise<Chain[]> => {
  const client = getSupabase();
  if (!client) return defaultChains;
  try {
    const { data, error } = await client
      .from('aghaaz_chains')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        cards: item.cards
      }));
    }

    // Seed defaults if empty
    for (const chain of defaultChains) {
      await client.from('aghaaz_chains').upsert({
        id: chain.id,
        name: chain.name,
        cards: chain.cards
      });
    }
    return defaultChains;
  } catch (err) {
    console.error('Supabase load chains failed, falling back:', err);
    return defaultChains;
  }
};

export const dbSaveChains = async (chains: Chain[]): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    // Upsert each chain
    for (const chain of chains) {
      await client.from('aghaaz_chains').upsert({
        id: chain.id,
        name: chain.name,
        cards: chain.cards
      });
    }
  } catch (err) {
    console.error('Supabase save chains failed:', err);
  }
};

export const dbDeleteChain = async (chainId: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('aghaaz_chains').delete().eq('id', chainId);
  } catch (err) {
    console.error('Supabase delete chain failed:', err);
  }
};

export const dbLoadLeads = async (): Promise<Lead[]> => {
  const client = getSupabase();
  if (!client) return defaultLeads;
  try {
    const { data, error } = await client
      .from('aghaaz_leads')
      .select('*')
      .order('created_time', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        name: item.name || 'Anonymous Client',
        company: item.company || 'Self Employed',
        email: item.email || 'client@example.com',
        phone: item.phone || 'N/A',
        choices: item.choices || [],
        score: item.score || 85,
        status: item.status || 'Finished',
        timestamp: item.timestamp || 'Just now',
        createdTime: item.created_time || new Date().toISOString()
      }));
    }

    // Seed defaults if empty
    for (const lead of defaultLeads) {
      await client.from('aghaaz_leads').upsert({
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        choices: lead.choices,
        score: lead.score,
        status: lead.status,
        timestamp: lead.timestamp,
        created_time: lead.createdTime
      });
    }
    return defaultLeads;
  } catch (err) {
    console.error('Supabase load leads failed, falling back:', err);
    return defaultLeads;
  }
};

export const dbSaveLead = async (lead: Lead): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('aghaaz_leads').upsert({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      choices: lead.choices,
      score: lead.score,
      status: lead.status,
      timestamp: lead.timestamp,
      created_time: lead.createdTime || new Date().toISOString()
    });
  } catch (err) {
    console.error('Supabase save lead failed:', err);
  }
};

export const dbSaveAllLeads = async (leads: Lead[]): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    for (const lead of leads) {
      await dbSaveLead(lead);
    }
  } catch (err) {
    console.error('Supabase save all leads failed:', err);
  }
};

export const dbDeleteLead = async (leadId: string): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('aghaaz_leads').delete().eq('id', leadId);
  } catch (err) {
    console.error('Supabase delete lead failed:', err);
  }
};

export const dbLoadSettings = async (): Promise<AgencySettings> => {
  const client = getSupabase();
  if (!client) return defaultSettings;
  try {
    const { data, error } = await client
      .from('aghaaz_settings')
      .select('*')
      .eq('id', 'settings_id')
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return {
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        accentColor: data.accent_color,
        salesforceActive: data.salesforce_active,
        mailchimpActive: data.mailchimp_active,
        slackActive: data.slack_active,
        emailAlerts: data.email_alerts,
        dailySummary: data.daily_summary,
        smsAlerts: data.sms_alerts,
        assignmentAlerts: data.assignment_alerts
      };
    }

    // Seed default if empty
    await dbSaveSettings(defaultSettings);
    return defaultSettings;
  } catch (err) {
    console.error('Supabase load settings failed, falling back:', err);
    return defaultSettings;
  }
};

export const dbSaveSettings = async (settings: AgencySettings): Promise<void> => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('aghaaz_settings').upsert({
      id: 'settings_id',
      logo_url: settings.logoUrl,
      primary_color: settings.primaryColor,
      accent_color: settings.accentColor,
      salesforce_active: settings.salesforceActive,
      mailchimp_active: settings.mailchimpActive,
      slack_active: settings.slackActive,
      email_alerts: settings.emailAlerts,
      daily_summary: settings.dailySummary,
      sms_alerts: settings.smsAlerts,
      assignment_alerts: settings.assignmentAlerts
    });
  } catch (err) {
    console.error('Supabase save settings failed:', err);
  }
};
