'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Zap, Shield, Heart, Sun, Moon, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  const features = [
    { icon: <Sparkles className="w-8 h-8" />, title: 'Magically Organized', desc: "Color-coded, label-tagged, priority-sorted glory." },
    { icon: <Zap className="w-8 h-8" />, title: 'Lightning Fast', desc: 'Create tasks faster than you can say “write that down”.' },
    { icon: <Shield className="w-8 h-8" />, title: 'Fort Knox Secure', desc: 'Protected with HTTPOnly cookies and JWTs.' },
    { icon: <Heart className="w-8 h-8" />, title: 'Delightful', desc: 'Clean, friendly UI that makes getting things done feel good.' },
  ];

  const Testi = (
    { name, title, quote, rating, avatar }
  ) => (
    <div className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white/80 border-orange-200/50'} p-6 rounded-2xl border`}>
      <div className="flex gap-1 mb-4" aria-label={`${rating} star rating`}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className={`${darkMode ? 'text-amber-400' : 'text-orange-500'} w-5 h-5`} />
        ))}
      </div>
      <p className={`${darkMode ? 'text-amber-200/80' : 'text-gray-700'} italic mb-4`}>
        “{quote}”
      </p>
      <div className="flex items-center gap-3">
        <div className="text-4xl" role="img" aria-label="avatar">{avatar}</div>
        <div>
          <div className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} font-bold`}>{name}</div>
          <div className={`${darkMode ? 'text-amber-400/60' : 'text-gray-500'} text-sm`}>{title}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50'}`}>
        {/* Nav */}
        <nav className={`sticky top-0 z-50 backdrop-blur-lg border-b ${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white/80 border-orange-200/50'}`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${darkMode ? 'bg-gradient-to-br from-amber-800 to-orange-900' : ''}`} style={darkMode ? {} : { backgroundColor: '#fce4d2' }}>
                <span className="text-2xl">🍑</span>
              </div>
              <span className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400' : 'bg-gradient-to-r from-orange-600 to-amber-600'} bg-clip-text text-transparent text-xl font-bold`}>Peachy Task</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setDarkMode(!darkMode)} className={`${darkMode ? 'bg-amber-900/50 text-amber-300 hover:bg-amber-900' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'} p-2 rounded-lg`}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <Link href="/login" className={`${darkMode ? 'text-amber-300 hover:bg-amber-900/30' : 'text-orange-700 hover:bg-orange-100'} px-4 py-2 rounded-lg font-medium`}>Sign In</Link>
              <Link href="/signup" className={`${darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'} px-5 py-2 rounded-lg font-semibold shadow-md`}>Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className={`w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl ${darkMode ? 'bg-gradient-to-br from-amber-800 to-orange-900' : ''}`} style={darkMode ? {} : { backgroundColor: '#fce4d2' }}>
                <span className="text-8xl animate-bounce">🍑</span>
              </div>
            </div>
            <h1 className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400' : 'bg-gradient-to-r from-orange-600 to-amber-600'} bg-clip-text text-transparent text-5xl md:text-6xl font-black mb-6`}>
              Everything&apos;s Peachy<br />When You Get Things Done
            </h1>
            <p className={`${darkMode ? 'text-amber-200/80' : 'text-gray-700'} text-xl mb-8 max-w-2xl mx-auto`}>
              The world&apos;s most delightfully absurd task management app. Used by literally DOZENS of people worldwide. Probably.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup" className={`${darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'} px-8 py-4 rounded-xl font-bold text-lg shadow-xl inline-flex items-center gap-2`}>
                Start Being Productive (Maybe)
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className={`${darkMode ? 'text-amber-400/60' : 'text-orange-600/70'} text-sm mt-4 italic`}>
              * Side effects may include excessive organization and spontaneous peachy feelings
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { val: '847%', text: 'Increase in feeling peachy' },
              { val: '99.9%', text: 'Of users achieve peach flavored enlightenment*' },
              { val: '∞', text: 'Peaches metaphorically involved' },
            ].map((s, i) => (
              <div key={i} className={`text-center p-6 rounded-2xl ${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white/80 border-orange-200/50'} border`}>
                <div className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{s.val}</div>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm font-medium`}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-4xl font-bold text-center mb-12`}>Features That&apos;ll Blow Your Mind*</h2>
            <p className={`${darkMode ? 'text-amber-400/60' : 'text-gray-500'} text-center text-sm italic mb-8`}>*Mind-blowing not medically verified</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, idx) => (
                <div key={idx} className={`p-6 rounded-2xl transition hover:scale-105 ${darkMode ? 'bg-stone-900/80 border-amber-900/30 hover:border-amber-700' : 'bg-white/80 border-orange-200/50 hover:border-orange-400 hover:shadow-lg'} border`}>
                  <div className={`${darkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-orange-100 text-orange-600'} inline-flex p-3 rounded-xl mb-4`}>{f.icon}</div>
                  <h3 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-xl font-bold mb-2`}>{f.title}</h3>
                  <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'}`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-4xl font-bold text-center mb-4`}>What Our Users Are Saying</h2>
            <p className={`${darkMode ? 'text-amber-400/60' : 'text-gray-500'} text-center text-sm italic mb-12`}>(These are 100% real testimonials from 100% real people. Probably.)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Dr. Productivity McTaskface', title: 'Professional List Maker', quote: "I used to forget everything. Now I breathe EXCLUSIVELY on schedule.", rating: 5, avatar: '🧑‍⚕️' },
                { name: "Barbara 'The Organizer' Jenkins", title: 'Chaos Elimination Specialist', quote: 'Before Peachy Task, my life was a mess. Now? Enlightenment.', rating: 5, avatar: '👩‍💼' },
                { name: 'Kevin the Procrastinator', title: 'Former Professional Delayer', quote: 'I ALREADY DID IT. Cured in 3.7 seconds.', rating: 5, avatar: '🧔' },
                { name: 'Princess Sparkle Whiskers III', title: 'Cat (Yes, Really)', quote: 'Meow meow meow. 5 stars.', rating: 5, avatar: '🐱' },
              ].map((t, i) => (
                <Testi key={i} {...t} />
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className={`${darkMode ? 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-700' : 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300'} text-center p-12 rounded-3xl border`}>
            <h2 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-4xl font-bold mb-4`}>Ready to Make Everything Peachy?</h2>
            <p className={`${darkMode ? 'text-amber-200/70' : 'text-gray-700'} text-lg mb-8`}>Join the dozens who discovered the peachy path to productivity!</p>
            <Link href="/signup" className={`${darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'} px-10 py-4 rounded-xl font-bold text-lg shadow-xl`}>Get Started For Free</Link>
            <p className={`${darkMode ? 'text-amber-400/50' : 'text-gray-500'} text-xs italic mt-4`}>No credit card required. No commitment. Just pure, unadulterated task management bliss.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white/80 border-orange-200/50'} border-t py-8`}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">🍑</span>
              <span className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} font-bold`}>Peachy Task</span>
            </div>
            <p className={`${darkMode ? 'text-amber-400/60' : 'text-gray-500'} text-sm mb-2`}>Making task management ridiculously delightful since approximately 5 minutes ago.</p>
            <p className={`${darkMode ? 'text-amber-400/40' : 'text-gray-400'} text-xs italic`}>© 2025 Peachy Task. All rights reserved. Dragons included free of charge. 🐉</p>
          </div>
        </footer>
      </div>
    </div>
  );
}


