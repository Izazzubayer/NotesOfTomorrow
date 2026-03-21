"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Plus,
  BookOpen,
  Landmark,
  Brain,
  Briefcase,
  Dumbbell,
  Users,
  Sparkles,
  Columns,
  Loader2,
} from "lucide-react";
import { auth, db } from "@/lib/firebase/client";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CATEGORY_META: Record<string, { color: string; icon: any }> = {
  finance:    { color: "#ffba00", icon: Landmark },
  intellect:  { color: "#818cf8", icon: Brain },
  occupation: { color: "#34d399", icon: Briefcase },
  physique:   { color: "#f87171", icon: Dumbbell },
  social:     { color: "#60a5fa", icon: Users },
  spiritual:  { color: "#c084fc", icon: Sparkles },
};

const CATEGORIES = Object.keys(CATEGORY_META);
const CATEGORY_LABELS: Record<string, string> = {
  finance: "Finance", intellect: "Intellect", occupation: "Occupation",
  physique: "Physique", social: "Social", spiritual: "Spiritual",
};

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl?: string;
  highlightCount: number;
  status: "ready" | "processing" | "error";
};

function BookCard({ book }: { book: Book }) {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[book.category] ?? CATEGORY_META["intellect"];

  return (
    <motion.div
      className="paper-card relative overflow-hidden group cursor-pointer h-[240px] flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-3 mb-3">
          {/* Cover art or placeholder */}
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              width={44}
              height={60}
              className="rounded-lg object-cover shadow flex-shrink-0"
              unoptimized
            />
          ) : (
            <div
              className="w-11 h-14 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: meta.color + "22" }}
            >
              <BookOpen className="w-5 h-5" style={{ color: meta.color }} />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-bold font-typewriter text-black text-base leading-tight line-clamp-2">
              {book.title}
            </h3>
            <span className="author-tag mt-1 block">{book.author}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
            style={{ backgroundColor: meta.color + "22", color: meta.color }}
          >
            {CATEGORY_LABELS[book.category] ?? book.category}
          </span>
          {book.status === "processing" && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Indexing...
            </span>
          )}
          {book.status === "ready" && (
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {book.highlightCount} highlights
            </span>
          )}
        </div>
      </div>

      {/* Hover action */}
      <AnimatePresence>
        {hovered && book.status === "ready" && (
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
        {category === "All" ? "No books yet" : `No books in ${CATEGORY_LABELS[category] ?? category} yet`}
      </h3>
      <p className="text-base text-gray-400 mb-6 max-w-xs">
        Upload your first book to get started.
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
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("there");

  // Subscribe to the user's books in real-time
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setDisplayName(user.displayName?.split(" ")[0] ?? "there");

      const booksRef = collection(db, "users", user.uid, "books");
      const q = query(booksRef, orderBy("createdAt", "desc"));
      const unsubBooks = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Book, "id">),
        }));
        setBooks(fetched);
        setLoading(false);
      });

      return () => unsubBooks();
    });

    return () => unsubAuth();
  }, []);

  const filteredBooks = activeCategory === "All"
    ? books
    : books.filter((b) => b.category === activeCategory);

  const totalHighlights = books.reduce((sum, b) => sum + (b.highlightCount || 0), 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-2xl font-bold font-typewriter text-black mb-1">
            Welcome back, <span className="highlight-yellow">{displayName}</span>
          </h1>
          <p className="text-base text-gray-500">
            Your library is ready. Pick a book and start a conversation.
          </p>
        </div>
        {!loading && books.length > 0 && (
          <div className="flex items-center gap-3 text-sm font-mono text-gray-400 bg-gray-50/50 px-5 py-2.5 rounded-full border-[1.44px] border-black/10">
            <span className="text-black font-bold">{books.length}</span>
            <span>Books</span>
            <span className="text-gray-200">|</span>
            <span className="text-black font-bold">{totalHighlights}</span>
            <span>Highlights</span>
          </div>
        )}
      </div>

      {/* ─── Category Filters ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-10 overflow-x-auto scrollbar-none -mx-6 px-6 md:mx-0 md:px-0"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory("All")}
            className={activeCategory === "All"
              ? "category-pill-active flex items-center gap-2 whitespace-nowrap"
              : "category-pill-inactive flex items-center gap-2 whitespace-nowrap"}
          >
            <Columns className="w-4 h-4" />
            All Books
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_META[cat].icon;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat
                  ? "category-pill-active flex items-center gap-2 whitespace-nowrap"
                  : "category-pill-inactive flex items-center gap-2 whitespace-nowrap"}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Section Header ───────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold font-typewriter text-black">
            {activeCategory === "All" ? "All Books" : CATEGORY_LABELS[activeCategory] ?? activeCategory}
          </h2>
          {!loading && (
            <p className="text-base text-gray-400 mt-0.5">
              {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} in your library
            </p>
          )}
        </div>
        <Link href="/dashboard/upload">
          <motion.button whileTap={{ scale: 0.97 }} className="btn-primary text-sm px-5 py-2.5">
            <Plus className="w-4 h-4" />
            Add Book
          </motion.button>
        </Link>
      </div>

      {/* ─── Book Grid ────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
