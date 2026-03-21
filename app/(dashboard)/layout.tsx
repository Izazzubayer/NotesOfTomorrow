"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookmarkIcon, LogOut, Upload, Search, Bell, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

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
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Finance");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/sign-in");
  };

  // Layout states based on pathname
  const isDashboardGrid = pathname === "/dashboard";
  const isChatPage = pathname?.includes("/chat");

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
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



            {/* Right — User Menu */}
            <div className="flex items-center gap-3 flex-shrink-0 relative">
              {/* Search */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="Search">
                <Search className="w-5 h-5 text-gray-500" />
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" title="Notifications">
                <Bell className="w-5 h-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
              </button>

              {/* User Avatar + Dropdown */}
              {mounted ? (
                <Sheet>
                  <SheetTrigger
                    render={
                      <button className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold hover:ring-2 hover:ring-yellow-400 transition-all cursor-pointer" />
                    }
                  >
                    IZ
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-sm p-0 border-l border-black">
                    <div className="h-full flex flex-col">
                      <SheetHeader className="px-6 py-6 border-b border-black/10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold">
                            IZ
                          </div>
                          <div>
                            <SheetTitle className="font-typewriter text-base font-bold">
                              Izaz Zubayer
                            </SheetTitle>
                            <p className="text-sm text-gray-400">izaz@notesoftomorrow.com</p>
                          </div>
                        </div>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-black">
                          <BookmarkIcon className="w-4 h-4 text-gray-500" />
                          Your Bookmarks
                        </Link>
                        <Link href="/dashboard/upload" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-black">
                          <Upload className="w-4 h-4 text-gray-500" />
                          Upload a Book
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-black">
                          <Settings className="w-4 h-4 text-gray-500" />
                          Settings
                        </Link>
                      </div>
                      <div className="px-6 py-4 border-t border-black/10">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold opacity-0" />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Page Content ─────────────────────────────── */}
      {!isChatPage ? (
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
          {children}
        </main>
      ) : (
        <main className="w-full flex-1 overflow-hidden">
          {children}
        </main>
      )}
    </div>
  );
}
