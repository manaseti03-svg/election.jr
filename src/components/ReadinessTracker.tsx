"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, ExternalLink } from 'lucide-react';

export default function ReadinessTracker() {
  const [docs, setDocs] = useState({
    aadhaar: false,
    photo: false,
    address: false
  });

  const activeCount = Object.values(docs).filter(Boolean).length;
  const progress = Math.round((activeCount / 3) * 100);
  const isComplete = progress === 100;

  const toggleDoc = (key: keyof typeof docs) => {
    setDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklist = [
    { id: 'aadhaar', label: 'Scanned Aadhaar Card' },
    { id: 'photo', label: 'Recent Passport Photo (4.5cm x 3.5cm)' },
    { id: 'address', label: 'Valid Address Proof' }
  ] as const;

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-6">
        Form 6 Pre-Flight Checklist
      </h3>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/50 rounded-full h-3 mb-8 overflow-hidden border border-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        />
      </div>

      {/* Checklist Items */}
      <div className="flex-col space-y-4 mb-8 flex-1">
        {checklist.map(({ id, label }) => {
          const isActive = docs[id];
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleDoc(id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-cyan-50 border-cyan-200 shadow-sm' 
                  : 'bg-white/50 border-slate-200 hover:border-cyan-300 hover:bg-white/80'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isActive ? 'bg-gradient-to-br from-cyan-500 to-blue-500' : 'bg-slate-200'
              }`}>
                {isActive ? <Check size={14} className="text-white" /> : <Circle size={14} className="text-slate-400" />}
              </div>
              <span className={`font-bold text-left text-sm md:text-base ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Primary Button */}
      <motion.a
        href={isComplete ? "https://voters.eci.gov.in/" : undefined}
        target={isComplete ? "_blank" : undefined}
        rel="noopener noreferrer"
        animate={
          isComplete
            ? { 
                scale: 1.02, 
                boxShadow: "0px 0px 20px rgba(6, 182, 212, 0.5)" 
              }
            : { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }
        }
        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all text-center ${
          isComplete
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer hover:from-cyan-400 hover:to-blue-500'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/50'
        }`}
        onClick={(e) => {
          if (!isComplete) e.preventDefault();
        }}
      >
        Proceed to Official ECI Portal
        <ExternalLink size={18} className={isComplete ? "text-white" : "text-slate-400"} />
      </motion.a>
    </div>
  );
}
