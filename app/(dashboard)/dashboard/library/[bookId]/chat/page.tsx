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
  FileText,
  Save,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────
type Role = "user" | "assistant";

type HighlightCitation = {
  id: string;
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
  isStreaming?: boolean;
};

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_BOOK = {
  id: "1",
  title: "The Psychology of Money",
  author: "Morgan Housel",
  highlightCount: 74,
  category: "Finance",
};

const SAMPLE_HIGHLIGHTS: HighlightCitation[] = [
  { id: "h1", text: "Doing well with money isn't necessarily about what you know. It's about how you behave.", page: "p.4" },
  { id: "h2", text: "The most important part of every plan is planning on your plan not going according to plan.", page: "p.98" },
  { id: "h3", text: "Getting money and keeping money are two different skills.", page: "p.23" },
  { id: "h4", text: "The most powerful and most overlooked force in finance is compounding. It works best quietly, and without interruption.", page: "p.51" },
  { id: "h5", text: "Someone driving a $100,000 car might be wealthy, or might be broke. You can't tell just by looking.", page: "p.87" },
];

const SUGGESTED_PROMPTS = [
  "I'm struggling with saving money — what does this book say?",
  "Quiz me on the 3 key ideas from this book",
  "What did this book say about long-term investing?",
];

const OPENING_NUDGES = [
  "Hey! I've read through all 74 of your highlights from **The Psychology of Money**.\n\nBefore we dive in — what's going on in your life right now that made you want to revisit this book?",
  "You've got **74 highlights** from The Psychology of Money. What's on your mind today? Tell me what you're dealing with and I'll pull out what's most relevant for you.",
  "Welcome! Is there a specific situation you're navigating right now, or would you like me to suggest some ideas from the book based on common challenges?",
];

