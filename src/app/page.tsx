"use client";

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FileSearch, Sparkles, AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import BlindMatch, { VoterProfile } from '@/components/BlindMatch';
import Debunker from '@/components/Debunker';

const LOADING_FACTS = [
  'Analyzing policies...',
  'Did you know? India has over 900 million voters...',
  'Decoding political jargon...'
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

export default function Home() {
  const [activeView, setActiveView] = useState('decoder');
  const [voterProfile, setVoterProfile] = useState<VoterProfile | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(true);
  
  const [tempProfile, setTempProfile] = useState({
    location: '',
    ageGroup: '',
    gender: '',
    sector: ''
  });

  const getSectorOptions = () => {
    switch (tempProfile.ageGroup) {
      case '18-25 (Youth)':
        return ['Student', 'Early Career/Working', 'Job Seeker', 'Entrepreneur'];
      case '26-50 (Adult)':
        return ['Employed', 'Business Owner', 'Freelancer', 'Unemployed/Looking'];
      case '50+ (Senior)':
        return ['Employed', 'Business Owner', 'Retired'];
      default:
        return [];
    }
  };

  // Phase 2: Global 3D Cursor Tracking Effect
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        cursorX.set(e.touches[0].clientX);
        cursorY.set(e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [cursorX, cursorY]);

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3D Tilt based on cursor position relative to the screen
  const rotateX = useTransform(cursorY, [0, windowSize.height || 1000], [4, -4]);
  const rotateY = useTransform(cursorX, [0, windowSize.width || 1000], [-4, 4]);

  // Phase 3 & 4: Synthesis Pipeline and State
  const [manifestoText, setManifestoText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    summary: string;
    demographic_impact: string;
    jargon_explained: string;
    vote_power_quote?: string;
  } | null>(null);

  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_FACTS.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDecode = async () => {
    if (!manifestoText.trim()) {
      setError("Please paste some text to decode.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: manifestoText, voterProfile })
      });

      let data;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse API response as JSON:", text);
        throw new Error("Server returned an invalid response (not JSON).");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to decode manifesto.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative font-sans text-slate-900 selection:bg-blue-200">
      {/* Opal Glass Dynamic Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 z-0" />

      {/* Trailing Glowing Orb */}
      <motion.div
        className="fixed top-0 left-0 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-300/40 to-blue-400/40 blur-[80px] pointer-events-none z-10 mix-blend-multiply"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                E
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">
                Election.jr
              </span>
            </div>
            {voterProfile && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 shadow-sm">
                📍 {voterProfile.location} | {voterProfile.ageGroup.split(' ')[0]} | {voterProfile.gender.charAt(0)} | {voterProfile.sector}
              </div>
            )}
            <div className="hidden md:flex space-x-8 text-sm font-semibold text-slate-500">
              <span onClick={() => setActiveView('decoder')} className={`cursor-pointer transition-colors ${activeView === 'decoder' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-blue-500'}`}>Decoder</span>
              <span onClick={() => setActiveView('match')} className={`cursor-pointer transition-colors ${activeView === 'match' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-blue-500'}`}>Match</span>
              <span onClick={() => setActiveView('debunker')} className={`cursor-pointer transition-colors ${activeView === 'debunker' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'hover:text-blue-500'}`}>Debunker</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Location Modal */}
      <AnimatePresence>
        {!voterProfile && isLocationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Voter Profile</h2>
                <p className="text-slate-600 font-medium">Tailor insights and game mechanics to your exact demographic.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">State / UT</label>
                  <select
                    value={tempProfile.location}
                    onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                  >
                    <option value="" disabled>Select your region...</option>
                    {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Age Group</label>
                  <select
                    value={tempProfile.ageGroup}
                    onChange={(e) => setTempProfile({ ...tempProfile, ageGroup: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                  >
                    <option value="" disabled>Select Age Group...</option>
                    <option value="18-25 (Youth)">18-25 (Youth)</option>
                    <option value="26-50 (Adult)">26-50 (Adult)</option>
                    <option value="50+ (Senior)">50+ (Senior)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                  <select
                    value={tempProfile.gender}
                    onChange={(e) => setTempProfile({ ...tempProfile, gender: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                  >
                    <option value="" disabled>Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other/Prefer not to say">Other/Prefer not to say</option>
                  </select>
                </div>

                {tempProfile.ageGroup && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sector / Occupation</label>
                    <select
                      value={tempProfile.sector}
                      onChange={(e) => setTempProfile({ ...tempProfile, sector: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 1rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                    >
                      <option value="" disabled>Select Sector...</option>
                      {getSectorOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </motion.div>
                )}

                <button
                  onClick={() => {
                    if (tempProfile.location && tempProfile.ageGroup && tempProfile.gender && tempProfile.sector) {
                      setVoterProfile(tempProfile);
                      setIsLocationModalOpen(false);
                    }
                  }}
                  disabled={!(tempProfile.location && tempProfile.ageGroup && tempProfile.gender && tempProfile.sector)}
                  className="w-full mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unlock Election.jr
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`relative z-20 pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center ${!voterProfile ? 'blur-sm pointer-events-none' : ''}`}>

      {activeView === 'decoder' && (
        <div className="w-full flex flex-col items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center w-full mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-800 drop-shadow-sm">
              Manifesto Decoder
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              Paste heavy political jargon below. Our AI engine will slice through the noise and tell you exactly how it impacts <span className="text-blue-600 font-bold">your future</span>.
            </p>
          </motion.div>

          {/* Decoder Interface (3D Tilt Container) */}
          <div className="w-full max-w-3xl" style={{ perspective: "1000px" }}>
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="w-full"
            >
              {/* Main Opal Glass Card */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative group transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">

                <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
                  <label htmlFor="manifesto" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <FileSearch size={18} className="text-blue-500" />
                    Input Political Text
                  </label>
                  <textarea
                    id="manifesto"
                    rows={6}
                    className="w-full bg-white/50 border border-white rounded-2xl p-5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-y shadow-inner backdrop-blur-md font-medium"
                    placeholder="Paste manifesto text, policy promises, or complex legal jargon here..."
                    value={manifestoText}
                    onChange={(e) => setManifestoText(e.target.value)}
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
                      onClick={handleDecode}
                      disabled={isLoading}
                      className="relative group/btn overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 text-white font-bold shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full flex-shrink-0"
                            />
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={loadingTextIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3 }}
                                className="whitespace-nowrap"
                              >
                                {LOADING_FACTS[loadingTextIndex]}
                              </motion.span>
                            </AnimatePresence>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Decode Manifesto
                          </>
                        )}
                      </span>
                      {/* Glow effect overlay */}
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Phase 4: Staggered Result Rendering */}
          {result && !isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="w-full max-w-4xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* The Summary Card */}
              <motion.div
                variants={itemVariants}
                className="md:col-span-2 bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-[60px] opacity-60 pointer-events-none" />
                <h3 className="text-sm font-bold text-blue-600 mb-4 flex items-center gap-2 uppercase tracking-widest relative z-10">
                  <CheckCircle2 size={18} /> The Bottom Line
                </h3>
                <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-bold relative z-10">
                  {result.summary}
                </p>
              </motion.div>

              {/* Impact on Demographic Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xs font-extrabold text-indigo-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                  How this impacts {voterProfile?.ageGroup.split(' ')[0]} year old {voterProfile?.gender === 'Male' ? 'men' : voterProfile?.gender === 'Female' ? 'women' : 'people'} in {voterProfile?.location}
                </h3>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {result.demographic_impact}
                </p>
              </motion.div>

              {/* Jargon Explained Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xs font-extrabold text-cyan-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                  Jargon Decoded
                </h3>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {result.jargon_explained}
                </p>
              </motion.div>

              {/* Voter Power Quote Card */}
              {result.vote_power_quote && (
                <motion.div
                  variants={itemVariants}
                  className="md:col-span-2 bg-gradient-to-r from-blue-50 to-orange-50 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden group"
                >
                  {/* Gradient Border Hack */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 opacity-20 pointer-events-none blur-[2px]" />
                  <div className="absolute inset-[2px] bg-white/80 backdrop-blur-3xl rounded-[1.4rem]" />

                  <div className="relative z-10">
                    <h3 className="text-sm font-extrabold text-orange-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                      <Megaphone size={18} className="text-orange-500" /> Your Vote Matters
                    </h3>
                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-bold italic">
                      "{result.vote_power_quote}"
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {activeView === 'match' && <BlindMatch voterProfile={voterProfile} />}

      {activeView === 'debunker' && <Debunker voterProfile={voterProfile} />}
    </main>
    </div>
  );
}
