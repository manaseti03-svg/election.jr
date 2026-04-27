import React from 'react';
import { BookOpen, FileSearch, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-md">
                E
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">
                Election.jr
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Manifesto</a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Policy Match</a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Rumor Check</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Vote Smart, <br className="hidden md:block"/> Not Just Hard.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            The unbiased civic engine for first-time voters. Decode manifestos, match policies blindly, and bust WhatsApp myths in seconds.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all">
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Manifesto Decoder */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <FileSearch size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Manifesto Decoder</h3>
            <p className="text-gray-600 leading-relaxed flex-grow">
              Paste heavy political jargon, and let our AI decode it into a simple 3-point summary with real-world impacts on youth.
            </p>
          </div>

          {/* Feature 2: Blind Policy Match */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-purple-100/50 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Blind Policy Match</h3>
            <p className="text-gray-600 leading-relaxed flex-grow">
              Swipe yes/no on anonymous policy promises. We'll reveal which party actually aligns with your views, removing brand bias.
            </p>
          </div>

          {/* Feature 3: Rumor Debunker */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-100/50 flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Rumor Debunker</h3>
            <p className="text-gray-600 leading-relaxed flex-grow">
              Paste a viral political rumor. We cross-reference it against facts to instantly tell you if it's true, false, or misleading.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
