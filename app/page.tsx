"use client";

import Link from "next/link";
import Image from "next/image";
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
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
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
              <button className="btn-primary text-sm px-5 py-2">
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="btn-secondary text-sm px-5 py-2">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-24 pb-24 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center overflow-hidden">
        {/* Left Content */}
        <div className="flex flex-col items-start text-left order-2 lg:order-1 relative z-10">
          {/* Tagline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-2xl md:text-3xl lg:text-4xl font-bold font-typewriter leading-tight tracking-tight text-black mb-6"
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
            className="text-lg md:text-xl text-gray-600 max-w-xl mb-10 leading-relaxed"
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
            className="flex flex-col sm:flex-row items-center gap-4 mb-8"
          >
            <Link href="/sign-up">
              <button className="btn-primary text-base px-8 py-3">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/sign-in">
              <button className="btn-secondary text-base px-8 py-3">
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
            className="text-sm text-gray-400 flex items-center gap-2"
          >
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
            </span>
            <span>Loved by 1,000+ readers · Free to start</span>
          </motion.p>
        </div>

        {/* Right Content — Image */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="relative order-1 lg:order-2 scale-110 lg:scale-125 transition-transform duration-500"
        >
          <div className="w-full relative">
            <Image
              src="/Hero Image.png"
              alt="Notes of Tomorrow Hero illustration"
              width={1000}
              height={800}
              priority
              className="relative z-10 w-full h-auto"
            />
          </div>
        </motion.div>
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
            <span className="text-sm font-semibold text-yellow-400 tracking-widest uppercase mb-3 block">
              How It Works
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-typewriter">
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
                  <p className="text-gray-400 text-base leading-relaxed">{step.description}</p>
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
          <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3 block">
            Book Categories
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-typewriter text-black">
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
                <div className="font-bold text-base font-typewriter text-black mb-1">
                  {cat.name}
                </div>
                <div className="text-sm text-gray-400">{cat.books} books</div>
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
            <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3 block">
              What Readers Say
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-typewriter text-black">
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
                  <p className="text-base leading-relaxed text-gray-700 mb-6 flex-1 italic">
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
          <h2 className="text-2xl md:text-3xl font-bold font-typewriter mb-4">
            Your books are waiting
            <br />
            to{" "}
            <span className="text-yellow-400">talk to you.</span>
          </h2>
          <p className="text-gray-400 mb-8 text-base max-w-md mx-auto">
            Join thousands of readers who turned their highlights into a
            living, conversational knowledge base.
          </p>
          <Link href="/sign-up">
            <button className="btn-primary text-base px-10 py-3">
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
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-black transition-colors">Terms</Link>
            <Link href="#" className="hover:text-black transition-colors">Contact</Link>
          </div>
          <span className="text-sm text-gray-400">© 2026 Notes of Tomorrow</span>
        </div>
      </footer>
    </div>
  );
}
