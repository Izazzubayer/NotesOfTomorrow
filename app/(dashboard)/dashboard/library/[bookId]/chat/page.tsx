"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────
type Role = "user" | "assistant";

type HighlightCitation = {
  text: string;
  page: string;
};

type Message = {
  id: string;
  role: Role;
  content: string;
  citations?: HighlightCitation[];
  feedback?: "helpful" | "unhelpful" | null;
  timestamp: Date;
};

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_BOOK = {
  id: "1",
  title: "The Psychology of Money",
  author: "Morgan Housel",
  highlightCount: 74,
  category: "Finance",
};

const SAMPLE_HIGHLIGHTS = [
  { text: "Doing well with money isn't necessarily about what you know. It's about how you behave.", page: "p.4" },
  { text: "The most important part of every plan is planning on your plan not going according to plan.", page: "p.98" },
  { text: "Getting money and keeping money are two different skills.", page: "p.23" },
];

const SUGGESTED_PROMPTS = [
  "I'm struggling with saving money — what does this book say?",
  "Quiz me on the 3 key ideas from this book",
  "What did this book say about long-term investing?",
  "I want to challenge the author's view on risk",
  "How does this apply to my career right now?",
];

const OPENING_NUDGES = [
  "Hey! I've read through all 74 of your highlights from **The Psychology of Money**.\n\nBefore we dive in — what's going on in your life right now that made you want to revisit this book?",
  "You've got **74 highlights** from The Psychology of Money. What's on your mind today? Tell me what you're dealing with and I'll pull out what's most relevant for you.",
  "Welcome! Is there a specific situation you're navigating right now, or would you like me to suggest some ideas from the book based on common challenges?",
];

// ─── Highlight Citation Card ─────────────────────────────────
function HighlightCard({ citation }: { citation: HighlightCitation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="highlight-citation mt-3"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-yellow-500 text-xs">💬</span>
        <span className="text-xs font-bold text-gray-500">From your highlights — {citation.page}</span>
      </div>
      <p className="text-xs text-gray-700 italic leading-relaxed">
        &ldquo;{citation.text}&rdquo;
      </p>
    </motion.div>
  );
}

