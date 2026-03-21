"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import { auth, db } from "@/lib/firebase/client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
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

  const createProfileDoc = async (user: import("firebase/auth").User, displayName: string) => {
    await setDoc(doc(db, "users", user.uid), {
      displayName: displayName || user.displayName || "",
      avatarUrl: user.photoURL || "",
      plan: "free",
      lifeContext: { goals: [], challenges: "" },
      createdAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user's profile with the name they entered
      await updateProfile(user, { displayName: name });
      
      // Create the user document in Firestore
      await createProfileDoc(user, name);
      
      // Create cookie session and redirect
      await createSessionAndRedirect(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // For Google sign in, we always try to create/update the profile document
      // setDoc with merge: true or checking if it exists is better, 
      // but for simplicity setDoc will work (though it resets lifeContext if they already existed)
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName || "",
        avatarUrl: user.photoURL || "",
        plan: "free",
        lifeContext: { goals: [], challenges: "" },
        createdAt: serverTimestamp(),
      }, { merge: true });

      await createSessionAndRedirect(user);
    } catch (err: any) {
      console.error(err);
      setError("Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-black/10">
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

      {/* ── Centered Form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Create your account</p>
            <h1 className="text-3xl font-bold font-typewriter text-black leading-tight">
              Your books have been
              <br />
              waiting to{" "}
              <span className="highlight-yellow">talk to you.</span>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Display Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-semibold text-black mb-1.5"
              >
                Display Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 border border-black/20 rounded-xl text-base font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all bg-white placeholder:text-gray-400"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-semibold text-black mb-1.5"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-black/20 rounded-xl text-base font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all bg-white placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-semibold text-black mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  required
                  className="w-full px-4 pr-11 py-3 border border-black/20 rounded-xl text-base font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all bg-white placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1.5">
                Minimum 8 characters, 1 uppercase, 1 number
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-xs font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 justify-center text-base mt-1"
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
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm text-gray-400 bg-white px-3">
                or continue with
              </div>
            </div>

            {/* Google OAuth */}
            <button
              id="signup-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-black/20 rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-black transition-all bg-white disabled:opacity-50"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-bold text-black underline underline-offset-2 hover:text-yellow-600 transition-colors">
                Sign In
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              By signing up you agree to our{" "}
              <Link href="#" className="underline hover:text-black transition-colors">Terms</Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-black transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