// ─── Formatting Helper ───────────────────────────────────────
function formatAIResponse(
  content: string,
  citations: HighlightCitation[],
  onHoverCitation: (id: string | null) => void
) {
  const parts = content.split(/(\[c\d+\]|\*\*.+?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const citationMatch = part.match(/\[c(\d+)\]/);
    if (citationMatch) {
      const idx = parseInt(citationMatch[1], 10) - 1;
      const highlight = citations[idx];
      if (highlight) {
        return (
          <sup
            key={i}
            onMouseEnter={() => onHoverCitation(highlight.id)}
            onMouseLeave={() => onHoverCitation(null)}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold cursor-pointer hover:bg-yellow-400 hover:text-black transition-colors mx-0.5"
          >
            {idx + 1}
          </sup>
        );
      }
    }
    return (
      <span key={i}>
        {part.split("\n").map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  });
}

// ─── Message Bubble ──────────────────────────────────────────
function MessageBubble({
  message,
  onFeedback,
  onHoverCitation,
}: {
  message: Message;
  onFeedback: (id: string, feedback: "helpful" | "unhelpful") => void;
  onHoverCitation: (id: string | null) => void;
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
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </div>
        <span className="text-xs font-bold text-black">Notes of Tomorrow</span>
      </div>
      <div className="chat-bubble-ai">
        <div className="text-sm leading-relaxed">
          {formatAIResponse(message.content, message.citations || [], onHoverCitation)}
          {message.isStreaming && <span className="inline-block w-1.5 h-4 bg-yellow-400 animate-pulse ml-1 align-middle" />}
        </div>
      </div>

      {/* Feedback & Citations */}
      {!message.isStreaming && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3 mt-1 pl-2">
          {message.citations?.map((c, i) => (
            <button
              key={c.id}
              onMouseEnter={() => onHoverCitation(c.id)}
              onMouseLeave={() => onHoverCitation(null)}
              className="text-[10px] font-bold uppercase tracking-wide text-gray-500 hover:text-yellow-600 transition-colors bg-gray-100 hover:bg-yellow-50 px-2 py-1 rounded-md flex items-center gap-1"
            >
              <span className="w-3 h-3 rounded-full bg-yellow-400 text-black flex items-center justify-center text-[8px]">{i + 1}</span>
              {c.page}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            {message.feedback === undefined || message.feedback === null ? (
              <>
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
              </>
            ) : (
              <span className="text-[10px] text-gray-400">
                {message.feedback === "helpful" ? "Helpful" : "Unhelpful"}
              </span>
            )}
          </div>
        </motion.div>
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
  const [savedSituations, setSavedSituations] = useState<string[]>([]);
  const [situationExpanded, setSituationExpanded] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const [hoveredCitationId, setHoveredCitationId] = useState<string | null>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const simulateAIResponse = async (userMessageText: string) => {
    setIsTyping(true);
    setShowSuggested(false);
    
    await new Promise((r) => setTimeout(r, 1000));
    setIsTyping(false);

    const responses = [
      {
        content: `That's a really important thing to be working through. The Psychology of Money speaks directly to this.\n\nMorgan Housel's core argument is that our behavior around money matters far more than our knowledge about it [c1]. Most people who struggle financially don't lack information — they lack a **behavioral system** that's built for real human psychology, not theoretical rationality.\n\nAlso, remember that time is your greatest asset [c2]. For your situation, I would focus on the habits.`,
        citations: [SAMPLE_HIGHLIGHTS[2], SAMPLE_HIGHLIGHTS[3]],
      },
      {
        content: `Great question. The book's central idea on this is that **wealth is what you don't see** — it's the cars not purchased, the clothes not bought [c1]. Most people fall into the trap of confusing spending with success.\n\nIt takes emotional discipline not to signal wealth.`,
        citations: [SAMPLE_HIGHLIGHTS[4]],
      },
      {
        content: `I love that you're thinking critically about this. Let me steelman Housel's position using your highlights, then we can poke holes in it.\n\nHis case: **Behavior beats intelligence** in investing [c1]. The smart person who panic-sells in a downturn underperforms the average person who holds through it. Emotional discipline is the real alpha.\n\nAnd you always need a margin of safety because plans fail [c2].`,
        citations: [SAMPLE_HIGHLIGHTS[0], SAMPLE_HIGHLIGHTS[1]],
      },
    ];

    const chosenResponse = responses[Math.floor(Math.random() * responses.length)];
    const messageId = Date.now().toString();

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: "assistant",
        content: "",
        citations: chosenResponse.citations,
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    let streamedContent = "";
    const chunks = chosenResponse.content.match(/(.{1,5})/g) || [];
    
    for (const chunk of chunks) {
      await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
      streamedContent += chunk;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: streamedContent } : m
        )
      );
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, isStreaming: false } : m
      )
    );
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
    const currentInput = input;
    setInput("");
    inputRef.current?.focus();
    
    await simulateAIResponse(currentInput);
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
    <div className="flex h-[calc(100dvh-73px)] overflow-hidden bg-white">
      {/* ─── Column 1: Highlights Sidebar ─────────────── */}
      <motion.div
        initial={false}
        animate={{ width: leftCollapsed ? 52 : 280 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="flex-shrink-0 border-r border-black/10 flex flex-col bg-[#FAFAFA] overflow-hidden relative"
      >
        {/* Collapse Trigger - Left */}
        <button
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          className="absolute top-5 right-3 z-10 p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-black transition-colors"
          title={leftCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {leftCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <AnimatePresence mode="wait">
          {!leftCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Back + Book info */}
              <div className="p-7 border-b border-black/10">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-[0.15em] transition-colors mb-7"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Library
                </Link>

                <div className="space-y-2">
                  <h3 className="font-bold font-typewriter text-2xl text-black leading-tight pr-10">
                    {MOCK_BOOK.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">{MOCK_BOOK.author}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-6">
                  <span className="bg-black/5 text-gray-600 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md">
                    {MOCK_BOOK.category}
                  </span>
                  <span className="bg-black/5 text-gray-600 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md">
                    {MOCK_BOOK.highlightCount} highlights
                  </span>
                </div>
              </div>

              {/* Highlights list */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
                  Highlights
                </p>
                <div className="space-y-4">
                  {SAMPLE_HIGHLIGHTS.map((h) => {
                    const isHovered = hoveredCitationId === h.id;
                    return (
                      <motion.div
                        key={h.id}
                        animate={{
                          backgroundColor: isHovered ? "#FEF3C7" : "transparent",
                          borderLeftColor: isHovered ? "#FBBF24" : "#d1d5db",
                          scale: isHovered ? 1.01 : 1,
                        }}
                        className="text-sm text-gray-600 italic leading-relaxed border-l-2 pl-3 py-1.5 cursor-default transition-colors"
                      >
                        &ldquo;{h.text}&rdquo;{" "}
                        <span className="not-italic text-gray-400 font-mono text-xs ml-1">{h.page}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Reset */}
              <div className="p-6 border-t border-black/10">
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
                  className="group w-full bg-white border border-black/10 hover:border-black text-[11px] font-bold uppercase tracking-widest py-3 rounded-full flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-colors" />
                  <span>Reset Chat</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical text when collapsed */}
        {leftCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <span 
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap rotate-180"
              style={{ writingMode: 'vertical-rl' }}
            >
              Highlights — {MOCK_BOOK.highlightCount}
            </span>
          </div>
        )}
      </motion.div>

      {/* ─── Column 2: PDF / Document Viewer ──────────── */}
      <div className="flex-1 flex flex-col bg-gray-50 border-r border-black/10 min-w-0 overflow-hidden">

        {/* PDF Placeholder */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-typewriter font-bold text-base text-gray-700 mb-2">
              Document Viewer
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your uploaded PDF will appear here. Highlighted passages will be connected to the AI chat on the right.
            </p>
          </div>
        </div>
      </div>

      <div className="w-[420px] flex-shrink-0 flex flex-col bg-white overflow-hidden relative border-l border-black/10">
        <div className="flex flex-col h-full">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} onHoverCitation={setHoveredCitationId} />
                ))}
                <AnimatePresence>
                  {isTyping && !messages[messages.length-1].isStreaming && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* ─── Input Area ───────────────────────────── */}
              <div className="flex-shrink-0 border-t border-black/10 px-5 py-4 bg-white">

                {/* Suggested prompts */}
                <AnimatePresence>
                  {showSuggested && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="flex flex-wrap gap-2 mb-3"
                    >
                      {SUGGESTED_PROMPTS.map((p, i) => (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={i}
                          onClick={() => handleSuggestedPrompt(p)}
                          className="text-sm px-4 py-2 border-[1.44px] border-black/20 rounded-xl hover:bg-black hover:text-white transition-all duration-200 font-medium bg-white font-mono"
                        >
                          {p}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Text input */}
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {situationExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: "auto", opacity: 1, marginBottom: 8 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#2F2F2F] rounded-2xl p-3 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Context (Optional)</span>
                            <button 
                              onClick={() => {
                                if (situation.trim()) {
                                  setSavedSituations([...savedSituations, situation.trim()]);
                                  setSituation("");
                                }
                              }}
                              disabled={!situation.trim()}
                              className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-30"
                            >
                              Save
                            </button>
                          </div>
                          
                          <textarea
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder={`e.g. "I'm thinking about leaving my job to start a business but I'm scared..."`}
                            rows={2}
                            className="w-full bg-[#1e1e1e] text-white px-3 py-2 text-sm rounded-xl font-mono resize-none focus:outline-none border border-white/5 focus:border-white/10 transition-all mb-2"
                          />
                          
                          {savedSituations.length > 0 && (
                            <div className="space-y-2 mt-2 pt-2 border-t border-white/5">
                              {savedSituations.map((ctx, idx) => (
                                <motion.div 
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={idx} 
                                  className="group flex gap-2 items-start bg-[#1e1e1e] p-2 rounded-lg border border-white/5"
                                >
                                  <div className="flex-1 text-[11px] text-gray-300 font-mono leading-relaxed line-clamp-2">
                                    {ctx}
                                  </div>
                                  <button 
                                    onClick={() => setSavedSituations(savedSituations.filter((_, i) => i !== idx))}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative flex items-center bg-[#2F2F2F] rounded-[24px] px-2 py-2 border-[1px] border-white/10 shadow-lg">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSituationExpanded(!situationExpanded)}
                        className={`ml-1 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${situationExpanded ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                      >
                        <div className="relative">
                          <Plus className={`w-5 h-5 transition-transform duration-300 ${situationExpanded ? 'rotate-45' : 'rotate-0'}`} />
                          {!situationExpanded && savedSituations.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-[1.5px] border-[#2F2F2F] shadow-sm" />
                          )}
                        </div>
                      </motion.button>
                      
                      <textarea
                        ref={inputRef}
                        value={input}
                        onFocus={() => setShowSuggested(false)}
                        onBlur={() => {
                          if (input.length === 0 && messages.length <= 1) {
                            setShowSuggested(true);
                          }
                        }}
                        onChange={(e) => {
                          setInput(e.target.value);
                          if (e.target.value.length > 0) setShowSuggested(false);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about this book..."
                        rows={1}
                        style={{ minHeight: "40px", maxHeight: "120px" }}
                        className="flex-1 bg-transparent pl-2 pr-10 py-2.5 text-white text-sm font-sans placeholder-gray-400 resize-none focus:outline-none transition-all ease-out duration-300"
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = Math.min(el.scrollHeight, 120) + "px";
                        }}
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping || (messages.length > 0 && messages[messages.length-1].isStreaming)}
                        className="absolute right-2 bottom-2 w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 text-black hover:bg-gray-200 disabled:cursor-not-allowed group"
                      >
                        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                      </motion.button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center uppercase tracking-widest font-bold font-mono">
                  AI can make mistakes. Check important info.
                </p>
              </div>
        </div>
      </div>
    </div>
  );
}
