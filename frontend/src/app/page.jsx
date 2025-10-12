'use client';

import Link from 'next/link';
import { Sparkles, Zap, Shield, Heart, Sun, Moon, Star, ArrowRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { useEffect, useState } from 'react';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    { icon: <Sparkles className="w-8 h-8" />, title: 'Magically Organized', desc: "Color-coded, label-tagged, priority-sorted glory." },
    { icon: <Zap className="w-8 h-8" />, title: 'Lightning Fast', desc: 'Create tasks faster than you can say “write that down”.' },
    { icon: <Shield className="w-8 h-8" />, title: 'Secret Diary Level Secure', desc: 'Protected with HTTPOnly cookies and JWTs.' },
    { icon: <Heart className="w-8 h-8" />, title: 'Delightful', desc: 'Clean, friendly UI that makes getting things done feel good.' },
  ];

  const Testi = (
    { name, title, quote, rating, avatar }
  ) => (
    <div className={`p-6 rounded-2xl border bg-white/80 border-orange-200/50 dark:bg-stone-900/80 dark:border-amber-900/30`}>
      <div className="flex gap-1 mb-4" aria-label={`${rating} star rating`}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-5 h-5 text-orange-500 dark:text-amber-400" />
        ))}
      </div>
      <p className="italic mb-4 text-gray-700 dark:text-amber-200/80">
        “{quote}”
      </p>
      <div className="flex items-center gap-3">
        <div className="text-4xl" role="img" aria-label="avatar">{avatar}</div>
        <div>
          <div className="font-bold text-gray-900 dark:text-amber-200">{name}</div>
          <div className="text-sm text-gray-500 dark:text-amber-400/60">{title}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50 dark:from-stone-900 dark:via-amber-950 dark:to-stone-900`}>
        {/* Nav */}
        <nav className={`sticky top-0 z-50 backdrop-blur-lg border-b bg-white/80 border-orange-200/50 dark:bg-stone-900/80 dark:border-amber-900/30`}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-[#fce4d2] dark:bg-gradient-to-br dark:from-amber-800 dark:to-orange-900`}>
                <span className="text-2xl">🍑</span>
              </div>
              <span className={`bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent text-xl font-bold`}>Peachy Task</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className={`p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900`} aria-label="Toggle theme" title={mounted ? (darkMode ? 'Switch to Light' : 'Switch to Dark') : 'Toggle theme'}>
                {mounted ? (darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <span className="w-5 h-5 inline-block" />}
              </button>
              <Link href="/login" className={`px-4 py-2 rounded-lg font-medium text-orange-700 hover:bg-orange-100 dark:text-amber-300 dark:hover:bg-amber-900/30`}>Sign In</Link>
              <Link href="/signup" className={`px-5 py-2 rounded-lg font-semibold shadow-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white dark:from-amber-700 dark:to-orange-800 dark:hover:from-amber-600 dark:hover:to-orange-700 dark:text-amber-50`}>Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className={`w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl bg-[#fce4d2] dark:bg-gradient-to-br dark:from-amber-800 dark:to-orange-900`}>
                <span className="text-8xl animate-bounce">🍑</span>
              </div>
            </div>
            <h1 className={`bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent text-5xl md:text-6xl font-black mb-6`}>
              Everything&apos;s Peachy<br />When You Get Things Done
            </h1>
            <p className={`text-xl mb-8 max-w-2xl mx-auto text-gray-700 dark:text-amber-200/80`}>
              The world&apos;s most delightfully absurd task management app. Used by DOZENS of people worldwide. Maybe...
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup" className={`px-8 py-4 rounded-xl font-bold text-lg shadow-xl inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white dark:from-amber-700 dark:to-orange-800 dark:hover:from-amber-600 dark:hover:to-orange-700 dark:text-amber-50`}>
                Start Being Productive (ish)
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className={`text-sm mt-4 italic text-orange-600/70 dark:text-amber-400/60`}>
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
              <div key={i} className={`text-center p-6 rounded-2xl border bg-white/80 border-orange-200/50 dark:bg-stone-900/80 dark:border-amber-900/30`}>
                <div className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{s.val}</div>
                <p className={`text-sm font-medium text-gray-600 dark:text-amber-300/70`}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="mb-20">
            <h2 className={`text-4xl font-bold text-center mb-12 text-gray-900 dark:text-amber-200`}>Features That&apos;ll Blow Your Mind*</h2>
            <p className={`text-center text-sm italic mb-8 text-gray-500 dark:text-amber-400/60`}>*Not intended to be literally mind-blowing. Please seek medical attention in the event of a blown mind.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, idx) => (
                <div key={idx} className={`p-6 rounded-2xl transition hover:scale-105 border bg-white/80 border-orange-200/50 hover:border-orange-400 hover:shadow-lg dark:bg-stone-900/80 dark:border-amber-900/30 dark:hover:border-amber-700`}>
                  <div className={`inline-flex p-3 rounded-xl mb-4 bg-orange-100 text-orange-600 dark:bg-amber-900/50 dark:text-amber-300`}>{f.icon}</div>
                  <h3 className={`text-xl font-bold mb-2 text-gray-900 dark:text-amber-200`}>{f.title}</h3>
                  <p className={`text-gray-600 dark:text-amber-300/70`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className={`text-4xl font-bold text-center mb-4 text-gray-900 dark:text-amber-200`}>What Our Users Are Saying</h2>
            <p className={`text-center text-sm italic mb-12 text-gray-500 dark:text-amber-400/60`}>(These are 100% real testimonials from 100% fake people.)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Dr. Productivity McTaskface', title: 'Professional List Maker', quote: "I used to forget everything. My keys, my dog's name, even breathing sometimes. But since using Peachy Task, I've remembered 847 things! Now I breathe EXCLUSIVELY on schedule.", rating: 5, avatar: '🧑‍⚕️' },
                { name: "Barbara 'The Organizer' Jenkins", title: 'Chaos Elimination Specialist', quote: "Before Peachy Task, my life was a mess. I had 47 different to-do apps and still forgot to feed my houseplants. Now? My plants are thriving, my tasks are color-coded, and I've achieved enlightenment. 10/10 would organize again.", rating: 5, avatar: '👩‍💼' },
                { name: 'Kevin the Procrastinator', title: 'Former Professional Delayer', quote: "I'll write this testimonial later... Just kidding! I ALREADY DID IT because Peachy Task cured my procrastination in 3.7 seconds. I've accomplished more in the last week than in my entire life. I've even started doing tasks that don't exist yet.", rating: 5, avatar: '🧔' },
                { name: 'Princess Sparkle Whiskers III', title: 'Professional Cat (Yes, Really)', quote: "Meow meow meow meow. Meow meow MEOW meow meow. Peachy Task meow meow. *knocks water glass off table* 5 stars.", rating: 5, avatar: '🐱' },
              ].map((t, i) => (
                <Testi key={i} {...t} />
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className={`text-center p-12 rounded-3xl border bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300 dark:from-amber-900/50 dark:to-orange-900/50 dark:border-amber-700`}>
            <h2 className={`text-4xl font-bold mb-4 text-gray-900 dark:text-amber-100`}>Ready to Make Everything Peachy?</h2>
            <p className={`text-lg mb-8 text-gray-700 dark:text-amber-200/70`}>Join the dozens who discovered the peachy path to productivity!</p>
            <Link href="/signup" className={`px-10 py-4 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white dark:from-amber-700 dark:to-orange-800 dark:hover:from-amber-600 dark:hover:to-orange-700 dark:text-amber-50`}>Get Started For Free</Link>
            <p className={`text-xs italic mt-4 text-gray-500 dark:text-amber-400/50`}>No credit card required. No commitment. Just pure, unadulterated task management bliss.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className={`border-t py-8 bg-white/80 border-orange-200/50 dark:bg-stone-900/80 dark:border-amber-900/30`}>
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">🍑</span>
              <span className={`font-bold text-orange-600 dark:text-amber-300`}>Peachy Task</span>
            </div>
            <p className={`text-sm mb-2 text-gray-500 dark:text-amber-400/60`}>Making task management ridiculously delightful since approximately 5 minutes ago.</p>
            <p className={`text-xs italic text-gray-400 dark:text-amber-400/40`}>© 2025 Peachy Task. All rights reserved. Dragons included free of charge. 🐉</p>
          </div>
        </footer>
    </div>
  );
}


