"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Star, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["Finance", "Intellect", "Occupation", "Physique", "Social", "Spiritual"];

type Step = 1 | 2 | 3 | 4;

type BookMeta = {
  title: string;
  author: string;
  category: string;
  rating: number;
  personalNote: string;
};

export default function UploadPage() {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "paste">("file");
  const [meta, setMeta] = useState<BookMeta>({
    title: "",
    author: "",
    category: "Finance",
    rating: 0,
    personalNote: "",
  });
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      // Auto-detect title from filename
      const nameWithoutExt = f.name.replace(/\.(txt|pdf|docx)$/i, "");
      setMeta((m) => ({ ...m, title: nameWithoutExt }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleProceedToMeta = () => {
    if ((uploadMethod === "file" && file) || (uploadMethod === "paste" && pastedText.trim())) {
      setStep(2);
    }
  };

  const handleStartProcessing = async () => {
    setStep(3);
    setProcessing(true);
    // Simulate processing
    await new Promise((r) => setTimeout(r, 2500));
    setProcessedCount(Math.floor(Math.random() * 40) + 20);
    setProcessing(false);
    setStep(4);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-black transition-colors mb-4 inline-flex items-center gap-1">
          ← Back to Library
        </Link>
        <h1 className="text-3xl font-bold font-typewriter text-black">Upload a Book</h1>
        <p className="text-sm text-gray-500 mt-1">Add your highlights to start chatting with your next book.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`h-0.5 w-12 transition-all duration-300 ${step > s ? "bg-black" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
        <div className="ml-3 text-xs text-gray-400 font-medium">
          {step === 1 && "Choose file"}
          {step === 2 && "Book details"}
          {step === 3 && "Processing..."}
          {step === 4 && "Done!"}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 1: File Upload ───────────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Method toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setUploadMethod("file")}
                className={uploadMethod === "file" ? "category-pill-active" : "category-pill-inactive border border-black/10"}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadMethod("paste")}
                className={uploadMethod === "paste" ? "category-pill-active" : "category-pill-inactive border border-black/10"}
              >
                Paste Text
              </button>
            </div>

            {uploadMethod === "file" ? (
              <>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-black bg-yellow-50"
                      : file
                      ? "border-black bg-gray-50"
                      : "border-black/20 hover:border-black hover:bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-bold text-black text-sm">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Upload className="w-7 h-7 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-black text-sm">
                          {isDragActive ? "Drop it here!" : "Drag & drop your highlights"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          .docx (Google Play Books) · .txt (Kindle) · .pdf — max 10MB
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-black underline underline-offset-2">
                        or click to browse
                      </span>
                    </div>
                  )}
                </div>

                {/* Format hints */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Google Play Books", ext: ".docx", color: "bg-blue-50 border-blue-100" },
                    { label: "Kindle Export", ext: ".txt", color: "bg-orange-50 border-orange-100" },
                    { label: "PDF Highlights", ext: ".pdf", color: "bg-red-50 border-red-100" },
                  ].map((fmt) => (
                    <div key={fmt.ext} className={`${fmt.color} border rounded-xl p-3 text-center`}>
                      <p className="text-xs font-bold text-black">{fmt.label}</p>
                      <p className="text-xs text-gray-400">{fmt.ext}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your highlights here...

  Example:
  'You do not rise to the level of your goals. You fall to the level of your systems.'

  'The most effective form of learning is practice, not planning.'"
                  rows={12}
                  className="w-full p-4 border border-black/20 rounded-2xl text-sm font-mono resize-none focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {pastedText.length > 0
                    ? `~${Math.ceil(pastedText.split('\n').filter(l => l.trim()).length)} highlight segments detected`
                    : "Paste text highlights separated by line breaks"}
                </p>
              </div>
            )}

            <button
              onClick={handleProceedToMeta}
              disabled={uploadMethod === "file" ? !file : !pastedText.trim()}
              className="btn-black w-full py-3 mt-6 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ─── Step 2: Book Metadata ─────────────────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Book Title *</label>
              <input
                type="text"
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                placeholder="e.g. Atomic Habits"
                className="w-full px-4 py-3 border border-black/20 rounded-xl text-sm font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1.5">Author *</label>
              <input
                type="text"
                value={meta.author}
                onChange={(e) => setMeta({ ...meta, author: e.target.value })}
                placeholder="e.g. James Clear"
                className="w-full px-4 py-3 border border-black/20 rounded-xl text-sm font-mono focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-2">Category *</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMeta({ ...meta, category: cat })}
                    className={meta.category === cat ? "category-pill-active" : "category-pill-inactive border border-black/20"}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-2">Your Rating (optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setMeta({ ...meta, rating: s === meta.rating ? 0 : s })}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${s <= meta.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1.5">
                Why did you read this? <span className="font-normal text-gray-400">(optional — helps the AI)</span>
              </label>
              <textarea
                value={meta.personalNote}
                onChange={(e) => setMeta({ ...meta, personalNote: e.target.value })}
                placeholder="e.g. I wanted to understand how to build better habits for my fitness routine..."
                rows={3}
                className="w-full px-4 py-3 border border-black/20 rounded-xl text-sm font-mono resize-none focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 justify-center">
                Back
              </button>
              <button
                onClick={handleStartProcessing}
                disabled={!meta.title || !meta.author}
                className="btn-yellow flex-1 py-3 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Upload Book <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── Step 3: Processing ───────────────────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold font-typewriter text-black mb-3">
              Extracting your highlights...
            </h2>
            <p className="text-sm text-gray-400 mb-8">
              This usually takes under 30 seconds. You can navigate away — we&apos;ll notify you when ready.
            </p>
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Parsing file...</span>
                <span>Generating embeddings...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step 4: Done ─────────────────────────── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.1 }}
              className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-black" />
            </motion.div>
            <h2 className="text-2xl font-bold font-typewriter text-black mb-2">
              {meta.title || "Your book"} is ready!
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-bold text-black">{processedCount} highlights</span> extracted and indexed.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              The AI has read everything you highlighted. Time to chat.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/library/1/chat">
                <button className="btn-yellow text-sm px-8 py-3">
                  Start Chatting <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn-ghost text-sm px-8 py-3">
                  View Library
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
