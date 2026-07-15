import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, ArrowLeft, Key, Delete } from 'lucide-react';

interface AdminLockScreenProps {
  onVerify: (password: string) => boolean;
  onCancel: () => void;
}

export default function AdminLockScreen({ onVerify, onCancel }: AdminLockScreenProps) {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatically focus on the hidden passcode input for physical keyboard entry
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const isCorrect = onVerify(password);
    if (isCorrect) {
      setPassword('');
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setError('DECRYPTION FAILURE: Master passcode invalid.');
      setPassword('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (char: string) => {
    setError(null);
    if (password.length < 12) {
      setPassword(prev => prev + char);
    }
  };

  const handleClear = () => {
    setPassword('');
    setError(null);
  };

  const handleDelete = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const keyPadNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="min-h-screen bg-[#07080A] flex flex-col items-center justify-center relative p-6 overflow-hidden select-none">
      
      {/* Visual cyber mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0F1115]/90 border border-slate-800/85 backdrop-blur-md rounded-2xl p-8 relative shadow-2xl z-10">
        
        {/* Lock Screen Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
            error 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-bounce' 
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}>
            <Lock className="w-5 h-5" />
          </div>
          
          <h2 className="font-display text-lg font-bold text-white mt-4 tracking-tight uppercase">
            Aghaaz Control Gate
          </h2>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-1">
            Secure Administrator Authentication
          </p>
        </div>

        {/* Hidden Input field for focusing physical keyboard */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={handleKeyDown}
          className="sr-only"
          maxLength={12}
          autoComplete="off"
        />

        {/* Keypad Display Dots */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="flex flex-col items-center justify-center bg-[#07080A] border border-slate-900 rounded-xl p-5 mb-6 cursor-pointer group"
        >
          <div className="flex gap-3 justify-center items-center h-6">
            {password.length === 0 ? (
              <span className="text-slate-600 font-mono text-[11px] uppercase tracking-wider animate-pulse">
                Click here or type passcode
              </span>
            ) : (
              Array.from({ length: password.length }).map((_, idx) => (
                <div key={idx} className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
              ))
            )}
          </div>
          {error && (
            <p className="text-rose-400 font-mono text-[9px] uppercase tracking-wider mt-3 font-semibold">
              {error}
            </p>
          )}
        </div>

        {/* Tactical Touch Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {keyPadNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-14 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800/50 text-white rounded-xl font-mono text-lg font-bold transition-all flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}
          
          {/* Action buttons (Clear, 0, Backspace) */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 bg-[#1A1115]/50 hover:bg-rose-950/20 active:bg-rose-900/30 border border-rose-900/20 text-rose-400 rounded-xl font-mono text-[10px] uppercase tracking-wider font-semibold transition-all flex items-center justify-center cursor-pointer"
          >
            Clear
          </button>
          
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-14 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800/50 text-white rounded-xl font-mono text-lg font-bold transition-all flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-14 bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800/50 text-slate-400 rounded-xl transition-all flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Screen Submissions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={password.length === 0}
            className={`w-full py-3.5 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              password.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-lg shadow-indigo-600/10'
                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Gate Credentials
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 bg-transparent border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-900/30 text-slate-400 hover:text-slate-200 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Client Deck
          </button>
        </div>

      </div>

      {/* Corporate compliance label */}
      <p className="font-mono text-[8px] text-slate-600 uppercase tracking-widest mt-6">
        Protected by SHA-256 Aghaaz Core Integrity Protocol
      </p>
    </div>
  );
}
