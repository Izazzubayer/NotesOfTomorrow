"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ArrowRight, CheckCircle, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Phase = "idle" | "uploading" | "done" | "error";

const LOADING_STEPS = [
  "Reading your highlights...",
  "Identifying the book...",
  "Fetching metadata & cover art...",
  "Generating AI index...",
  "Almost there...",
];

type BookResult = {
  bookId: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  highlightCount: number;
};

export default function UploadPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<BookResult | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const processFile = useCallback(async (file: File) => {
    setPhase("uploading");
    setLoadingStep(0);

    // Animate through the loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 2800);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      setPhase("done");
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "Upload failed.");
      setPhase("error");
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) processFile(acceptedFiles[0]);
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    disabled: phase !== "idle",
  });

  const handleStartChatting = async () => {
    if (!result) return;
    if (personalNote.trim()) {
      // Patch the personal note to Firestore in background
      fetch(`/api/books/${result.bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalNote }),
      }).catch(console.error);
    }
    router.push(`/dashboard/library/${result.bookId}/chat`);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="text-xs text-gray-400 hover:text-black transition-colors mb-4 inline-flex items-center gap-1"
        >
          ← Back to Library
        </Link>
        <h1 className="text-3xl font-bold font-typewriter text-black">Upload a Book</h1>
        <p className="text-sm text-gray-500 mt-1">
          Drop your highlights file — we&apos;ll handle the rest.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── IDLE: Drop Zone ─── */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-black bg-yellow-50 scale-[1.02]"
                  : "border-black/20 hover:border-black hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isDragActive ? "bg-yellow-400" : "bg-gray-100"
                  }`}
                >
                  <Upload className={`w-9 h-9 ${isDragActive ? "text-black" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="font-bold text-black text-lg">
                    {isDragActive ? "Drop it here!" : "Drop your highlights file"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    .docx from Google Play Books · .txt from Kindle
                  </p>
                </div>
                <span className="text-xs font-semibold text-black border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-colors">
                  or click to browse
                </span>
              </div>
            </div>

            {/* What happens next */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: "📄", label: "Drop file", sub: ".docx or .txt" },
                { icon: "✨", label: "AI identifies", sub: "Title, author, cover" },
                { icon: "💬", label: "Start chatting", sub: "Instantly" },
              ].map((step) => (
                <div key={step.label} className="text-center p-4 bg-gray-50 rounded-2xl">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <p className="text-xs font-bold text-black">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── UPLOADING: Loading State ─── */}
        {phase === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            {/* Animated rings */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-yellow-400/30"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-yellow-400/50"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <div className="absolute inset-4 rounded-full bg-black flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-lg font-bold font-typewriter text-black mb-2"
              >
                {LOADING_STEPS[loadingStep]}
              </motion.p>
            </AnimatePresence>

            <p className="text-sm text-gray-400">This usually takes 15–30 seconds</p>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {LOADING_STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full bg-black"
                  animate={{
                    width: i === loadingStep ? 24 : 6,
                    height: 6,
                    opacity: i <= loadingStep ? 1 : 0.2,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── DONE: Book Card ─── */}
        {phase === "done" && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success pill */}
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-full w-fit">
              <CheckCircle className="w-4 h-4" />
              {result.highlightCount} highlights indexed
            </div>

            {/* Book card */}
            <div className="flex gap-5 p-5 border border-black/10 rounded-2xl bg-gray-50">
              {result.coverUrl ? (
                <Image
                  src={result.coverUrl}
                  alt={result.title}
                  width={80}
                  height={112}
                  className="rounded-xl object-cover shadow-md flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-20 h-28 bg-black rounded-xl flex-shrink-0 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-yellow-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-black text-lg leading-tight">{result.title}</p>
                <p className="text-sm text-gray-500 mt-1">{result.author}</p>
                <span className="inline-block mt-2 text-xs bg-black text-white px-3 py-1 rounded-full capitalize">
                  {result.category}
                </span>
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">
                Why did you read this?{" "}
                <span className="font-normal text-gray-400">(optional — helps the AI personalise)</span>
              </label>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="e.g. I read this to understand how habits form and to improve my morning routine..."
                rows={3}
                className="w-full px-4 py-3 border border-black/20 rounded-xl text-sm font-mono resize-none focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            {/* CTA */}
            <button
              onClick={handleStartChatting}
              className="btn-primary w-full py-4 justify-center text-base"
            >
              Start Chatting <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* ─── ERROR ─── */}
        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">😞</span>
            </div>
            <h2 className="text-xl font-bold font-typewriter text-black mb-2">Something went wrong</h2>
            <p className="text-sm text-red-500 mb-8">{error}</p>
            <button onClick={() => setPhase("idle")} className="btn-primary px-8 py-3">
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
