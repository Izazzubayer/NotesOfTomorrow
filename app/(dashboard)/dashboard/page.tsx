"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageSquare, Star, Plus, BookOpen } from "lucide-react";

const CATEGORIES = ["Finance", "Intellect", "Occupation", "Physique", "Social", "Spiritual"];

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
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
    rating: 4,
    description: "Think and Grow Rich was written by Napoleon Hill in 1937 and promoted as a personal development and self-improvement book.",
    highlightCount: 47,
    status: "ready",
  },
  {
    id: "2",
    title: "The Millionaire Next Door",
    author: "Thomas J. Stanley",
    category: "Finance",
    rating: 0,
    description: "The Millionaire Next Door: The Surprising Secrets of America's Wealthy reveals the habits of genuinely wealthy Americans.",
    highlightCount: 32,
    status: "ready",
  },
  {
    id: "3",
    title: "Rich Dad, Poor Dad",
    author: "Robert Kiyosaki",
    category: "Finance",
    rating: 5,
    description: "Rich Dad Poor Dad is a 1997 book written by Robert Kiyosaki and Sharon Lechter. It advocates the importance of financial literacy.",
    highlightCount: 61,
    status: "ready",
  },
  {
    id: "4",
    title: "The Richest Man In Babylon",
    author: "George S. Clason",
    category: "Finance",
    rating: 4,
    description: "Push yourself everyday and become a better you. Ancient wisdom on building wealth through timeless principles.",
    highlightCount: 28,
    status: "ready",
  },
  {
    id: "5",
    title: "Broke Millennial",
    author: "Erin Lowry",
    category: "Finance",
    rating: 3,
    description: "WASHINGTON POST \"COLOR OF MONEY\" BOOK CLUB PICK Stop Living Paycheck to Paycheck and Get Your Financial Life Together.",
    highlightCount: 19,
    status: "ready",
  },
  {
    id: "6",
    title: "The Psychology Of Money",
    author: "Morgan Housel",
    category: "Finance",
    rating: 5,
    description: "Doing well with money isn't necessarily about what you know. It's about how you behave.",
    highlightCount: 74,
    status: "ready",
  },
  {
    id: "7",
    title: "The Financial Diet",
    author: "Chelsea Fagan",
    category: "Finance",
    rating: 3,
    description: "From the Financial Diet blog, the hugely popular website that inspires over a million women a month to improve their money habits.",
    highlightCount: 22,
    status: "ready",
  },
  {
    id: "8",
    title: "UNSHAKEABLE",
    author: "Tony Robbins",
    category: "Finance",
    rating: 4,
    description: "\"THE NEW YORK TIMES BESTSELLER\" Tony Robbins, arguably the most recognizable life and business strategist.",
    highlightCount: 38,
    status: "ready",
  },
  {
    id: "9",
    title: "The 4-Hour Work Week",
    author: "Tim Ferriss",
    category: "Occupation",
    rating: 5,
    description: "The 4-Hour Workweek: Escape 9–5, Live Anywhere, and Join the New Rich.",
    highlightCount: 55,
    status: "ready",
  },
  {
    id: "10",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Intellect",
    rating: 5,
    description: "Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.",
    highlightCount: 89,
    status: "ready",
  },
  {
    id: "11",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Occupation",
    rating: 4,
    description: "Rules for focused success in a distracted world. Professional activities performed in a state of distraction-free concentration.",
    highlightCount: 44,
    status: "ready",
  },
  {
    id: "12",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Spiritual",
    rating: 5,
    description: "A series of personal writings by Marcus Aurelius, Roman Emperor, as a source for his own guidance and self-improvement.",
    highlightCount: 67,
    status: "ready",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="paper-card relative overflow-hidden group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold font-typewriter text-black text-base leading-tight mb-2 line-clamp-2">
          {book.title}
        </h3>

        {/* Author tag + rating */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="author-tag">{book.author}</span>
          {book.rating > 0 && <StarRating rating={book.rating} />}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
          {book.description}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            <BookOpen className="w-3 h-3 inline mr-1" />
            {book.highlightCount} highlights
          </span>
        </div>
      </div>

      {/* Hover overlay — Chat Now */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 rounded-2xl"
          >
            <Link href={`/dashboard/library/${book.id}/chat`}>
              <button className="btn-yellow text-sm px-6 py-2.5">
                <MessageSquare className="w-4 h-4" />
                Chat Now
              </button>
            </Link>
            <Link href={`/dashboard/library/${book.id}`}>
              <button className="text-white/70 text-xs hover:text-white transition-colors">
                View Highlights →
              </button>
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
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Upload your first {category.toLowerCase()} book to get started.
      </p>
      <Link href="/dashboard/upload">
        <button className="btn-yellow text-sm px-6 py-2.5">
          <Plus className="w-4 h-4" />
          Upload a Book
        </button>
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("Finance");

  const filteredBooks = MOCK_BOOKS.filter(
    (b) => b.category === activeCategory
  );

  return (
    <div>
      {/* ─── Category Tabs (Mobile) ────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-8 pb-1 md:hidden">
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

      {/* ─── Section Header ───────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-typewriter text-black">{activeCategory}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <Link href="/dashboard/upload">
          <button className="btn-yellow text-sm px-5 py-2">
            <Plus className="w-4 h-4" />
            Add Book
          </button>
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
                transition={{ delay: i * 0.05, duration: 0.3 }}
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
