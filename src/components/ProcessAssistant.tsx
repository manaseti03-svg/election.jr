"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ExternalLink, Search, Send, Volume2, VolumeX,
  CalendarCheck, Clock, AlertTriangle, CheckCircle2, 
  MessageCircle, Globe, Landmark, FileText, MousePointerClick, Bookmark
} from 'lucide-react';
import { VoterProfile } from './BlindMatch';

interface ProcessAssistantProps {
  voterProfile: VoterProfile | null;
}

interface TimelineNode {
  id: number;
  title: string;
  description: string;
  date: string;
  status: string;
}

export default function ProcessAssistant({ voterProfile }: ProcessAssistantProps) {
  // ── Timeline State ──
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // ── Booth Locator State ──
  const [epicNumber, setEpicNumber] = useState('');

  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // ── Fetch Timeline on Mount ──
  useEffect(() => {
    async function fetchTimeline() {
      if (!voterProfile || !voterProfile.location) return;
      setTimelineLoading(true);
      try {
        const res = await fetch('/api/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voterProfile })
        });
        if (!res.ok) throw new Error('Failed to fetch timeline');
        const data = await res.json();
        if (Array.isArray(data)) setTimeline(data);
      } catch (err) {
        console.error('Timeline fetch error:', err);
        setTimeline([
          { id: 1, title: "Check Electoral Roll", description: "Verify your name on the voter list at nvsp.in.", date: "Ongoing", status: "action_needed" },
          { id: 2, title: "Submit Form 6", description: "Apply for Voter ID via the NVSP portal.", date: "Open Now", status: "action_needed" },
          { id: 3, title: "Electoral Roll Revision", description: "Annual revision of voter rolls.", date: "Jan 2026", status: "upcoming" },
          { id: 4, title: "BLO Verification Visit", description: "Door-to-door registration verification.", date: "Pre-Election", status: "upcoming" }
        ]);
      } finally {
        setTimelineLoading(false);
      }
    }
    fetchTimeline();
  }, [voterProfile]);

  // ── Animation Variants ──
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };
  const itemVariants: any = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-800 drop-shadow-sm">
          Process Assistant
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
          Your complete toolkit for <span className="text-blue-600 font-bold">voter registration</span>, booth location, and multilingual civic guidance.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* ════════════════════════════════════════════════════════════════
            SECTION 1: Your Path to the Booth (Timeline + Voter ID Portal)
           ════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white/60 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col mb-8 gap-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <CalendarCheck className="w-5 h-5 text-white" />
                    </div>
                    Your Path to the Booth
                  </h2>
                  <p className="text-slate-500 font-medium mt-1 ml-[52px]">
                    Registration steps & deadlines for {voterProfile?.location || 'your state'}
                  </p>
                </div>
              </div>

              {/* Pre-Flight Checklist */}
              <div className="ml-[52px] bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm mt-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600 w-5 h-5" />
                  Before you click: How to use the ECI Portal
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-blue-900 font-medium text-sm md:text-base">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-blue-950">Gather Documents:</strong> Have a scanned copy of your Aadhaar card and a recent passport-size photo ready on your device.</span>
                  </li>
                  <li className="flex gap-3 text-blue-900 font-medium text-sm md:text-base">
                    <MousePointerClick className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-blue-950">Find Form 6:</strong> Once on the portal, locate and click the option for 'New Voter Registration (Form 6)'.</span>
                  </li>
                  <li className="flex gap-3 text-blue-900 font-medium text-sm md:text-base">
                    <Bookmark className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-blue-950">Track Your EPIC:</strong> After submitting, you will get a reference ID. Save it to track when your Voter ID is approved.</span>
                  </li>
                </ul>
              </div>

              {/* Voter ID Portal Button (Agentic UI Highlight Target) */}
              <motion.div
                animate={
                  activeHighlight === 'HIGHLIGHT_REGISTER' 
                    ? { scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 20px rgba(16,185,129,0.8)", "0px 0px 0px rgba(16,185,129,0)"] }
                    : { scale: 1, boxShadow: "0px 0px 0px rgba(16,185,129,0)" }
                }
                transition={
                  activeHighlight === 'HIGHLIGHT_REGISTER' 
                    ? { repeat: 3, duration: 1.5, ease: "easeInOut" } 
                    : { duration: 0.2 }
                }
                className="rounded-2xl md:ml-[52px] mt-2"
              >
                <a
                  href="https://voters.eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group/glow inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 blur-md opacity-0 group-hover/glow:opacity-40 transition-opacity -z-10" />
                  <Landmark size={18} />
                  I have my documents. Proceed to Official ECI Portal ↗
                </a>
              </motion.div>
            </div>

            {/* Timeline Nodes */}
            {timelineLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
                />
                <span className="ml-4 text-slate-500 font-bold animate-pulse">Loading deadlines for {voterProfile?.location}...</span>
              </div>
            ) : (
              <div className="relative ml-5">
                {/* Vertical Line */}
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-400 via-teal-300 to-cyan-300 rounded-full" />

                <div className="space-y-6">
                  {timeline.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15, type: "spring", stiffness: 300, damping: 24 }}
                      className="relative pl-8"
                    >
                      {/* Node Dot */}
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-[3px] transform -translate-x-[7px] ${
                        node.status === 'action_needed'
                          ? 'bg-orange-400 border-orange-200 shadow-lg shadow-orange-400/40'
                          : 'bg-emerald-400 border-emerald-200 shadow-lg shadow-emerald-400/40'
                      }`} />

                      <div className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-5 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {node.status === 'action_needed' ? (
                                <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-orange-100">Action Needed</span>
                              ) : (
                                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">Upcoming</span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-slate-800">{node.title}</h4>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">{node.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400 whitespace-nowrap">
                            <Clock size={14} />
                            {node.date}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: Locate Your Polling Booth
           ════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200/30 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Locate Your Polling Booth
            </h2>
            <p className="text-slate-500 font-medium mb-6 ml-[52px]">Find your assigned booth via the official ECI portal.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Your EPIC (Voter ID) Number</label>
                <motion.div 
                  className="relative rounded-xl"
                  animate={
                    activeHighlight === 'HIGHLIGHT_EPIC' 
                      ? { scale: [1, 1.02, 1], boxShadow: ["0px 0px 0px rgba(59,130,246,0)", "0px 0px 20px rgba(59,130,246,0.8)", "0px 0px 0px rgba(59,130,246,0)"] }
                      : { scale: 1, boxShadow: "0px 0px 0px rgba(59,130,246,0)" }
                  }
                  transition={
                    activeHighlight === 'HIGHLIGHT_EPIC' 
                      ? { repeat: 3, duration: 1.5, ease: "easeInOut" } 
                      : { duration: 0.2 }
                  }
                >
                  <input
                    type="text"
                    value={epicNumber}
                    onChange={(e) => setEpicNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC1234567"
                    maxLength={10}
                    className="w-full bg-white/50 border border-white rounded-xl p-4 pl-11 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-md font-mono font-bold tracking-wider uppercase"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </motion.div>
              </div>

              <a
                href="https://electoralsearch.eci.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MapPin size={18} />
                Find on Map
                <ExternalLink size={14} />
              </a>

              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 font-medium">
                  This opens the official Election Commission of India's Electoral Search portal. Your EPIC number is on your Voter ID card.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* AI Safety Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-5xl mt-8 flex items-start gap-2 text-slate-400 text-xs font-medium bg-slate-100/50 rounded-xl p-4 border border-slate-200/50"
      >
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5" />
        <p>
          ⚠️ Election.jr uses AI to generate timelines and fact-checks. Always verify official dates and voting booth locations directly via the Election Commission of India (ECI) portal.
        </p>
      </motion.div>
    </div>
  );
}
