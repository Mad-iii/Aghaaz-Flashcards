import React, { useState, useEffect, useRef } from 'react';
import { Card, Lead, ChoiceRecord, CardOption } from '../types';
import { loadCards, loadLeads, saveLeads, loadSettings, saveSettings, saveActiveChainId, saveChains } from '../data';
import { ArrowRight, CheckCircle, RefreshCw, Sliders, ChevronLeft } from 'lucide-react';

interface ClientFlowProps {
  onNavigateToAdmin: (tab?: string) => void;
}

export default function ClientFlow({ onNavigateToAdmin }: ClientFlowProps) {
  const [cards, setCards] = useState<Card[]>(() => loadCards());
  const [settings, setSettings] = useState<any>(() => loadSettings());

  // Find the entry card
  const entryCard = cards.find(c => c.id === 'lead-intake') || cards[0];

  const [currentCardId, setCurrentCardId] = useState<string>(() => {
    const initialCards = loadCards();
    const entry = initialCards.find(c => c.id === 'lead-intake') || initialCards[0];
    return entry?.id || '';
  });

  // Fetch live flow and settings from Supabase if configured
  useEffect(() => {
    import('../lib/supabase').then(async (lib) => {
      if (lib.isSupabaseConfigured()) {
        try {
          const dbSettings = await lib.dbLoadSettings();
          const dbActiveId = await lib.dbLoadActiveChainId();
          const dbChains = await lib.dbLoadChains();
          
          // Cache locally
          saveSettings(dbSettings);
          saveActiveChainId(dbActiveId);
          saveChains(dbChains);

          setSettings(dbSettings);
          
          const activeChain = dbChains.find(c => c.id === dbActiveId) || dbChains[0];
          if (activeChain) {
            setCards(activeChain.cards);
            
            // If the user hasn't made progress, update current card to live entry
            if (history.length === 0 && choices.length === 0) {
              const entry = activeChain.cards.find(c => c.id === 'lead-intake') || activeChain.cards[0];
              if (entry) {
                setCurrentCardId(entry.id);
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync live client flow from Supabase:', err);
        }
      }
    });
  }, []);
  const [history, setHistory] = useState<string[]>([]);
  const [choices, setChoices] = useState<ChoiceRecord[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [newLead, setNewLead] = useState<Lead | null>(null);
  const flowStartTimeRef = useRef<number>(Date.now());

  // Parallax ref
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Get active card
  const activeCard = cards.find(c => c.id === currentCardId);

  // Handle subtle mouse parallax effect for premium aesthetic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeCardRef.current) return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (e.clientX - centerX) / 90;
      const moveY = (e.clientY - centerY) / 90;
      activeCardRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calculate current step number and percentage for progress bar
  const totalSteps = cards.length + 1; // including final submission
  const currentStepNum = Math.min(history.length + 1, totalSteps - 1);
  const progressPercent = Math.round((currentStepNum / (totalSteps - 1)) * 100);

  const handleOptionSelect = (option: CardOption) => {
    if (!activeCard) return;

    // Record choice
    const newChoices = [
      ...choices.filter(c => c.cardId !== activeCard.id),
      {
        cardId: activeCard.id,
        question: activeCard.title,
        answer: option.text,
      }
    ];
    setChoices(newChoices);

    if (option.nextCardId) {
      setHistory([...history, activeCard.id]);
      setCurrentCardId(option.nextCardId);
    } else {
      // No next card, default behavior is to go to the first form card
      const formCard = cards.find(c => c.type === 'form');
      if (formCard) {
        setHistory([...history, activeCard.id]);
        setCurrentCardId(formCard.id);
      } else {
        submitLeadDirectly(newChoices);
      }
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard) return;

    if (activeCard.nextCardId) {
      // If there is a next card linked, proceed forward
      setHistory([...history, activeCard.id]);
      setCurrentCardId(activeCard.nextCardId);
    } else {
      // Terminate and submit lead
      const name = formData['name'] || formData['full-name'] || formData['fullName'] || formData['fullname'] || 'Anonymous Client';
      const company = formData['company'] || formData['company-name'] || formData['companyName'] || 'Self Employed';
      const email = formData['email'] || formData['work-email'] || formData['workEmail'] || 'client@example.com';
      const phone = formData['phone'] || formData['phone-number'] || formData['phoneNumber'] || 'N/A';

      // Momentum score generation
      const calculatedScore = Math.floor(Math.random() * 15) + 80;
      const durationSeconds = Math.round((Date.now() - flowStartTimeRef.current) / 1000);

      const leads = loadLeads();
      const leadId = `lead-${Date.now()}`;
      const newLeadRecord: Lead = {
        id: leadId,
        name,
        company,
        email,
        phone,
        choices,
        score: calculatedScore,
        status: 'Finished',
        timestamp: 'Just now',
        createdTime: new Date().toISOString(),
        durationSeconds
      };

      const updatedLeads = [newLeadRecord, ...leads];
      saveLeads(updatedLeads);

      setNewLead(newLeadRecord);
      setIsCompleted(true);
    }
  };

  const submitLeadDirectly = (finalChoices: ChoiceRecord[]) => {
    const leads = loadLeads();
    const leadId = `lead-${Date.now()}`;
    const newLeadRecord: Lead = {
      id: leadId,
      name: 'Direct Visitor',
      company: 'Inquiry Flow',
      email: 'visitor@aghaaz.com',
      phone: 'N/A',
      choices: finalChoices,
      score: 75,
      status: 'Finished',
      timestamp: 'Just now',
      createdTime: new Date().toISOString()
    };

    saveLeads([newLeadRecord, ...leads]);
    setNewLead(newLeadRecord);
    setIsCompleted(true);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevId = newHistory.pop()!;
    setHistory(newHistory);
    setCurrentCardId(prevId);
  };

  const handleRestart = () => {
    setCurrentCardId(entryCard?.id || '');
    setHistory([]);
    setChoices([]);
    setFormData({});
    setIsCompleted(false);
    setNewLead(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#0A0B0D] text-slate-200 font-sans bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px]">
      
      {/* Top Navbar */}
      <header className="flex justify-between items-center w-full px-5 md:px-16 py-4 bg-transparent z-40">
        <div className="flex items-center gap-3">
          <img 
            alt="Aghaaz Logo" 
            className="h-10 md:h-12 w-auto object-contain bg-slate-900/60 p-1 rounded border border-slate-800" 
            src={settings.logoUrl} 
          />
          <span className="hidden md:inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Live client experience
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigateToAdmin('dashboard')}
            className="flex items-center gap-2 px-4 py-2 border border-slate-800 text-slate-200 bg-[#0F1115]/80 backdrop-blur hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all text-xs font-mono font-medium rounded-lg shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            Admin Console
          </button>
          
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-400 hover:text-white transition-all"
            id="instagram-link"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fillRule="evenodd" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-grow flex items-center justify-center px-4 md:px-0 relative">
        <div className="relative w-full max-w-[430px] aspect-[4/5] flex items-center justify-center">
          
          {/* Card 3 (Bottom-most stack visual) */}
          <div className="absolute w-full h-full bg-[#0F1115] border border-slate-800/80 rounded-2xl transform translate-y-8 translate-x-3 rotate-3 opacity-30 shadow-lg pointer-events-none duration-500 ease-out"></div>
          
          {/* Card 2 (Middle stack visual) */}
          <div className="absolute w-full h-full bg-[#0F1115] border border-slate-800/80 rounded-2xl transform translate-y-4 translate-x-1.5 rotate-1 opacity-70 shadow-md pointer-events-none duration-300 ease-out"></div>

          {/* Active Card Container with Mouse Move Parallax */}
          <div 
            ref={activeCardRef}
            id="active-card"
            className="absolute w-full h-full bg-[#0F1115] border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col justify-between z-10 transition-transform duration-300 ease-out animate-slide-up"
          >
            {!isCompleted ? (
              activeCard ? (
                <>
                  {/* Phase & Title Row */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
                          {activeCard.phase}
                        </span>
                      </div>
                      
                      {history.length > 0 && (
                        <button 
                          onClick={handleBack}
                          className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-white transition-colors"
                          id="back-button"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          BACK
                        </button>
                      )}
                    </div>
                    
                    <h1 className="font-display text-2xl md:text-[28px] text-white font-bold tracking-tight leading-[1.25] mb-5">
                      {activeCard.title}
                    </h1>
                  </div>

                  {/* Options Selector or Form Body */}
                  <div className="flex-grow flex flex-col justify-center space-y-3 overflow-y-auto pr-1">
                    {activeCard.type === 'choice' && activeCard.options && (
                      activeCard.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(opt)}
                          className="w-full text-left p-4 rounded-xl border border-slate-800 hover:border-indigo-500/80 transition-all flex items-center bg-[#1A1D23] hover:bg-indigo-600 hover:text-white group duration-150 shadow-sm"
                        >
                          <div className="w-7 h-7 rounded-lg border border-slate-800 bg-slate-900 group-hover:border-white/30 flex items-center justify-center mr-4 text-[11px] font-mono font-semibold text-slate-400 group-hover:text-white shrink-0">
                            {opt.id}
                          </div>
                          <span className="font-sans text-[15px] font-medium leading-normal text-slate-200 group-hover:text-white flex-grow">
                            {opt.text}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                        </button>
                      ))
                    )}

                    {activeCard.type === 'form' && activeCard.formFields && (
                      <form onSubmit={handleFormSubmit} className="space-y-3.5 w-full">
                        {activeCard.formFields.map((field) => (
                          <div key={field.id} className="text-left">
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type={field.type}
                              required={field.required}
                              placeholder={field.placeholder}
                              value={formData[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-900/60 text-white placeholder-slate-500"
                            />
                          </div>
                        ))}
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all py-3 px-4 rounded-lg font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/20"
                        >
                          {activeCard.submitButtonText || 'Submit Inquiries'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Strategic Small Print Context */}
                  {activeCard.description && (
                    <p className="mt-6 font-sans text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4 text-center">
                      {activeCard.description}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sliders className="w-12 h-12 text-slate-600 animate-pulse mb-4" />
                  <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">No active cards found</p>
                  <button onClick={handleRestart} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 font-mono text-xs rounded-lg transition-colors">
                    RESTART FLOW
                  </button>
                </div>
              )
            ) : (
              // Success Completed State View
              <div className="flex flex-col h-full justify-between py-2 text-center animate-slide-up">
                <div className="my-auto">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-indigo-400" />
                  </div>
                  
                  <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-bold block mb-2">
                    Strategic Spark Activated
                  </span>
                  
                  <h1 className="font-display text-[26px] font-bold tracking-tight text-white leading-tight mb-4">
                    Inquiry Locked &amp; Loaded
                  </h1>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 mb-6 max-h-[160px] overflow-y-auto">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
                      <span className="text-[10px] font-mono text-slate-500">LEAD ID</span>
                      <span className="text-[10px] font-mono text-slate-200 font-semibold truncate max-w-[120px]">{newLead?.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Name</span>
                      <span className="text-xs text-slate-200 font-medium">{newLead?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Company</span>
                      <span className="text-xs text-slate-200 font-medium">{newLead?.company}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Momentum Score</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">{newLead?.score}%</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-4">
                    Your agency inquiry has been logged securely in our database. Our strategy team will review your requirements and reach out to you within 24 hours.
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/60">
                  <button 
                    onClick={handleRestart}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer Area */}
      <footer className="flex justify-between items-center w-full px-5 md:px-16 py-6 bg-transparent z-40">
        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-4">
          <span className="tracking-widest uppercase">
            STEP {currentStepNum} / {totalSteps - 1}
          </span>
        </div>

        {/* Progress Bar centered in desktop */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-48 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-700 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex gap-6">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider select-none">
            Privacy
          </span>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider select-none">
            Terms
          </span>
        </div>
      </footer>

    </div>
  );
}
