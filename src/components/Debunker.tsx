"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles, AlertCircle } from 'lucide-react';
import { VoterProfile } from './BlindMatch';

/**
 * WhatsApp Rumor Debunker component.
 * Uses Gemini AI to fact-check political misinformation with demographic context.
 * @param {DebunkerProps} props - Component properties.
 * @returns {JSX.Element} The rendered debunker interface.
 */
export default function Debunker({ voterProfile }: DebunkerProps) {
  const [rumorText, setRumorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    truth_score: number;
    verdict: string;
    fact_check: string;
    targeting_motive: string;
  } | null>(null);

  const handleVerify = async () => {
    if (!rumorText.trim()) {
      setError("Please paste a suspicious WhatsApp forward to verify.");
      return;
    }

    if (!voterProfile) {
      setError("Voter profile is missing.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debunker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rumorText, voterProfile })
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Server returned an invalid response (not JSON).");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify rumor.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes('true')) return 'text-green-500 shadow-green-500/20';
    if (lower.includes('misleading')) return 'text-yellow-500 shadow-yellow-500/20';
    if (lower.includes('false')) return 'text-red-500 shadow-red-500/20';
    return 'text-slate-500';
  };

  const getVerdictIcon = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes('true')) return <ShieldCheck className="w-8 h-8 text-green-500" />;
    if (lower.includes('misleading')) return <ShieldQuestion className="w-8 h-8 text-yellow-500" />;
    if (lower.includes('false')) return <ShieldAlert className="w-8 h-8 text-red-500" />;
    return <ShieldQuestion className="w-8 h-8 text-slate-500" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };
  
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-800 drop-shadow-sm">
          WhatsApp Debunker
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Paste a suspicious political forward below. Our AI fact-checker will verify the claim and tell you <span className="text-blue-600 font-bold">why it targets you</span>.
        </p>
      </motion.div>

      {/* Input Interface */}
      <div className="w-full max-w-3xl">
        <motion.div className="w-full">
          <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative group transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
            <div className="relative z-10">
              <label htmlFor="rumor" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <ShieldAlert size={18} className="text-blue-500" />
                Suspicious WhatsApp Forward
              </label>
              <textarea
                id="rumor"
                rows={4}
                className="w-full bg-white/50 border border-white rounded-2xl p-5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-y shadow-inner backdrop-blur-md font-medium"
                placeholder="Paste the suspicious WhatsApp forward here..."
                value={rumorText}
                onChange={(e) => setRumorText(e.target.value)}
              />
              
              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="relative group/btn overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 text-white font-bold shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full flex-shrink-0"
                      />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {isLoading ? "Verifying Claim..." : "Verify Claim"}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Results Rendering */}
      {result && !isLoading && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Verdict Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-xs font-extrabold text-slate-500 mb-4 uppercase tracking-widest relative z-10">
              Verdict
            </h3>
            <div className="flex items-center justify-center gap-3 mb-2">
              {getVerdictIcon(result.verdict)}
              <span className={`text-3xl font-black uppercase tracking-wider ${getVerdictColor(result.verdict)}`}>
                {result.verdict}
              </span>
            </div>
          </motion.div>

          {/* Truth Score Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col items-center justify-center text-center"
          >
            <h3 className="text-xs font-extrabold text-slate-500 mb-4 uppercase tracking-widest relative z-10">
              Truth Score
            </h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="stroke-slate-200" strokeWidth="8" fill="none" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  className={`${result.truth_score > 50 ? 'stroke-green-500' : 'stroke-red-500'}`}
                  strokeWidth="8" fill="none" 
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * result.truth_score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-black text-slate-800">{result.truth_score}</span>
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </motion.div>

          {/* Fact Check Details */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xs font-extrabold text-blue-600 mb-3 uppercase tracking-widest flex items-center gap-2">
              The Actual Truth
            </h3>
            <p className="text-slate-800 leading-relaxed font-bold text-lg">
              {result.fact_check}
            </p>
          </motion.div>

          {/* Targeting Motive Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-10 pointer-events-none blur-[2px]" />
             <div className="absolute inset-[2px] bg-white/80 backdrop-blur-3xl rounded-[1.4rem]" />
             
             <div className="relative z-10">
               <h3 className="text-xs font-extrabold text-red-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                 Why it targets you ({voterProfile?.sector || voterProfile?.ageGroup})
               </h3>
               <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-bold italic">
                 "{result.targeting_motive}"
               </p>
             </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Safety Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-4xl mt-8 flex items-start gap-2 text-slate-400 text-xs font-medium bg-slate-100/50 rounded-xl p-4 border border-slate-200/50"
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
        <p>
          ⚠️ Election.jr uses AI to generate timelines and fact-checks. Always verify official dates and voting booth locations directly via the Election Commission of India (ECI) portal.
        </p>
      </motion.div>
    </div>
  );
}