// ─── Message Bubble ──────────────────────────────────────────
function MessageBubble({
  message,
  onFeedback,
}: {
  message: Message;
  onFeedback: (id: string, feedback: "helpful" | "unhelpful") => void;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="chat-bubble-user">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1 max-w-[85%]"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </div>
        <span className="text-xs font-bold text-black">Notes of Tomorrow</span>
      </div>
      <div className="chat-bubble-ai">
        {/* Render message content with **bold** support */}
        <div className="text-sm leading-relaxed">
          {message.content.split("\n").map((line, i) => {
            const boldParsed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
            return (
              <p
                key={i}
                className={i > 0 ? "mt-2" : ""}
                dangerouslySetInnerHTML={{ __html: boldParsed }}
              />
            );
          })}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.citations.map((c, i) => (
              <HighlightCard key={i} citation={c} />
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      {message.feedback === undefined || message.feedback === null ? (
        <div className="flex items-center gap-2 mt-1 pl-2">
          <span className="text-xs text-gray-400">Was this helpful?</span>
          <button
            onClick={() => onFeedback(message.id, "helpful")}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-green-500"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFeedback(message.id, "unhelpful")}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-400"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="pl-2 mt-1">
          <span className="text-xs text-gray-400">
            {message.feedback === "helpful" ? "👍 Thanks for the feedback!" : "👎 Got it, I'll do better."}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2 items-center"
    >
      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3 h-3 text-yellow-400" />
      </div>
      <div className="chat-bubble-ai py-3 px-4">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-black rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Chat Page ──────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: OPENING_NUDGES[0],
      timestamp: new Date(),
      feedback: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [situation, setSituation] = useState("");
  const [situationExpanded, setSituationExpanded] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    setShowSuggested(false);
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

    // Pick a contextual mock response
    const responses: Message[] = [
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "That's a really important thing to be working through. The Psychology of Money speaks directly to this.\n\nMorgan Housel's core argument is that our behavior around money matters far more than our knowledge about it. Most people who struggle financially don't lack information — they lack a **behavioral system** that's built for real human psychology, not theoretical rationality.\n\nFor your situation, I'd draw on two key ideas from your highlights:",
        citations: [
          SAMPLE_HIGHLIGHTS[2],
          {
            text: "The most powerful and most overlooked force in finance is compounding. It works best quietly, and without interruption.",
            page: "p.51",
          },
        ],
        timestamp: new Date(),
        feedback: null,
      },
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Great question. The book's central idea on this is that **wealth is what you don't see** — it's the cars not purchased, the clothes not bought. Most people fall into the trap of confusing spending with success.\n\nHere's what stands out from your highlights for your situation:",
        citations: [
          {
            text: "Someone driving a $100,000 car might be wealthy, or might be broke. You can't tell just by looking.",
            page: "p.87",
          },
        ],
        timestamp: new Date(),
        feedback: null,
      },
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "I love that you're thinking critically about this. Let me steelman Housel's position using your highlights, then we can poke holes in it.\n\nHis case: **Behavior beats intelligence** in investing. The smart person who panic-sells in a downturn underperforms the average person who holds through it. Emotional discipline is the real alpha.",
        citations: [SAMPLE_HIGHLIGHTS[0]],
        timestamp: new Date(),
        feedback: null,
      },
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    setIsTyping(false);
    setMessages((prev) => [...prev, response]);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    inputRef.current?.focus();
    await simulateAIResponse(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = (id: string, feedback: "helpful" | "unhelpful") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback } : m))
    );
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    setShowSuggested(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-72px)] gap-0">
      {/* ─── Left Sidebar ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-black/10 py-6 px-4 gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Library
        </Link>

        {/* Book info */}
        <div className="paper-card-static rounded-2xl p-4">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="font-bold font-typewriter text-sm text-black leading-tight">
            {MOCK_BOOK.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{MOCK_BOOK.author}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="author-tag">{MOCK_BOOK.category}</span>
            <span className="text-xs text-gray-400">{MOCK_BOOK.highlightCount} highlights</span>
          </div>
        </div>

        {/* Key highlights preview */}
        <div>
          <p className="text-xs font-bold text-black mb-2 uppercase tracking-wider">
            Key Highlights
          </p>
          <div className="space-y-2">
            {SAMPLE_HIGHLIGHTS.slice(0, 3).map((h, i) => (
              <div
                key={i}
                className="text-xs text-gray-500 italic leading-relaxed border-l-2 border-yellow-400 pl-2 py-0.5"
              >
                &ldquo;{h.text.slice(0, 80)}...&rdquo;
              </div>
            ))}
          </div>
        </div>

        {/* New chat */}
        <button
          onClick={() => {
            setMessages([
              {
                id: "0",
                role: "assistant",
                content: OPENING_NUDGES[Math.floor(Math.random() * OPENING_NUDGES.length)],
                timestamp: new Date(),
                feedback: null,
              },
            ]);
            setShowSuggested(true);
          }}
          className="btn-ghost text-xs py-2 justify-center mt-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> New Chat
        </button>
      </div>

      {/* ─── Chat Main ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="border-b border-black/10 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden text-gray-400 hover:text-black">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="font-bold font-typewriter text-sm text-black">{MOCK_BOOK.title}</h2>
              <p className="text-xs text-gray-400">{MOCK_BOOK.highlightCount} highlights indexed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">AI Ready</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
          ))}
          <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* ─── Input Area ───────────────────────────── */}
        <div className="flex-shrink-0 border-t border-black/10 px-6 py-4">

          {/* Situation panel */}
          <div className="mb-3">
            <button
              onClick={() => setSituationExpanded(!situationExpanded)}
              className="flex items-center gap-2 text-xs font-semibold text-black hover:text-gray-600 transition-colors"
            >
              <span>📌 What are you working through?</span>
              <span className="text-gray-400">(optional — helps me help you)</span>
              {situationExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {situationExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder={`e.g. "I'm thinking about leaving my job to start a business but I'm scared..."`}
                    rows={2}
                    className="mt-2 w-full px-3 py-2 text-xs border border-black/20 rounded-xl font-mono resize-none focus:outline-none focus:border-black focus:ring-2 focus:ring-yellow-400/30 transition-all bg-gray-50"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suggested prompts */}
          <AnimatePresence>
            {showSuggested && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                {SUGGESTED_PROMPTS.slice(0, 3).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(p)}
                    className="text-xs px-3 py-1.5 border border-black/20 rounded-full hover:bg-black hover:text-white transition-all duration-200 font-medium"
                  >
                    {p}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text input */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your situation or ask anything about this book..."
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
                className="w-full px-4 py-3 border border-black rounded-2xl text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400/40 transition-all"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-yellow-400 hover:text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
