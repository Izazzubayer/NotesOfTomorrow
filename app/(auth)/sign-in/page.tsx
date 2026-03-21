"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";

import { auth } from "@/lib/firebase/client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // Exchange Firebase ID token for a secure server session cookie
  const createSessionAndRedirect = async (user: import("firebase/auth").User) => {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Failed to create secure session.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await createSessionAndRedirect(user);
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await createSessionAndRedirect(user);
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between">
        <Link href="/" className="font-bold font-typewriter text-lg text-black">
          Notes of <span className="highlight-yellow">Tomorrow</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="btn-primary text-sm px-5 py-2">Sign In</button>
          <Link href="/sign-up">
            <button className="btn-secondary text-sm px-5 py-2">Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="paper-card-static rounded-3xl w-full max-w-4xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Left — Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-10 md:p-12 flex flex-col justify-center"
            >
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-2">Welcome back</p>
                <h1 className="text-2xl font-bold font-typewriter text-black leading-snug">
                  Let&apos;s all keep an{" "}
                  <span className="font-bold">Open Mind</span>
                  <br />
                  and learn from one another
                  <br />
                  and grow together.
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">
                    User Name <span className="text-gray-400 font-normal">👤</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-9 pr-4 py-2.5 border border-black/20 rounded-xl text-sm font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">
                    Password <span className="text-gray-400 font-normal">🔑</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 border border-black/20 rounded-xl text-sm font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="text-right">
                  <Link href="#" className="text-xs text-gray-500 hover:text-black transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
                    or continue with
                  </div>
                </div>

                {/* Google OAuth */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-black/20 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>

              <p className="mt-6 text-xs text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="font-bold text-black underline underline-offset-2">
                  Sign Up
                </Link>
              </p>
            </motion.div>

            {/* Right — Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex bg-gray-50 items-center justify-center p-10 relative overflow-hidden"
            >
              {/* Blob */}
              <div className="absolute w-72 h-72 bg-gray-200 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-70" />

              {/* Book stack illustration */}
              <svg viewBox="0 0 280 300" className="relative w-56 h-56" aria-label="Girl reading on a stack of books">
                {/* Leaves / Plant */}
                <path d="M45 120 Q25 80 50 60 Q55 100 45 120Z" fill="#1f2937" />
                <path d="M55 110 Q35 75 55 55 Q65 95 55 110Z" fill="#374151" />
                {/* Stack of books */}
                {/* Book 1 - bottom black */}
                <rect x="60" y="220" width="160" height="30" rx="4" fill="#111827" />
                <rect x="60" y="220" width="8" height="30" rx="2" fill="#374151" />
                {/* Book 2 - yellow */}
                <rect x="65" y="195" width="150" height="28" rx="4" fill="#ffba00" />
                <rect x="65" y="195" width="8" height="28" rx="2" fill="#f59e0b" />
                {/* Book 3 - white/light */}
                <rect x="68" y="172" width="145" height="26" rx="4" fill="#f0fdf4" stroke="#111827" strokeWidth="1.5" />
                <rect x="68" y="172" width="8" height="26" rx="2" fill="#bbf7d0" />
                {/* Book 4 - dark */}
                <rect x="72" y="152" width="137" height="23" rx="4" fill="#1e1b4b" />
                <rect x="72" y="152" width="8" height="23" rx="2" fill="#312e81" />

                {/* Girl sitting on books */}
                {/* Legs crossed */}
                <ellipse cx="140" cy="165" rx="35" ry="18" fill="#374151" />
                {/* Body */}
                <ellipse cx="140" cy="135" rx="26" ry="30" fill="#fbbf24" />
                {/* Head */}
                <circle cx="140" cy="100" r="22" fill="#fde68a" />
                {/* Hair */}
                <path d="M118 96 Q140 72 162 96 Q158 78 140 74 Q122 78 118 96Z" fill="#1f2937" />
                <path d="M118 96 Q112 110 116 125" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Book in hands */}
                <rect x="118" y="118" width="44" height="32" rx="4" fill="#111827" />
                <rect x="118" y="118" width="5" height="32" rx="2" fill="#374151" />
                {/* Lines on book */}
                <line x1="127" y1="126" x2="155" y2="126" stroke="#6b7280" strokeWidth="1.5" />
                <line x1="127" y1="132" x2="155" y2="132" stroke="#6b7280" strokeWidth="1.5" />
                <line x1="127" y1="138" x2="148" y2="138" stroke="#6b7280" strokeWidth="1.5" />
                {/* Eyes reading */}
                <circle cx="133" cy="99" r="3" fill="#1f2937" />
                <circle cx="147" cy="99" r="3" fill="#1f2937" />
                <circle cx="134" cy="98" r="1" fill="white" />
                <circle cx="148" cy="98" r="1" fill="white" />
                {/* Small plant pot */}
                <rect x="220" y="240" width="22" height="20" rx="4" fill="#fbbf24" />
                <ellipse cx="231" cy="235" rx="12" ry="14" fill="#065f46" />
                {/* Falling leaves */}
                <ellipse cx="80" cy="55" rx="8" ry="12" fill="#1f2937" transform="rotate(-30 80 55)" />
                <ellipse cx="195" cy="75" rx="6" ry="10" fill="#374151" transform="rotate(20 195 75)" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
