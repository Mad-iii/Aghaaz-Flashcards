import React, { useState, useEffect, useRef } from 'react';
import { Card, CardOption, FormField, Chain } from '../types';
import { loadCards, saveCards, loadChains, saveChains, loadActiveChainId, saveActiveChainId } from '../data';
import { 
  GitFork, 
  Cloud, 
  Sliders, 
  Trash2, 
  Edit3, 
  Settings, 
  X, 
  Plus, 
  HelpCircle,
  Eye,
  Layers,
  ArrowRight,
  List
} from 'lucide-react';

interface FlowBuilderProps {
  onTriggerDeploy: () => void;
  triggerNewCardCount: number; // to listen for additions from parent Sidebar
}

export default function FlowBuilder({ onTriggerDeploy, triggerNewCardCount }: FlowBuilderProps) {
  const [chains, setChains] = useState<Chain[]>([]);
  const [activeChainId, setActiveChainId] = useState<string>('chain-default');
  const [selectedChainId, setSelectedChainId] = useState<string>('chain-default');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isListView, setIsListView] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Form states for the Properties Panel
  const [editTitle, setEditTitle] = useState('');
  const [editPhase, setEditPhase] = useState('');
  const [editType, setEditType] = useState<'choice' | 'form' | 'end'>('choice');
  const [editDescription, setEditDescription] = useState('');
  const [editOptions, setEditOptions] = useState<CardOption[]>([]);
  const [editFormFields, setEditFormFields] = useState<FormField[]>([]);
  const [editSubmitButtonText, setEditSubmitButtonText] = useState('Submit Inquiries');
  const [editNextCardId, setEditNextCardId] = useState<string | null>(null);

  const lastLoadedChainIdRef = useRef<string | null>(null);

  // Initialize and load chains
  useEffect(() => {
    const loadedChains = loadChains();
    const activeId = loadActiveChainId();
    setChains(loadedChains);
    setActiveChainId(activeId);
    setSelectedChainId(activeId);

    // Dynamic Cloud Sync re-hydration
    import('../lib/supabase').then(async (lib) => {
      if (lib.isSupabaseConfigured()) {
        try {
          const dbActiveId = await lib.dbLoadActiveChainId();
          const dbChains = await lib.dbLoadChains();
          
          // Save to local cache
          saveActiveChainId(dbActiveId);
          saveChains(dbChains);
          
          setChains(dbChains);
          setActiveChainId(dbActiveId);
          setSelectedChainId(dbActiveId);
        } catch (err) {
          console.error('Failed to async-sync FlowBuilder chains from Supabase:', err);
        }
      }
    });
  }, []);

  // Update local cards when selected chain changes
  useEffect(() => {
    if (selectedChainId && chains.length > 0) {
      const isChainChanged = lastLoadedChainIdRef.current !== selectedChainId;
      if (isChainChanged) {
        lastLoadedChainIdRef.current = selectedChainId;
        const currentChain = chains.find(c => c.id === selectedChainId);
        if (currentChain) {
          setCards(currentChain.cards);
          setSelectedCardId(null);
        }
      }
    }
  }, [selectedChainId, chains]);

  // Listen to new card request triggered from Sidebar parent
  useEffect(() => {
    if (triggerNewCardCount > 0) {
      handleAddNewCard();
    }
  }, [triggerNewCardCount]);

  const selectedCard = cards.find(c => c.id === selectedCardId);

  // Load selected card values into state when opened
  const handleSelectCard = (card: Card) => {
    setSelectedCardId(card.id);
    setEditTitle(card.title);
    setEditPhase(card.phase);
    setEditType(card.type);
    setEditDescription(card.description || '');
    setEditOptions(card.options || []);
    setEditFormFields(card.formFields || []);
    setEditSubmitButtonText(card.submitButtonText || 'Submit Inquiries');
    setEditNextCardId(card.nextCardId || null);
  };

  const handleCreateChain = () => {
    const name = prompt('Enter a name for your new strategic flow chain:', 'Marketing Campaign');
    if (!name || name.trim() === '') return;

    const newChainId = `chain-${Date.now()}`;
    const newChain: Chain = {
      id: newChainId,
      name: name.trim(),
      cards: [
        {
          id: 'start-node',
          title: 'Welcome! What is your interest?',
          phase: 'Phase One: Contact',
          type: 'choice',
          description: 'Initial entry point for this campaign.',
          options: [
            { id: 'A', text: 'Strategic Growth Services', nextCardId: null },
            { id: 'B', text: 'General Questions', nextCardId: null }
          ]
        }
      ]
    };

    const updatedChains = [...chains, newChain];
    setChains(updatedChains);
    saveChains(updatedChains);
    setSelectedChainId(newChainId);
    setIsSaved(true);
    alert(`Successfully created "${name.trim()}"! Feel free to add more nodes and build your chain.`);
  };

  const handleRenameChain = () => {
    const currentChain = chains.find(c => c.id === selectedChainId);
    if (!currentChain) return;

    const name = prompt(`Rename flow "${currentChain.name}" to:`, currentChain.name);
    if (!name || name.trim() === '') return;

    const updatedChains = chains.map(ch => {
      if (ch.id === selectedChainId) {
        return { ...ch, name: name.trim() };
      }
      return ch;
    });
    setChains(updatedChains);
    saveChains(updatedChains);
    alert(`Flow chain renamed to "${name.trim()}"`);
  };

  const handleDeleteChain = () => {
    if (chains.length <= 1) {
      alert('Cannot delete the last remaining flow chain.');
      return;
    }
    const currentChain = chains.find(c => c.id === selectedChainId);
    if (!currentChain) return;

    const confirmed = window.confirm(`Are you absolutely sure you want to delete the flow chain "${currentChain.name}"? This will delete all its configured cards.`);
    if (!confirmed) return;

    const updatedChains = chains.filter(ch => ch.id !== selectedChainId);
    setChains(updatedChains);
    saveChains(updatedChains);
    
    // Fallback to another chain
    const nextChainId = updatedChains[0].id;
    setSelectedChainId(nextChainId);
    
    // If deleted the active chain, set active to the remaining one
    if (activeChainId === selectedChainId) {
      saveActiveChainId(nextChainId);
      setActiveChainId(nextChainId);
    }
    alert('Flow chain deleted successfully.');
  };

  const handleAddNewCard = () => {
    const newId = `card-${Date.now()}`;
    const newCard: Card = {
      id: newId,
      title: 'New Question Prompt',
      phase: 'Phase Quad: Optimization',
      type: 'choice',
      description: 'Select the primary path options below to link forward.',
      options: [
        { id: 'A', text: 'Success Option', nextCardId: null }
      ]
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);

    const updatedChains = chains.map(ch => {
      if (ch.id === selectedChainId) {
        return { ...ch, cards: updatedCards };
      }
      return ch;
    });
    setChains(updatedChains);
    saveChains(updatedChains);
    handleSelectCard(newCard);
    setIsSaved(false);
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this card?');
    if (!confirmed) return;

    const updatedCards = cards.filter(c => c.id !== id);
    setCards(updatedCards);

    const updatedChains = chains.map(ch => {
      if (ch.id === selectedChainId) {
        return { ...ch, cards: updatedCards };
      }
      return ch;
    });
    setChains(updatedChains);
    saveChains(updatedChains);

    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
    setIsSaved(false);
  };

  const handleSaveChanges = () => {
    if (!selectedCardId) return;

    const updatedCards = cards.map(c => {
      if (c.id === selectedCardId) {
        return {
          ...c,
          title: editTitle,
          phase: editPhase,
          type: editType,
          description: editDescription,
          options: editType === 'choice' ? editOptions : undefined,
          formFields: editType === 'form' ? editFormFields : undefined,
          submitButtonText: editType === 'form' ? editSubmitButtonText : undefined,
          nextCardId: editType === 'form' ? editNextCardId : undefined
        };
      }
      return c;
    });

    setCards(updatedCards);

    const updatedChains = chains.map(ch => {
      if (ch.id === selectedChainId) {
        return { ...ch, cards: updatedCards };
      }
      return ch;
    });
    setChains(updatedChains);
    saveChains(updatedChains);
    setIsSaved(true);

    setTimeout(() => {
      alert('Card changes saved to this chain successfully! Click Deploy in the toolbar to activate this chain as the live default.');
    }, 100);
  };

  // Option actions inside Property Panel
  const handleAddOption = () => {
    const nextOptionId = String.fromCharCode(65 + editOptions.length); // A, B, C...
    const newOption: CardOption = {
      id: nextOptionId,
      text: 'Custom Option Label',
      nextCardId: null
    };
    setEditOptions([...editOptions, newOption]);
    setIsSaved(false);
  };

  const handleOptionTextChange = (idx: number, text: string) => {
    const updated = [...editOptions];
    updated[idx].text = text;
    setEditOptions(updated);
    setIsSaved(false);
  };

  const handleOptionLinkChange = (idx: number, nextId: string | null) => {
    const updated = [...editOptions];
    updated[idx].nextCardId = nextId === 'none' ? null : nextId;
    setEditOptions(updated);
    setIsSaved(false);
  };

  const handleDeleteOption = (idx: number) => {
    const updated = editOptions.filter((_, i) => i !== idx).map((opt, i) => ({
      ...opt,
      id: String.fromCharCode(65 + i) // Re-index letters A, B, C
    }));
    setEditOptions(updated);
    setIsSaved(false);
  };

  const handleAddFormField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Form Field',
      type: 'text',
      placeholder: 'Enter response...',
      required: true
    };
    setEditFormFields([...editFormFields, newField]);
    setIsSaved(false);
  };

  const handleFormFieldChange = (idx: number, updatedField: Partial<FormField>) => {
    const updated = [...editFormFields];
    updated[idx] = { ...updated[idx], ...updatedField };
    setEditFormFields(updated);
    setIsSaved(false);
  };

  const handleDeleteFormField = (idx: number) => {
    const updated = editFormFields.filter((_, i) => i !== idx);
    setEditFormFields(updated);
    setIsSaved(false);
  };

  const handleDeployChain = () => {
    saveActiveChainId(selectedChainId);
    setActiveChainId(selectedChainId);
    setIsSaved(true);
    alert(`Deployment successful! "${chains.find(c => c.id === selectedChainId)?.name}" is now the active live funnel.`);
    if (onTriggerDeploy) {
      onTriggerDeploy();
    }
  };

  return (
    <div className="flex-grow flex-1 min-h-screen bg-[#0A0B0D] font-sans flex flex-col overflow-hidden relative text-slate-200">
      
      {/* Schematic Toolbar Header */}
      <header className="h-20 bg-[#0F1115] border-b border-slate-800/60 px-8 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-lg font-bold text-white tracking-tight leading-none">
            Strategic Flow Builder
          </h2>
          <div className="h-6 w-px bg-slate-800"></div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1A1D23] border border-slate-800 rounded">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              {isSaved ? 'All Changes Synced' : 'Unsaved Changes'}
            </span>
          </div>
        </div>

        {/* Chain Workspace Management Controls */}
        <div className="flex items-center gap-2 bg-[#1A1D23] px-3 py-1.5 rounded-lg border border-slate-800 flex-wrap sm:flex-nowrap">
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">Flow Chain:</span>
          <select 
            value={selectedChainId} 
            onChange={(e) => setSelectedChainId(e.target.value)}
            className="bg-[#0F1115] text-xs text-indigo-300 border border-slate-800/80 rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer font-bold"
          >
            {chains.map(ch => (
              <option key={ch.id} value={ch.id}>
                {ch.name} {ch.id === activeChainId ? '★ (Live)' : ''}
              </option>
            ))}
          </select>

          <button 
            onClick={handleCreateChain}
            className="p-1.5 hover:bg-[#0F1115] text-indigo-400 hover:text-indigo-300 rounded transition-colors cursor-pointer"
            title="Create New Flow Chain"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleRenameChain}
            className="p-1.5 hover:bg-[#0F1115] text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Rename Selected Chain"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleDeleteChain}
            className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
            title="Delete Selected Chain"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Node vs List view switchers */}
          <div className="flex bg-[#1A1D23] rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setIsListView(false)}
              className={`px-3.5 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                !isListView ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Node View
            </button>
            <button 
              onClick={() => setIsListView(true)}
              className={`px-3.5 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                isListView ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
          </div>

          {selectedChainId === activeChainId ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Funnel
            </div>
          ) : (
            <button 
              onClick={handleDeployChain}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5"
            >
              Deploy &amp; Activate
            </button>
          )}
        </div>
      </header>

      {/* Schematic Node Workspace Canvas */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* Canvas Area */}
        <div 
          className="flex-1 overflow-auto p-12 bg-[#0A0B0D] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] relative"
          id="blueprint-canvas"
          onClick={() => setSelectedCardId(null)}
        >
          {!isListView ? (
            // NODE SCHEMATIC VIEW
            <div className="relative min-h-[500px] w-full flex flex-wrap gap-8 items-start">
              
              {/* Connected Connector Wire Layer (Simulated dynamic cables) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible opacity-40 hidden lg:block">
                {cards.map((card, cardIdx) => {
                  const cables: React.ReactNode[] = [];
                  
                  if (card.options) {
                    card.options.forEach((opt, optIdx) => {
                      if (opt.nextCardId) {
                        const targetIdx = cards.findIndex(c => c.id === opt.nextCardId);
                        if (targetIdx !== -1) {
                          const startY = 150 + cardIdx * 160 + optIdx * 35;
                          const startX = 260;
                          const endY = 150 + targetIdx * 160;
                          const endX = 380;
                          cables.push(
                            <path 
                              key={`${card.id}-${opt.id}-${optIdx}`}
                              d={`M ${startX} ${startY} C ${startX + 80} ${startY}, ${endX - 80} ${endY}, ${endX} ${endY}`}
                              fill="none" 
                              stroke="#6366f1" 
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                          );
                        }
                      }
                    });
                  }
                  
                  if (card.type === 'form' && card.nextCardId) {
                    const targetIdx = cards.findIndex(c => c.id === card.nextCardId);
                    if (targetIdx !== -1) {
                      const startY = 150 + cardIdx * 160 + 40;
                      const startX = 260;
                      const endY = 150 + targetIdx * 160;
                      const endX = 380;
                      cables.push(
                        <path 
                          key={`${card.id}-form-link`}
                          d={`M ${startX} ${startY} C ${startX + 80} ${startY}, ${endX - 80} ${endY}, ${endX} ${endY}`}
                          fill="none" 
                          stroke="#818cf8" 
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                      );
                    }
                  }
                  
                  return cables;
                })}
              </svg>

              {/* Dynamic node cards rendering */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full z-10 relative">
                {cards.map((card, index) => {
                  const isSelected = selectedCardId === card.id;
                  const isEntry = card.id === 'lead-intake';
                  
                  return (
                    <div 
                      key={card.id}
                      onClick={(e) => { e.stopPropagation(); handleSelectCard(card); }}
                      className={`bg-[#0F1115] border-2 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer transition-all duration-200 relative group text-left ${
                        isSelected 
                          ? 'border-indigo-500 ring-4 ring-indigo-500/15' 
                          : isEntry 
                          ? 'border-slate-500' 
                          : 'border-slate-800/80 hover:border-slate-700/80'
                      }`}
                    >
                      {/* Node Header Row */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold border border-slate-700/50">
                            #{index + 1}
                          </span>
                          <span className={`font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                            isEntry 
                              ? 'bg-slate-850 text-indigo-300 border border-indigo-500/20' 
                              : card.type === 'form' 
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isEntry ? 'ENTRY POINT' : card.type.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSelectCard(card); }}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors cursor-pointer"
                            title="Edit Node"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {!isEntry && (
                            <button 
                              onClick={(e) => handleDeleteCard(card.id, e)}
                              className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                              title="Delete Node"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Body */}
                      <h3 className="font-sans text-sm font-bold text-white mb-1.5 truncate">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {card.description || 'Initial screening triggers.'}
                      </p>

                      {/* Display outgoing connections preview */}
                      {card.type === 'choice' && card.options && (
                        <div className="space-y-1.5 mt-2 border-t border-slate-800/50 pt-3">
                          {card.options.map((opt) => (
                            <div 
                              key={opt.id}
                              className="bg-[#1A1D23] border border-slate-800/80 px-2.5 py-1.5 rounded text-[10px] font-sans font-medium flex justify-between items-center"
                            >
                              <span className="text-slate-400 font-mono font-bold mr-2">{opt.id}</span>
                              <span className="truncate flex-1 text-slate-200">{opt.text}</span>
                              {opt.nextCardId && (() => {
                                const targetIdx = cards.findIndex(c => c.id === opt.nextCardId);
                                const targetCard = cards[targetIdx];
                                if (targetIdx !== -1 && targetCard) {
                                  return (
                                    <span className="font-mono text-[8px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded ml-2 max-w-[120px] truncate border border-indigo-500/20" title={`Leads to: Card ${targetIdx + 1}: ${targetCard.title}`}>
                                      → #{targetIdx + 1}: {targetCard.title}
                                    </span>
                                  );
                                }
                                return (
                                  <span className="font-mono text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded ml-2 max-w-[60px] truncate border border-amber-500/20">
                                    → End
                                  </span>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      )}

                      {card.type === 'form' && card.formFields && (
                        <div className="space-y-1 text-[10px] text-slate-500 font-mono border-t border-slate-800/50 pt-3 mt-2">
                          <p>Fields: {card.formFields.map(f=>f.label).join(', ')}</p>
                        </div>
                      )}

                      {/* Node Connection Port Markers */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-[#0A0B0D] shadow-xs"></div>
                      {!isEntry && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2.5 h-2.5 rounded-full bg-slate-500 border border-[#0A0B0D] shadow-xs"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // TRADITIONAL LIST VIEW
            <div className="max-w-[800px] mx-auto bg-[#0F1115] border border-slate-800/80 rounded-xl overflow-hidden shadow-xs text-left animate-slide-up">
              <div className="px-5 py-4 border-b border-slate-800/80 bg-[#1A1D23]/40">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                  Sequencing Order of Cards ({cards.length})
                </span>
              </div>
              <div className="divide-y divide-slate-800/40">
                {cards.map((card, idx) => (
                  <div 
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className="p-5 hover:bg-slate-800/20 transition-colors cursor-pointer flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <span className="font-mono text-xs text-slate-500 font-bold shrink-0">
                        {idx + 1}.
                      </span>
                      <div className="overflow-hidden">
                        <p className="font-sans text-xs font-bold text-white truncate leading-tight">
                          {card.title}
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-indigo-400 mt-1.5 font-semibold">
                          Type: {card.type} ● {card.phase}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelectCard(card); }}
                        className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 cursor-pointer"
                        title="Edit Card"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {card.id !== 'lead-intake' && (
                        <button 
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          className="p-1.5 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Action FAB Plus Trigger */}
          <div className="absolute bottom-12 right-12 flex flex-col gap-3">
            <button 
              onClick={handleAddNewCard}
              className="w-14 h-14 bg-indigo-600 text-white hover:bg-indigo-500 rounded-full shadow-xl shadow-indigo-600/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer" 
              title="Add New Card Node"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Node Properties Right Sidebar Panel */}
        <div 
          className={`w-80 bg-[#0F1115] border-l border-slate-800/80 shrink-0 transform transition-transform duration-300 relative z-40 flex flex-col justify-between shadow-2xl ${
            selectedCardId ? 'translate-x-0' : 'translate-x-full hidden'
          }`}
          id="properties-panel"
        >
          <div className="p-6 overflow-y-auto flex-grow space-y-6 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Card #{selectedCardId ? cards.findIndex(c => c.id === selectedCardId) + 1 : ''} Properties
              </h3>
              <button 
                onClick={() => setSelectedCardId(null)}
                className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Question Title</label>
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => { setEditTitle(e.target.value); setIsSaved(false); }}
                className="w-full px-3 py-2 text-xs bg-[#1A1D23] border border-slate-800/80 rounded focus:outline-none focus:border-indigo-500 font-semibold text-slate-200"
              />
            </div>

            {/* Phase */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Intake Phase</label>
              <input 
                type="text" 
                value={editPhase}
                onChange={(e) => { setEditPhase(e.target.value); setIsSaved(false); }}
                className="w-full px-3 py-2 text-xs bg-[#1A1D23] border border-slate-800/80 rounded focus:outline-none focus:border-indigo-500 font-mono text-slate-200"
              />
            </div>

            {/* Card Type */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Card Action Type</label>
              <select
                value={editType}
                onChange={(e) => { setEditType(e.target.value as 'choice' | 'form'); setIsSaved(false); }}
                className="w-full px-3 py-2 text-xs bg-[#1A1D23] border border-slate-800/80 rounded focus:outline-none focus:border-indigo-500 font-sans text-slate-200 cursor-pointer"
              >
                <option value="choice">Multi-Choice Question</option>
                <option value="form">Contact Info Form</option>
              </select>
            </div>

            {/* Small print */}
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Bottom Small Print</label>
              <textarea 
                value={editDescription}
                onChange={(e) => { setEditDescription(e.target.value); setIsSaved(false); }}
                className="w-full px-3 py-2 text-xs bg-[#1A1D23] border border-slate-800/80 rounded focus:outline-none focus:border-indigo-500 font-sans text-slate-400 h-16 resize-none"
              />
            </div>

            {/* Answers List if choice */}
            {editType === 'choice' && (
              <div className="bg-[#1A1D23]/40 border border-slate-800/80 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Answers &amp; Links</span>
                  <button 
                    onClick={handleAddOption}
                    className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider cursor-pointer"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {editOptions.map((opt, idx) => (
                    <div key={opt.id + idx} className="bg-[#1A1D23] border border-slate-800 p-2.5 rounded shadow-2xs space-y-2 relative group/opt">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400">{opt.id}</span>
                        <input 
                          type="text" 
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          className="flex-1 px-1.5 py-0.5 text-xs bg-[#1A1D23] text-slate-100 border-b border-slate-800 hover:border-indigo-500 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                        <button 
                          onClick={() => handleDeleteOption(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                          title="Delete Option"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans pt-1 border-t border-slate-800/40">
                        <span>leads to:</span>
                        <select
                          value={opt.nextCardId || 'none'}
                          onChange={(e) => handleOptionLinkChange(idx, e.target.value)}
                          className="bg-[#0F1115] border border-slate-800 font-bold text-slate-300 rounded text-[9px] py-0.5 px-2 font-sans cursor-pointer focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="none">Exit Flow (End)</option>
                          {cards.filter(c => c.id !== selectedCardId).map(c => {
                            const cIdx = cards.findIndex(card => card.id === c.id);
                            return (
                              <option key={c.id} value={c.id}>Card {cIdx + 1}: "{c.title}"</option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  {editOptions.length === 0 && (
                    <p className="text-[10px] text-slate-500 italic text-center">No options configured for this card</p>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields List if form */}
            {editType === 'form' && (
              <div className="bg-[#1A1D23]/40 border border-slate-800/80 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Form Fields</span>
                  <button 
                    onClick={handleAddFormField}
                    className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider cursor-pointer"
                  >
                    + Add Field
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {editFormFields.map((field, idx) => (
                    <div key={field.id} className="bg-[#1A1D23] border border-slate-800 p-2.5 rounded shadow-2xs space-y-2 relative">
                      <div className="flex items-center gap-2 justify-between">
                        <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Field #{idx + 1}</span>
                        <button 
                          onClick={() => handleDeleteFormField(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                          title="Delete Field"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Label</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={(e) => handleFormFieldChange(idx, { label: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-[#0F1115] text-slate-100 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => handleFormFieldChange(idx, { type: e.target.value as any })}
                            className="w-full px-2 py-1 text-xs bg-[#0F1115] text-slate-100 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                          >
                            <option value="text">Text Input</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone (Tel)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Required</label>
                          <select
                            value={field.required ? 'yes' : 'no'}
                            onChange={(e) => handleFormFieldChange(idx, { required: e.target.value === 'yes' })}
                            className="w-full px-2 py-1 text-xs bg-[#0F1115] text-slate-100 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                          >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Placeholder</label>
                        <input 
                          type="text" 
                          value={field.placeholder || ''}
                          onChange={(e) => handleFormFieldChange(idx, { placeholder: e.target.value })}
                          className="w-full px-2 py-1 text-xs bg-[#0F1115] text-slate-100 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                    </div>
                  ))}

                  {editFormFields.length === 0 && (
                    <p className="text-[10px] text-slate-500 italic text-center">No fields configured for this form</p>
                  )}
                </div>

                {/* Submit button customizer */}
                <div className="pt-2 border-t border-slate-800/40 space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">Submit Button Text</label>
                  <input 
                    type="text" 
                    value={editSubmitButtonText}
                    onChange={(e) => { setEditSubmitButtonText(e.target.value); setIsSaved(false); }}
                    className="w-full px-3 py-2 text-xs bg-[#1A1D23] border border-slate-800 rounded focus:outline-none focus:border-indigo-500 font-semibold text-slate-200"
                    placeholder="Submit Inquiries"
                  />
                </div>

                {/* Next Card Destination for Form */}
                <div className="pt-2 border-t border-slate-800/40 space-y-2">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">Next Card Destination</label>
                  <div className="flex items-center justify-between text-xs bg-[#1A1D23] border border-slate-800/80 px-2.5 py-1.5 rounded">
                    <span className="text-slate-400 font-sans text-[11px]">leads to:</span>
                    <select
                      value={editNextCardId || 'none'}
                      onChange={(e) => { setEditNextCardId(e.target.value === 'none' ? null : e.target.value); setIsSaved(false); }}
                      className="bg-[#0F1115] border border-slate-800 font-bold text-slate-300 rounded text-[9px] py-1 px-1.5 font-sans cursor-pointer focus:ring-1 focus:ring-indigo-500 max-w-[150px] truncate"
                    >
                      <option value="none">Exit Flow (End &amp; Submit)</option>
                      {cards.filter(c => c.id !== selectedCardId).map(c => {
                        const cIdx = cards.findIndex(card => card.id === c.id);
                        return (
                          <option key={c.id} value={c.id}>Card {cIdx + 1}: "{c.title}"</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Properties footer trigger sync */}
          <div className="p-6 border-t border-slate-800/60 flex gap-2 shrink-0 bg-[#1A1D23]/40">
            <button 
              onClick={handleSaveChanges}
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-bold py-2.5 px-4 rounded-lg uppercase tracking-wider text-center shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
            >
              Save Card
            </button>
            <button 
              onClick={() => setSelectedCardId(null)}
              className="border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-mono py-2.5 px-4 rounded-lg uppercase tracking-wider text-center cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
