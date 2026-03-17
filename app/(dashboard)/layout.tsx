"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, LogOut, Upload, Search, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const categories = ["Finance", "Intellect", "Occupation", "Physique", "Social", "Spiritual"];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const mockBookmarks = [
  {
    id: "1",
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    book: "Atomic Habits",
    date: "Jan 12, 2026",
  },
  {
    id: "2",
    text: "The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity to improve our condition.",
    book: "The Obstacle Is the Way",
    date: "Jan 8, 2026",
  },
  {
    id: "3",
    text: "An investment in knowledge pays the best interest.",
    book: "Poor Charlie's Almanack",
    date: "Dec 28, 2025",
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState("Finance");

  // Extract category from URL if on dashboard
  const isDashboard = pathname === "/dashboard" || pathname?.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Top Nav ──────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/dashboard" className="flex-shrink-0">
              <span className="font-bold font-typewriter text-lg text-black">
                <span className="highlight-yellow">Notes</span> Of Tomorrow
              </span>
            </Link>

            {/* Category tabs — center */}
            {isDashboard && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {categories.map((cat) => (
                  <Link key={cat} href={`/dashboard?category=${cat.toLowerCase()}`}>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={
                        activeCategory === cat
                          ? "category-pill-active"
                          : "category-pill-inactive"
                      }
                    >
                      {cat}
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Search */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Search">
                <Search className="w-4 h-4 text-gray-500" />
              </button>

              {/* Upload */}
              <Link href="/dashboard/upload">
                <button className="btn-yellow text-xs px-4 py-2">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              </Link>

              {/* Bookmarks slide-over */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="btn-black text-xs px-4 py-2">
                    <BookmarkIcon className="w-3.5 h-3.5" />
                    Your Bookmarks
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-md p-0 border-l border-black">
                  <div className="h-full flex flex-col">
                    <SheetHeader className="px-6 py-5 border-b border-black/10">
                      <SheetTitle className="font-typewriter text-lg font-bold">
                        Your Bookmarks
                      </SheetTitle>
                      <p className="text-xs text-gray-400">{mockBookmarks.length} saved highlights</p>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                      <AnimatePresence>
                        {mockBookmarks.map((bm, i) => (
                          <motion.div
                            key={bm.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="paper-card-static p-4 rounded-xl"
                          >
                            <p className="text-sm italic text-gray-700 leading-relaxed mb-3">
                              &ldquo;{bm.text}&rdquo;
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-black">{bm.book}</span>
                              <span className="text-xs text-gray-400">{bm.date}</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sign out */}
              <Link href="/">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Sign out">
                  <LogOut className="w-4 h-4 text-gray-500" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Page Content ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
