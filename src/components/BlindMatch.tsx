"use client";

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy } from 'lucide-react';

type Party = 'Progressive' | 'Conservative' | 'Libertarian' | 'Centrist';

interface Policy {
  id: number;
  text: string;
  party?: Party;
  alignment?: string;
}

const INITIAL_POLICIES: Policy[] = [
  { id: 1, text: "Provide free high-speed WiFi on all college campuses and public transit.", party: 'Progressive' },
  { id: 2, text: "Eliminate capital gains taxes for crypto and tech startups to boost innovation.", party: 'Libertarian' },
  { id: 3, text: "Implement a flat 15% income tax rate across the board, removing most deductions.", party: 'Conservative' },
  { id: 4, text: "Offer state-subsidized housing for all first-time renters under the age of 25.", party: 'Progressive' },
  { id: 5, text: "Require balanced federal budgets by cutting spending rather than raising taxes.", party: 'Conservative' },
];

export interface VoterProfile {
  location: string;
  ageGroup: string;
  gender: string;
  sector?: string;
}

interface BlindMatchProps {
  voterProfile: VoterProfile | null;
}

export default function BlindMatch({ voterProfile }: BlindMatchProps) {
  const [cards, setCards] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    Progressive: 0,
    Conservative: 0,
    Libertarian: 0,
    Centrist: 0,
    Regional: 0,
    Other: 0,
  });

  useEffect(() => {
    async function fetchPolicies() {
      if (!voterProfile || !voterProfile.location) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voterProfile })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch local policies');
        }

        const data = await response.json();
        // Reset scores dynamically based on the fetched policies if needed, 
        // or just keep tracking them. Ensure we catch new alignments.
        setCards(data);
        setScores({ Progressive: 0, Conservative: 0, Libertarian: 0, Centrist: 0, Regional: 0, Other: 0 });
      } catch (err: any) {
        setError(err.message || "Failed to load policies for your region.");
        setCards(INITIAL_POLICIES); // fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchPolicies();
  }, [voterProfile]);

  const activeCardIndex = cards.length - 1;
  const isFinished = cards.length === 0;

  // Physics values for the top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Color overlays for swipe feedback
  const backgroundRight = useTransform(x, [0, 100], ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.2)']);
  const backgroundLeft = useTransform(x, [-100, 0], ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)']);
  const iconScaleRight = useTransform(x, [0, 100], [0.5, 1.2]);
  const iconScaleLeft = useTransform(x, [-100, 0], [1.2, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    const isSwipeRight = info.offset.x > swipeThreshold;
    const isSwipeLeft = info.offset.x < -swipeThreshold;

    if (isSwipeRight) {
      handleSwipe('right');
    } else if (isSwipeLeft) {
      handleSwipe('left');
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      const activeCard = cards[activeCardIndex];
      const alignment = activeCard?.alignment || activeCard?.party || 'Other';
      setScores(prev => ({
        ...prev,
        [alignment]: (prev[alignment] || 0) + 1
      }));
    }

    // Remove the top card
    setTimeout(() => {
      setCards(prev => prev.slice(0, -1));
      x.set(0); // Reset X for the next card
    }, 150);
  };

  const triggerSwipeAnimation = (direction: 'left' | 'right') => {
    x.set(direction === 'right' ? 500 : -500); // Trigger visual swipe
    setTimeout(() => {
      handleSwipe(direction);
    }, 150);
  };

  // Calculate winner
  const getWinner = () => {
    let topParty = 'Centrist';
    let maxScore = -1;
    let totalSwipes = 0;

    Object.entries(scores).forEach(([party, score]) => {
      totalSwipes += score;
      if (score > maxScore) {
        maxScore = score;
        topParty = party;
      }
    });

    return { topParty, maxScore, totalSwipes };
  };

  const { topParty, maxScore, totalSwipes } = getWinner();

  return (
    <div className="w-full max-w-3xl mx-auto mt-24 mb-16 relative perspective-1000">

      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-800 drop-shadow-sm">
          Blind Policy Match
        </h2>
        <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
          Swipe right if you agree, left if you disagree. We strip away the party labels to show you who you <span className="text-blue-600 font-bold">really</span> align with in {voterProfile?.location || 'your region'}.
        </p>
      </div>

      <div className="relative w-full h-[400px] flex justify-center items-center">

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"
            />
            <p className="text-slate-600 font-bold animate-pulse">Analyzing political climate in {voterProfile?.location}...</p>
          </div>
        )}

        <AnimatePresence>
          {!isLoading && cards.length > 0 && cards.map((policy, index) => {
            const isTop = index === activeCardIndex;

            return (
              <motion.div
                key={policy.id}
                className="absolute w-full max-w-sm"
                style={{
                  zIndex: index,
                  x: isTop ? x : 0,
                  rotate: isTop ? rotate : 0,
                  opacity: isTop ? opacity : 1 - (activeCardIndex - index) * 0.2,
                  scale: isTop ? 1 : 1 - (activeCardIndex - index) * 0.05,
                  y: isTop ? 0 : (activeCardIndex - index) * 15,
                }}
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={isTop ? handleDragEnd : undefined}
                whileTap={isTop ? { cursor: "grabbing" } : {}}
                transition={isTop ? { type: "spring", stiffness: 300, damping: 20 } : { duration: 0.2 }}
              >
                {/* Opal Glass Card Structure */}
                <div className="bg-white/70 backdrop-blur-2xl border-2 border-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] h-[360px] flex flex-col justify-center items-center text-center relative overflow-hidden group cursor-grab">

                  {/* Green Glow Overlay (Agree) */}
                  {isTop && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
                      style={{ backgroundColor: backgroundRight }}
                    >
                      <motion.div style={{ scale: iconScaleRight, opacity: iconScaleRight }}>
                        <Check className="text-green-500 w-24 h-24 drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Red Glow Overlay (Disagree) */}
                  {isTop && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
                      style={{ backgroundColor: backgroundLeft }}
                    >
                      <motion.div style={{ scale: iconScaleLeft, opacity: iconScaleLeft }}>
                        <X className="text-red-500 w-24 h-24 drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                  )}

                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 font-bold shadow-inner">
                    {cards.length}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 leading-snug">
                    "{policy.text}"
                  </h3>

                  <div className="absolute bottom-6 flex justify-between w-full px-12 text-sm font-bold tracking-widest text-slate-400 uppercase z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); isTop && triggerSwipeAnimation('left'); }}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors pointer-events-auto"
                    >
                      <X size={16} /> Disagree
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); isTop && triggerSwipeAnimation('right'); }}
                      className="flex items-center gap-1 hover:text-green-500 transition-colors pointer-events-auto"
                    >
                      Agree <Check size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Results Dashboard */}
        {!isLoading && isFinished && cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-lg bg-white/70 backdrop-blur-2xl border-2 border-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-[80px]" />

            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <Trophy className="text-white w-10 h-10" />
            </div>

            <h3 className="text-3xl font-extrabold text-slate-800 mb-2">
              Ideology Unlocked
            </h3>
            <p className="text-slate-600 font-medium mb-8">
              Based purely on policies, you align most with:
            </p>

            <div className="bg-slate-50/50 border border-white rounded-2xl p-6 shadow-inner relative z-10 mb-8">
              <h4 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-4">
                {totalSwipes === 0 ? "Independent" : topParty}
              </h4>

              {/* Progress Bar */}
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalSwipes === 0 ? 0 : (maxScore / totalSwipes) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                />
              </div>
              <p className="text-sm font-bold text-slate-500 mt-3 text-right">
                {totalSwipes === 0 ? "0" : Math.round((maxScore / totalSwipes) * 100)}% Match
              </p>
            </div>

            <button
              onClick={async () => {
                // To play again, we can just refetch or use initial
                setIsLoading(true);
                try {
                  const response = await fetch('/api/match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ voterProfile })
                  });
                  const data = await response.json();
                  setCards(data);
                } catch {
                  setCards(INITIAL_POLICIES);
                } finally {
                  setIsLoading(false);
                }
                setScores({ Progressive: 0, Conservative: 0, Libertarian: 0, Centrist: 0, Regional: 0, Other: 0 });
              }}
              className="text-blue-600 font-bold uppercase tracking-widest text-sm hover:text-blue-700 transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
