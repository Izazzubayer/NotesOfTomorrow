"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Supabase auth integration
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between">
        <Link href="/" className="font-bold font-typewriter text-lg text-black">
          Notes of <span className="highlight-yellow">Tomorrow</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <button className="btn-secondary text-sm px-5 py-2">Sign In</button>
          </Link>
          <button className="btn-primary text-sm px-5 py-2">Sign Up</button>
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
                <p className="text-sm text-gray-500 mb-2">Create your account</p>
                <h1 className="text-2xl font-bold font-typewriter text-black leading-snug">
                  Your books have been
                  <br />
                  waiting to <span className="highlight-yellow">talk to you.</span>
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-9 pr-4 py-2.5 border border-black/20 rounded-xl text-sm font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-black mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  <label className="block text-xs font-semibold text-black mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
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
                  <p className="text-xs text-gray-400 mt-1">Minimum 8 characters, 1 uppercase, 1 number</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm justify-center mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-2">
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
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-black/20 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
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
                Already have an account?{" "}
                <Link href="/sign-in" className="font-bold text-black underline underline-offset-2">
                  Sign In
                </Link>
              </p>

              <p className="mt-3 text-xs text-gray-400">
                By signing up you agree to our{" "}
                <Link href="#" className="underline">Terms</Link> and{" "}
                <Link href="#" className="underline">Privacy Policy</Link>.
              </p>
            </motion.div>

            {/* Right — Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex bg-gray-50 items-center justify-center p-10 relative overflow-hidden"
            >
              <div className="absolute w-72 h-72 bg-yellow-100 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-50" />
              <div className="relative text-center">
                <svg viewBox="0 0 260 260" className="w-48 h-48 mx-auto" aria-label="Open book with sparkles">
                  {/* Open book */}
                  <rect x="30" y="140" width="200" height="80" rx="8" fill="#111827" />
                  <rect x="30" y="140" width="100" height="80" rx="8" fill="#1f2937" />
                  {/* Pages left */}
                  <line x1="50" y1="155" x2="120" y2="155" stroke="#4b5563" strokeWidth="2" />
                  <line x1="50" y1="165" x2="120" y2="165" stroke="#4b5563" strokeWidth="2" />
                  <line x1="50" y1="175" x2="110" y2="175" stroke="#4b5563" strokeWidth="2" />
                  <line x1="50" y1="185" x2="120" y2="185" stroke="#4b5563" strokeWidth="2" />
                  <line x1="50" y1="195" x2="100" y2="195" stroke="#4b5563" strokeWidth="2" />
                  {/* Pages right */}
                  <line x1="140" y1="155" x2="210" y2="155" stroke="#4b5563" strokeWidth="2" />
                  <line x1="140" y1="165" x2="210" y2="165" stroke="#4b5563" strokeWidth="2" />
                  <line x1="140" y1="175" x2="200" y2="175" stroke="#4b5563" strokeWidth="2" />
                  <line x1="140" y1="185" x2="210" y2="185" stroke="#4b5563" strokeWidth="2" />
                  <line x1="140" y1="195" x2="195" y2="195" stroke="#4b5563" strokeWidth="2" />
                  {/* Spine */}
                  <rect x="127" y="138" width="6" height="84" rx="3" fill="#ffba00" />
                  {/* Chat bubble */}
                  <rect x="80" y="50" width="120" height="65" rx="12" fill="#ffba00" />
                  <polygon points="120,115 110,135 140,115" fill="#ffba00" />
                  <line x1="100" y1="70" x2="180" y2="70" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="100" y1="82" x2="175" y2="82" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="100" y1="94" x2="155" y2="94" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Sparkles */}
                  <text x="30" y="70" fontSize="18">✨</text>
                  <text x="210" y="55" fontSize="14">⭐</text>
                  <text x="220" y="130" fontSize="16">💡</text>
                  <text x="20" y="130" fontSize="14">📚</text>
                </svg>
                <p className="text-sm font-bold text-black font-typewriter mt-4">
                  Your reading, upgraded.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  500+ books. Infinite conversations.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
