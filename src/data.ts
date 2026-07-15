import { Card, Lead, AgencySettings, Chain } from './types';

// Helper to load from local storage with fallback
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading localStorage key:', key, error);
  }
  return defaultValue;
};

// Helper to save to local storage
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving localStorage key:', key, error);
  }
};

// Default setup of strategic question cards
export const defaultCards: Card[] = [
  {
    id: 'lead-intake',
    title: 'What is your primary strategic goal?',
    phase: 'Phase One: Inquiry',
    type: 'choice',
    description: 'Select the path that aligns with your current momentum. Each choice refines your custom roadmap.',
    options: [
      { id: 'A', text: 'Brand Identity', nextCardId: 'revenue-tier' },
      { id: 'B', text: 'Product Design', nextCardId: 'revenue-tier' },
      { id: 'C', text: 'Digital Presence', nextCardId: 'revenue-tier' }
    ]
  },
  {
    id: 'revenue-tier',
    title: 'What is your current annual revenue tier?',
    phase: 'Phase Two: Qualification',
    type: 'choice',
    description: 'Our strategic workflows are optimized for different scales of operation.',
    options: [
      { id: 'A', text: '< $1M', nextCardId: 'nurture-form' },
      { id: 'B', text: '$1M - $10M', nextCardId: 'nurture-form' },
      { id: 'C', text: '> $10M', nextCardId: 'enterprise-form' }
    ]
  },
  {
    id: 'nurture-form',
    title: "Let's capture your momentum",
    phase: 'Phase Three: Submission',
    type: 'form',
    description: 'Please provide your contact details to generate your customized Growth Strategy roadmap.',
    formFields: [
      { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Jonathan Doe', required: true },
      { id: 'company', label: 'Company Name', type: 'text', placeholder: 'Nexus Tech', required: true },
      { id: 'email', label: 'Work Email', type: 'email', placeholder: 'j.doe@nexustech.io', required: true },
      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 012-3456', required: false }
    ],
    submitButtonText: 'Generate Roadmap'
  },
  {
    id: 'enterprise-form',
    title: "Let's align with an Enterprise Strategist",
    phase: 'Phase Three: VIP Alignment',
    type: 'form',
    description: 'You qualify for our dedicated high-tier consulting. Enter your details to schedule an immediate VIP consultation.',
    formFields: [
      { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Elena Lopez', required: true },
      { id: 'company', label: 'Company Name', type: 'text', placeholder: 'Retail Spark', required: true },
      { id: 'email', label: 'Work Email', type: 'email', placeholder: 'elena@retailspark.com', required: true },
      { id: 'phone', label: 'Direct Line', type: 'tel', placeholder: '+34 912 345 678', required: true }
    ],
    submitButtonText: 'Connect with Strategist'
  }
];

// Default initial leads matching the exact screenshot entries
export const defaultLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Jonathan Doe',
    company: 'Nexus Tech Solutions',
    email: 'j.doe@nexustech.io',
    phone: '+1 (555) 012-3456',
    choices: [
      { cardId: 'lead-intake', question: 'Primary Strategic Goal', answer: 'Brand Launch' },
      { cardId: 'revenue-tier', question: 'Revenue Tier', answer: 'Digital Audit' },
      { cardId: 'extra', question: 'Strategic Tier', answer: 'Enterprise Tier' }
    ],
    score: 92,
    status: 'Finished',
    timestamp: '2m ago',
    createdTime: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-2',
    name: 'Sarah Al-Farsi',
    company: 'Lumina Architecture',
    email: 'sarah@lumina.arch',
    phone: '+971 50 123 4567',
    choices: [
      { cardId: 'lead-intake', question: 'Primary Strategic Goal', answer: 'Case Studies' },
      { cardId: 'revenue-tier', question: 'Revenue Tier', answer: 'Design Sprints' }
    ],
    score: 65,
    status: 'Finished',
    timestamp: '14m ago',
    createdTime: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-3',
    name: 'Marcus King',
    company: 'Kingpin Venture Capital',
    email: 'marcus@kingpin.vc',
    phone: '+44 20 7946 0123',
    choices: [
      { cardId: 'lead-intake', question: 'Primary Strategic Goal', answer: 'About' },
      { cardId: 'revenue-tier', question: 'Revenue Tier', answer: 'Growth Pack' }
    ],
    score: 40,
    status: 'Abandoned',
    timestamp: '25m ago',
    createdTime: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-4',
    name: 'Elena Lopez',
    company: 'Retail Spark',
    email: 'elena@retailspark.com',
    phone: '+34 912 345 678',
    choices: [
      { cardId: 'lead-intake', question: 'Primary Strategic Goal', answer: 'Contact' },
      { cardId: 'revenue-tier', question: 'Revenue Tier', answer: 'Express Audit' }
    ],
    score: 88,
    status: 'Finished',
    timestamp: '1h ago',
    createdTime: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

export const defaultSettings: AgencySettings = {
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1rU9NVA-UL_VFnPsnmJ8FgGB-BhOwUjE8IGol0rq_S5gkH6Ni-jomWO3oGT-9-_EhImH7X8vj9y4BFMjn_rAHa8H26IyU7z0t0Qs0e8h2sdupTcF3tVUpIn7QcrvUUurRxQs8HSHf877Jb66CzxD0ASeXFk7MSANowF_7kOI2ccAFx4nYfjTUwQux2ChUNl9JqTp2cGEUrDZX9IJa3stFIeBU0lEanzkyJO1RysK1YTHFT2ENldGU2ORR8kI1CATkTsj9gKhqTCOG',
  primaryColor: '#000000',
  accentColor: '#FEA619', // Amber Accent
  salesforceActive: true,
  mailchimpActive: true,
  slackActive: false,
  emailAlerts: true,
  dailySummary: true,
  smsAlerts: false,
  assignmentAlerts: true
};

export const defaultChains: Chain[] = [
  {
    id: 'chain-default',
    name: 'Primary Website Intake',
    cards: defaultCards
  },
  {
    id: 'chain-instagram',
    name: 'Instagram Link-in-Bio Campaign',
    cards: [
      {
        id: 'insta-start',
        title: 'Welcome from Instagram! Select your strategic target:',
        phase: 'Phase One: Inquiry',
        type: 'choice',
        description: 'Exclusive social channels fast-track options.',
        options: [
          { id: 'A', text: 'Brand Identity Makeover', nextCardId: 'insta-form' },
          { id: 'B', text: 'Digital Presence & SEO', nextCardId: 'insta-form' },
          { id: 'C', text: 'Viral Growth Design Sprints', nextCardId: 'insta-form' }
        ]
      },
      {
        id: 'insta-form',
        title: 'Let\'s kickstart your growth trajectory',
        phase: 'Phase Two: Submission',
        type: 'form',
        description: 'Provide your credentials to get connected.',
        formFields: [
          { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Jonathan Doe', required: true },
          { id: 'company', label: 'Brand Name', type: 'text', placeholder: 'Brand Lab', required: true },
          { id: 'email', label: 'Best Email Address', type: 'email', placeholder: 'jonathan@brand.com', required: true }
        ],
        submitButtonText: 'Lock In Consultation'
      }
    ]
  },
  {
    id: 'chain-linkedin',
    name: 'LinkedIn Enterprise Funnel',
    cards: [
      {
        id: 'linkedin-start',
        title: 'What is your operational scale?',
        phase: 'Phase One: Enterprise Inquiry',
        type: 'choice',
        description: 'Designed specifically for professional networks.',
        options: [
          { id: 'A', text: 'Under 50 employees', nextCardId: 'linkedin-smb-form' },
          { id: 'B', text: '50 - 500 employees', nextCardId: 'linkedin-ent-form' },
          { id: 'C', text: '500+ employees', nextCardId: 'linkedin-ent-form' }
        ]
      },
      {
        id: 'linkedin-smb-form',
        title: 'Capturing High-Growth Profile',
        phase: 'Phase Two: Verification',
        type: 'form',
        description: 'We will dispatch customized growth metrics in 15 minutes.',
        formFields: [
          { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Sarah Connor', required: true },
          { id: 'company', label: 'Company Name', type: 'text', placeholder: 'Cyberdyne Systems', required: true },
          { id: 'email', label: 'Professional Email', type: 'email', placeholder: 'sarah@cyberdyne.com', required: true }
        ],
        submitButtonText: 'Generate SMB Metrics'
      },
      {
        id: 'linkedin-ent-form',
        title: 'Unlock Dedicated Corporate Strategy Support',
        phase: 'Phase Two: Executive Alignment',
        type: 'form',
        description: 'We will coordinate a strategic workshop for your leadership team.',
        formFields: [
          { id: 'name', label: 'Executive Name', type: 'text', placeholder: 'John Connor', required: true },
          { id: 'company', label: 'Enterprise Brand', type: 'text', placeholder: 'Cyberdyne Corp', required: true },
          { id: 'email', label: 'Corporate Email', type: 'email', placeholder: 'john@cyberdyne.com', required: true },
          { id: 'phone', label: 'Direct Boardroom Line', type: 'tel', placeholder: '+1 555-9000', required: true }
        ],
        submitButtonText: 'Book VIP Workshop'
      }
    ]
  }
];

// Database state accessor functions
// Background sync helper to avoid circular dependency
const runSupabaseSave = (fn: (lib: any) => Promise<any>) => {
  import('./lib/supabase').then(lib => {
    if (lib.isSupabaseConfigured()) {
      fn(lib).catch(err => console.error('Supabase background sync failed:', err));
    }
  }).catch(err => {
    console.error('Failed to import Supabase client inside background sync:', err);
  });
};

export const loadChains = (): Chain[] => getLocalStorage<Chain[]>('aghaaz_chains', defaultChains);
export const saveChains = (chains: Chain[]): void => {
  setLocalStorage<Chain[]>('aghaaz_chains', chains);
  runSupabaseSave(async (lib) => {
    await lib.dbSaveChains(chains);
  });
};

export const loadActiveChainId = (): string => getLocalStorage<string>('aghaaz_active_chain_id', 'chain-default');
export const saveActiveChainId = (id: string): void => {
  setLocalStorage<string>('aghaaz_active_chain_id', id);
  runSupabaseSave(async (lib) => {
    await lib.dbSaveActiveChainId(id);
  });
};

export const loadCards = (): Card[] => {
  const activeId = loadActiveChainId();
  const chains = loadChains();
  const activeChain = chains.find(c => c.id === activeId) || chains[0];
  return activeChain ? activeChain.cards : defaultCards;
};

export const saveCards = (cards: Card[]): void => {
  const activeId = loadActiveChainId();
  const chains = loadChains();
  const updatedChains = chains.map(c => {
    if (c.id === activeId) {
      return { ...c, cards };
    }
    return c;
  });
  if (!chains.some(c => c.id === activeId)) {
    updatedChains.push({
      id: activeId,
      name: activeId === 'chain-default' ? 'Primary Website Intake' : 'New Chain',
      cards
    });
  }
  saveChains(updatedChains);
};

export const loadLeads = (): Lead[] => getLocalStorage<Lead[]>('aghaaz_leads', defaultLeads);
export const saveLeads = (leads: Lead[]): void => {
  setLocalStorage<Lead[]>('aghaaz_leads', leads);
  runSupabaseSave(async (lib) => {
    await lib.dbSaveAllLeads(leads);
  });
};

export const loadSettings = (): AgencySettings => getLocalStorage<AgencySettings>('aghaaz_settings', defaultSettings);
export const saveSettings = (settings: AgencySettings): void => {
  setLocalStorage<AgencySettings>('aghaaz_settings', settings);
  runSupabaseSave(async (lib) => {
    await lib.dbSaveSettings(settings);
  });
};
