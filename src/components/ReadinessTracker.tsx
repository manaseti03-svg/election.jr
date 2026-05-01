"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, ExternalLink } from 'lucide-react';

interface ChecklistItem {
  id: 'item1' | 'item2' | 'item3';
  label: string;
}

/**
 * Readiness Tracker component.
 * Gamified document checklist for various voter registration statuses.
 * @param {ReadinessTrackerProps} props - Component properties.
 * @returns {JSX.Element} The rendered checklist interface.
 */
export default function ReadinessTracker({ voterStatus = 'unregistered' }: ReadinessTrackerProps) {
  const [docs, setDocs] = useState({
    item1: false,
    item2: false,
    item3: false
  });

  const isRegistered = voterStatus === 'registered';
  const isPending = voterStatus === 'pending';
  const totalItems = isPending ? 2 : 3;

  const activeCount = Object.values(docs).filter(Boolean).length;
  const progress = Math.min(Math.round((activeCount / totalItems) * 100), 100);
  const isComplete = activeCount >= totalItems;

  const toggleDoc = (key: keyof typeof docs) => {
    setDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  let title = 'Form 6 Pre-Flight Checklist';
  let buttonText = 'Proceed to Official ECI Portal';
  let buttonLink = 'https://voters.eci.gov.in/';
  let checklist: ChecklistItem[] = [];

  if (isRegistered) {
    title = 'Voter Roll Verification Checklist';
    buttonText = 'Search Electoral Roll';
    buttonLink = 'https://electoralsearch.eci.gov.in/';
    checklist = [
      { id: 'item1', label: 'Verify Your Name: Having a physical card is not enough. You must verify your name is on the current electoral roll.' },
      { id: 'item2', label: 'Find Your Booth: Note your serial number and exact polling station address.' },
      { id: 'item3', label: "Missing from Portal?: If your EPIC number shows 'No Record Found', your name was deleted. You must register again using Form 6." }
    ];
  } else if (isPending) {
    title = 'Application Tracking Checklist';
    buttonText = 'Track Application Status';
    buttonLink = 'https://voters.eci.gov.in/';
    checklist = [
      { id: 'item1', label: 'Find Reference ID: Locate the reference number sent to your SMS/Email when you submitted Form 6.' },
      { id: 'item2', label: 'Check Status: Enter the ID on the portal to see if your BLO has approved it.' }
    ];
  } else {
    checklist = [
      { id: 'item1', label: 'Scanned Aadhaar Card' },
      { id: 'item2', label: 'Recent Passport Photo (4.5cm x 3.5cm)' },
      { id: 'item3', label: 'Valid Address Proof' }
    ];
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-6">
        {title}
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
        href={isComplete ? buttonLink : undefined}
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
        {buttonText}
        <ExternalLink size={18} className={isComplete ? "text-white" : "text-slate-400"} />
      </motion.a>
    </div>
  );
}
