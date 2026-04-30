"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, ExternalLink, Search, Send, Volume2, VolumeX,
  CalendarCheck, Clock, AlertTriangle, CheckCircle2, 
  MessageCircle, Globe, Landmark
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

interface ChatMessage {
  role: 'user' | 'assistant';
  content_english: string;
  content_regional?: string;
  language_name?: string;
  lang_code?: string;
}

export default function ProcessAssistant({ voterProfile }: ProcessAssistantProps) {
  // ── Timeline State ──
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // ── Booth Locator State ──
  const [epicNumber, setEpicNumber] = useState('');

  // ── Chat State ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // ── Auto-scroll Chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Chat Submit Handler ──
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content_english: question }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, voterProfile })
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Invalid response"); }
      if (!res.ok) throw new Error(data.error || "Chat failed");

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content_english: data.english_response || data.answer_english,
        content_regional: data.regional_response || data.answer_regional,
        language_name: data.language_name,
        lang_code: data.lang_code
      }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content_english: "Sorry, I couldn't process that. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Speech Synthesis (Regional Language Only) ──
  const handleSpeak = (regionalText: string, langCode?: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(regionalText);
    utterance.lang = langCode || 'hi-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ── Animation Variants ──
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };
  const itemVariants = {
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
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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

              {/* Voter ID Portal Button */}
              <a
                href="https://voters.eci.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group/glow flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 blur-md opacity-0 group-hover/glow:opacity-40 transition-opacity -z-10" />
                <Landmark size={18} />
                Apply for Voter ID (Form 6)
                <ExternalLink size={14} />
              </a>
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
                <div className="relative">
                  <input
                    type="text"
                    value={epicNumber}
                    onChange={(e) => setEpicNumber(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC1234567"
                    maxLength={10}
                    className="w-full bg-white/50 border border-white rounded-xl p-4 pl-11 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-md font-mono font-bold tracking-wider uppercase"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
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

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3: Multilingual Civic Guide Chatbot
           ════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-violet-200/30 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              Ask the Civic Guide
            </h2>
            <p className="text-slate-500 font-medium mb-4 ml-[52px] flex items-center gap-1.5">
              <Globe size={14} className="text-violet-400" />
              Bilingual answers in English + your regional language
            </p>

            {/* Chat Messages */}
            <div className="flex-1 min-h-[280px] max-h-[400px] overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-violet-300" />
                  </div>
                  <p className="text-slate-400 font-medium text-sm">Ask any question about voting,<br />registration, or elections!</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {["How do I register?", "What documents do I need?", "When is the next election?"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-100 hover:bg-violet-100 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white/80 border border-white/60 shadow-sm text-slate-700'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content_english}</p>
                      
                      {msg.content_regional && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-xs font-bold opacity-70 mb-0.5 flex items-center gap-1">
                            <Globe size={10} /> {msg.language_name || 'Regional'}
                          </p>
                          <p className="text-sm font-medium leading-relaxed">{msg.content_regional}</p>
                        </div>
                      )}

                      {msg.role === 'assistant' && msg.content_regional && (
                        <button
                          onClick={() => handleSpeak(msg.content_regional!, msg.lang_code)}
                          className="mt-2 flex items-center gap-1.5 text-xs font-bold text-violet-500 hover:text-violet-700 transition-colors"
                        >
                          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          {isSpeaking ? 'Stop' : `Listen in ${msg.language_name || 'Regional'}`}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/80 border border-white/60 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-violet-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 rounded-full bg-violet-300"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 rounded-full bg-violet-200"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask about voting, ID, elections..."
                className="flex-1 bg-white/50 border border-white rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all shadow-inner backdrop-blur-md font-medium"
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send size={18} />
              </button>
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
