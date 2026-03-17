"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquare, Sparkles, Star, ChevronRight } from "lucide-react";

const categories = [
  { name: "Finance", emoji: "💰", books: 12 },
  { name: "Intellect", emoji: "🧠", books: 9 },
  { name: "Occupation", emoji: "💼", books: 7 },
  { name: "Physique", emoji: "💪", books: 8 },
  { name: "Social", emoji: "🤝", books: 6 },
  { name: "Spiritual", emoji: "✨", books: 5 },
];

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Drop your Kindle highlights, Google Play Books export, or paste your notes directly.",
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    number: "02",
    title: "Chat",
    description: "Describe your current situation — career, relationships, health — and start talking.",
    icon: <MessageSquare className="w-6 h-6" />,
  },
  {
    number: "03",
    title: "Apply",
    description: "Get specific, actionable guidance rooted in the ideas you already highlighted and loved.",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

const testimonials = [
  {
    quote: "I described my career dilemma and it pulled the exact passage I'd highlighted in 'Start With Why'. I felt like it knew me.",
    author: "Aisha K.",
    role: "Product Manager",
    rating: 5,
  },
  {
    quote: "Instead of re-reading 'Atomic Habits' for the third time, I just chatted with it for 10 minutes. Game changer.",
    author: "James M.",
    role: "Entrepreneur",
    rating: 5,
  },
  {
    quote: "Finally, my Kindle highlights are actually useful. The situational context feature is brilliant.",
    author: "Priya R.",
    role: "Researcher",
    rating: 5,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white paper-texture">
      {/* ─── Navbar ───────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold tracking-tight text-black font-typewriter">
              Notes of{" "}
              <span className="highlight-yellow">Tomorrow</span>
            </span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <button className="btn-yellow text-sm px-5 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <span className="text-sm font-semibold text-black hover-underline cursor-pointer">
                Sign Up
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <span className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            AI-Powered Book Companion
          </span>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="mb-10 relative"
        >
          <div className="w-64 h-64 mx-auto relative">
            {/* Blob background */}
            <div className="absolute inset-0 bg-indigo-100 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-60" />
            {/* Desk illustration — SVG */}
            <svg viewBox="0 0 300 280" className="relative w-full h-full" aria-label="Person studying at desk at night">
              {/* Window */}
              <rect x="200" y="20" width="80" height="100" rx="6" fill="#1e1b4b" opacity="0.9" />
              <rect x="208" y="28" width="30" height="40" rx="3" fill="#4f46e5" opacity="0.7" />
              <rect x="242" y="28" width="30" height="40" rx="3" fill="#4338ca" opacity="0.7" />
              {/* Stars */}
              <circle cx="215" cy="15" r="1.5" fill="#fbbf24" />
              <circle cx="235" cy="8" r="1" fill="#fbbf24" />
              <circle cx="250" cy="18" r="1.5" fill="#fbbf24" />
              <circle cx="270" cy="10" r="1" fill="#fbbf24" />
              {/* Plant */}
              <rect x="230" y="155" width="8" height="30" rx="4" fill="#92400e" />
              <ellipse cx="234" cy="145" rx="18" ry="22" fill="#065f46" />
              <ellipse cx="220" cy="155" rx="14" ry="16" fill="#047857" />
              <ellipse cx="248" cy="152" rx="12" ry="14" fill="#059669" />
              {/* Desk */}
              <rect x="50" y="180" width="210" height="10" rx="3" fill="#374151" />
              <rect x="70" y="190" width="8" height="40" rx="4" fill="#374151" />
              <rect x="240" y="190" width="8" height="40" rx="4" fill="#374151" />
              {/* Monitor */}
              <rect x="130" y="100" width="100" height="75" rx="6" fill="#111827" />
              <rect x="137" y="107" width="86" height="60" rx="4" fill="#1d4ed8" opacity="0.8" />
              <rect x="170" y="175" width="24" height="8" rx="2" fill="#374151" />
              {/* Lamp */}
              <line x1="95" y1="180" x2="95" y2="130" stroke="#6b7280" strokeWidth="3" />
              <ellipse cx="95" cy="125" rx="20" ry="10" fill="#fbbf24" opacity="0.9" />
              <ellipse cx="95" cy="122" rx="9" ry="4" fill="#f59e0b" />
              {/* Lamp glow */}
              <ellipse cx="95" cy="145" rx="30" ry="15" fill="#fbbf24" opacity="0.1" />
              {/* Person */}
              <circle cx="160" cy="120" r="18" fill="#fde68a" />
              {/* Hair */}
              <path d="M142 112 Q160 95 178 112 Q175 100 160 97 Q145 100 142 112Z" fill="#1f2937" />
              {/* Body */}
              <ellipse cx="160" cy="162" rx="22" ry="18" fill="#fbbf24" />
              {/* Arm on desk */}
              <path d="M148 158 Q140 170 135 178" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" fill="none" />
              {/* Hand on face thinking */}
              <path d="M172 138 Q176 148 170 155" stroke="#fde68a" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Coffee */}
              <rect x="60" y="168" width="18" height="14" rx="3" fill="#7c3aed" />
              <path d="M78 172 Q85 172 82 178 Q80 183 78 182" stroke="#7c3aed" strokeWidth="2" fill="none" />
              {/* Steam */}
              <path d="M65 165 Q67 158 65 152" stroke="#9ca3af" strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M70 165 Q72 158 70 152" stroke="#9ca3af" strokeWidth="1.5" fill="none" opacity="0.6" />
              {/* Cat */}
              <ellipse cx="220" cy="225" rx="20" ry="12" fill="#d97706" />
              <circle cx="212" cy="215" r="9" fill="#d97706" />
              <polygon points="207,208 210,200 213,208" fill="#d97706" />
              <polygon points="215,208 218,200 221,208" fill="#d97706" />
              <circle cx="210" cy="215" r="2" fill="#1f2937" />
              <path d="M205 220 Q212 222 220 220" stroke="#92400e" strokeWidth="1" fill="none" />
              {/* Pencil cup */}
              <rect x="85" y="162" width="16" height="20" rx="4" fill="#db2777" />
              <line x1="89" y1="162" x2="86" y2="148" stroke="#fbbf24" strokeWidth="2.5" />
              <line x1="93" y1="162" x2="93" y2="147" stroke="#374151" strokeWidth="2.5" />
              <line x1="97" y1="162" x2="98" y2="149" stroke="#ef4444" strokeWidth="2.5" />
            </svg>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="text-4xl md:text-5xl lg:text-6xl font-bold font-typewriter leading-tight tracking-tight text-black mb-6 max-w-3xl"
        >
          Don&apos;t Just Read A Book.
          <br />
          Chat With It.
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          className="text-base text-gray-600 max-w-xl mb-10 leading-relaxed"
        >
          Upload your highlights. Describe your situation. Get wisdom from your
          books that actually applies to your life — right now.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={4}
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/sign-up">
            <button className="btn-yellow text-base px-8 py-3">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/sign-in">
            <button className="btn-ghost text-base px-8 py-3">
              Sign In
            </button>
          </Link>
        </motion.div>

        {/* Social proof bar */}
        <motion.p
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeUp}
          className="mt-8 text-xs text-gray-400 flex items-center gap-2"
        >
          <span className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </span>
          <span>Loved by 1,000+ readers · Free to start</span>
        </motion.p>
      </section>

      {/* ─── How It Works ─────────────────────────────── */}
      <section className="bg-black text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-yellow-400 tracking-widest uppercase mb-3 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-typewriter">
              From highlights to wisdom,
              <br />
              in minutes.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeUp}
                className="relative"
              >
                <div className="border border-white/20 rounded-2xl p-8 h-full hover:border-yellow-400 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-yellow-400 font-bold text-sm font-typewriter">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-typewriter">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow connector */}
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-yellow-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3 block">
            Book Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-typewriter text-black">
            Organize your reading by
            <br />
            what matters to you.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.1}
              variants={fadeUp}
            >
              <div className="paper-card p-6 text-center cursor-pointer group">
                <span className="text-3xl mb-3 block">{cat.emoji}</span>
                <div className="font-bold text-sm font-typewriter text-black mb-1">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-400">{cat.books} books</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3 block">
              What Readers Say
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-typewriter text-black">
              The &quot;wow&quot; moment is real.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeUp}
              >
                <div className="paper-card-static p-7 h-full flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 mb-6 flex-1 italic">
                    &quot;{t.quote}&quot;
                  </p>
                  <div>
                    <div className="font-bold text-black text-sm">{t.author}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="paper-card-static bg-black text-white p-16 rounded-3xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-typewriter mb-4">
            Your books are waiting
            <br />
            to{" "}
            <span className="text-yellow-400">talk to you.</span>
          </h2>
          <p className="text-gray-400 mb-8 text-sm max-w-md mx-auto">
            Join thousands of readers who turned their highlights into a
            living, conversational knowledge base.
          </p>
          <Link href="/sign-up">
            <button className="btn-yellow text-base px-10 py-3">
              Start For Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────────── */}
      <footer className="border-t border-black/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold font-typewriter text-black">
            Notes of <span className="highlight-yellow">Tomorrow</span>
          </span>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms</Link>
            <Link href="#" className="hover:text-black transition-colors">Contact</Link>
          </div>
          <span className="text-xs text-gray-400">© 2026 Notes of Tomorrow</span>
        </div>
      </footer>
    </div>
  );
}
