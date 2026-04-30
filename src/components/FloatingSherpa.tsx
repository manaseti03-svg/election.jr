"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Volume2, VolumeX, Globe, Mic } from 'lucide-react';
import { VoterProfile } from './BlindMatch';

interface FloatingSherpaProps {
  voterProfile: VoterProfile | null;
  activeView: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content_english: string;
  content_regional?: string;
  language_name?: string;
  lang_code?: string;
}

export default function FloatingSherpa({ voterProfile, activeView }: FloatingSherpaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (!voterProfile) return [];
    return [{
      role: 'assistant',
      content_english: `Hi! As a ${voterProfile.sector} in ${voterProfile.location}, I'm here to help. What questions do you have about the ${activeView} section?`
    }];
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Force early voice loading
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices(); // Initial try
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto-scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen]);

  if (!voterProfile) return null; // Hide completely until profile is complete

  const handleChatSend = async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;
    
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content_english: question }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          voterProfile, 
          chatHistory: chatMessages,
          currentTab: activeView 
        })
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
        content_english: "Sorry, I couldn't process that right now. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleListen = (textToSpeak: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current audio

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode; // e.g., 'te-IN'

    // Find exact match or fallback to Google's cloud voices which are better
    const targetVoice = voices.find(v => v.lang === langCode || v.lang.includes(langCode.split('-')[0])) 
                        || voices.find(v => v.name.includes('Google') && v.lang.includes('IN'));
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Your browser does not support voice input.');
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // You can make this dynamic based on voterProfile later
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript); // Put the spoken words into the input box
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl shadow-cyan-500/40 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[550px] bg-white/80 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
            aria-label="Chat assistant window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Election.jr Guide</h3>
                  <p className="text-xs font-medium text-cyan-50 opacity-90">Bilingual Civic Assistance</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close chat window"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-white border border-slate-100 shadow-sm text-slate-700'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content_english}</p>
                    
                    {msg.content_regional && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50">
                        <p className="text-xs font-bold opacity-70 mb-0.5 flex items-center gap-1">
                          <Globe size={10} /> {msg.language_name || 'Regional'}
                        </p>
                        <p className="text-sm font-medium leading-relaxed">{msg.content_regional}</p>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.content_regional && (
                      <button
                        onClick={() => handleListen(msg.content_regional!, msg.lang_code || 'hi-IN')}
                        aria-label="Listen to regional translation"
                        className="mt-2 flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors focus:ring-2 focus:ring-cyan-500 outline-none rounded p-1"
                      >
                        {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        {isSpeaking ? 'Stop' : `Listen in ${msg.language_name || 'Regional'}`}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2 h-2 rounded-full bg-cyan-300" />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2 h-2 rounded-full bg-cyan-200" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask your civic guide..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
              />
              <motion.button
                onClick={handleMicClick}
                aria-label="Start Voice Input"
                animate={isListening ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
                transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all focus:ring-2 focus:ring-red-500 outline-none ${
                  isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mic size={18} />
              </motion.button>
              <button
                onClick={handleChatSend}
                aria-label="Send message"
                disabled={chatLoading || (!chatInput.trim() && !isListening)}
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
