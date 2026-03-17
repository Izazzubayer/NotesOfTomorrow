"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageSquare, Plus, BookOpen, Sparkles, TrendingUp, Library } from "lucide-react";

const CATEGORY_META: Record<string, { color: string }> = {
  Finance: { color: "#ffba00" },
  Intellect: { color: "#818cf8" },
  Occupation: { color: "#34d399" },
  Physique: { color: "#f87171" },
  Social: { color: "#60a5fa" },
  Spiritual: { color: "#c084fc" },
};

const CATEGORIES = Object.keys(CATEGORY_META);

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  highlightCount: number;
  status: "ready" | "processing";
};

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Think & Grow Rich",
    author: "Napoleon Hill",
    category: "Finance",
    description: "Think and Grow Rich was written by Napoleon Hill in 1937 and promoted as a personal development and self-improvement book.",
    highlightCount: 47,
    status: "ready",
  },
  {
    id: "2",
    title: "The Millionaire Next Door",
    author: "Thomas J. Stanley",
    category: "Finance",
    description: "The Millionaire Next Door: The Surprising Secrets of America's Wealthy reveals the habits of genuinely wealthy Americans.",
    highlightCount: 32,
    status: "ready",
  },
  {
    id: "3",
    title: "Rich Dad, Poor Dad",
    author: "Robert Kiyosaki",
    category: "Finance",
    description: "Rich Dad Poor Dad is a 1997 book written by Robert Kiyosaki and Sharon Lechter. It advocates the importance of financial literacy.",
    highlightCount: 61,
    status: "ready",
  },
  {
    id: "4",
    title: "The Richest Man In Babylon",
    author: "George S. Clason",
    category: "Finance",
    description: "Push yourself everyday and become a better you. Ancient wisdom on building wealth through timeless principles.",
    highlightCount: 28,
    status: "ready",
  },
  {
    id: "5",
    title: "Broke Millennial",
    author: "Erin Lowry",
    category: "Finance",
    description: "WASHINGTON POST \"COLOR OF MONEY\" BOOK CLUB PICK Stop Living Paycheck to Paycheck and Get Your Financial Life Together.",
    highlightCount: 19,
    status: "ready",
  },
  {
    id: "6",
    title: "The Psychology Of Money",
    author: "Morgan Housel",
    category: "Finance",
    description: "Doing well with money isn't necessarily about what you know. It's about how you behave.",
    highlightCount: 74,
    status: "ready",
  },
  {
    id: "7",
    title: "The Financial Diet",
    author: "Chelsea Fagan",
    category: "Finance",
    description: "From the Financial Diet blog, the hugely popular website that inspires over a million women a month to improve their money habits.",
    highlightCount: 22,
    status: "ready",
  },
  {
    id: "8",
    title: "UNSHAKEABLE",
    author: "Tony Robbins",
    category: "Finance",
    description: "\"THE NEW YORK TIMES BESTSELLER\" Tony Robbins, arguably the most recognizable life and business strategist.",
    highlightCount: 38,
    status: "ready",
  },
  {
    id: "9",
    title: "The 4-Hour Work Week",
    author: "Tim Ferriss",
    category: "Occupation",
    description: "The 4-Hour Workweek: Escape 9–5, Live Anywhere, and Join the New Rich.",
    highlightCount: 55,
    status: "ready",
  },
  {
    id: "10",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Intellect",
    description: "Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.",
    highlightCount: 89,
    status: "ready",
  },
  {
    id: "11",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Occupation",
    description: "Rules for focused success in a distracted world. Professional activities performed in a state of distraction-free concentration.",
    highlightCount: 44,
    status: "ready",
  },
  {
    id: "12",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Spiritual",
    description: "A series of personal writings by Marcus Aurelius, Roman Emperor, as a source for his own guidance and self-improvement.",
    highlightCount: 67,
    status: "ready",
  },
];

const totalHighlights = MOCK_BOOKS.reduce((sum, b) => sum + b.highlightCount, 0);



function BookCard({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="paper-card relative overflow-hidden group cursor-pointer h-[240px] flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="p-6 flex flex-col flex-1">

        {/* Title */}
        <h3 className="font-bold font-typewriter text-black text-lg leading-tight mb-2 line-clamp-2">
          {book.title}
        </h3>

        {/* Author */}
        <span className="author-tag mb-4 self-start">{book.author}</span>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {book.description}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
          <span className="text-sm text-gray-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {book.highlightCount} highlights
          </span>
        </div>
      </div>

      {/* Sleek bottom action bar */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-black/10 flex items-center gap-2"
          >
            <Link href={`/dashboard/library/${book.id}/chat`} className="flex-1">
              <motion.button whileTap={{ scale: 0.95 }} className="w-full btn-primary text-sm py-3 justify-center">
                <MessageSquare className="w-4 h-4" />
                Chat with this book
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <BookOpen className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="font-bold font-typewriter text-black text-lg mb-2">
        No books in {category} yet
      </h3>
      <p className="text-base text-gray-400 mb-6 max-w-xs">
        Upload your first {category.toLowerCase()} book to get started.
      </p>
      <Link href="/dashboard/upload">
        <motion.button whileTap={{ scale: 0.97 }} className="btn-primary text-sm px-6 py-2.5">
          <Plus className="w-4 h-4" />
          Upload a Book
        </motion.button>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredBooks = activeCategory === "All"
    ? MOCK_BOOKS
    : MOCK_BOOKS.filter((b) => b.category === activeCategory);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-2xl font-bold font-typewriter text-black mb-1">
            Welcome back, <span className="highlight-yellow">Izaz</span>
          </h1>
          <p className="text-base text-gray-500">
            Your library is ready. Pick a book and start a conversation.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono text-gray-400 bg-gray-50/50 px-5 py-2.5 rounded-full border-[1.44px] border-black/10">
          <span className="text-black font-bold">{MOCK_BOOKS.length}</span>
          <span>Books</span>
          <span className="text-gray-200">|</span>
          <span className="text-black font-bold">{totalHighlights}</span>
          <span>Highlights</span>
          <span className="text-gray-200">|</span>
          <span className="text-black font-bold">6</span>
          <span>Categories</span>
        </div>
      </div>

      {/* ─── Category Filters ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 overflow-x-auto scrollbar-none -mx-6 px-6 md:mx-0 md:px-0"
      >
        <div className="inline-flex items-center gap-1 p-1.5 bg-gray-50 rounded-full border border-gray-200">
          <button
            onClick={() => setActiveCategory("All")}
            className={activeCategory === "All" ? "category-pill-active whitespace-nowrap" : "category-pill-inactive whitespace-nowrap"}
          >
            All Notes
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "category-pill-active whitespace-nowrap" : "category-pill-inactive whitespace-nowrap"}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Section Header ───────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-typewriter text-black">
            {activeCategory === "All" ? "All Books" : activeCategory}
          </h2>
          <p className="text-base text-gray-400 mt-0.5">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <Link href="/dashboard/upload">
          <motion.button whileTap={{ scale: 0.97 }} className="btn-primary text-sm px-5 py-2.5">
            <Plus className="w-4 h-4" />
            Add Book
          </motion.button>
        </Link>
      </div>

      {/* ─── Book Grid ────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredBooks.length === 0 ? (
            <EmptyState category={activeCategory} />
          ) : (
            filteredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
