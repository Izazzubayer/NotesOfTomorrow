"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
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
  Loader2,
  ZoomIn,
  ZoomOut,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase/client";
import { doc, collection, getDoc, getDocs, orderBy, query, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

type BookData = {
  id: string;
  title: string;
  author: string;
  highlightCount: number;
  category: string;
  coverUrl?: string;
};

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

// ─── Highlight Viewer (Column 2) ─────────────────────────────
function HighlightViewer({
  highlights,
  hoveredCitationId,
  onHoverHighlight,
  book,
}: {
  highlights: HighlightCitation[];
  hoveredCitationId: string | null;
  onHoverHighlight: (id: string | null) => void;
  book: BookData;
}) {
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  const filtered = search.trim()
    ? highlights.filter((h) => h.text.toLowerCase().includes(search.toLowerCase()))
    : highlights;

  // Auto-scroll to hovered highlight
  useEffect(() => {
    if (hoveredCitationId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [hoveredCitationId]);

  return (
    <div className="flex-1 flex flex-col bg-[#F7F6F2] border-r border-black/10 min-w-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-black/8 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {filtered.length} / {highlights.length} highlights
          </span>
        </div>
        <div className="flex items-center gap-1">
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 180, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search highlights…"
                  className="w-full text-sm bg-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-black/8"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch(""); }}
            className={`p-1.5 rounded-lg transition-colors ${
              showSearch ? "bg-yellow-400 text-black" : "hover:bg-black/5 text-gray-400 hover:text-black"
            }`}
            title="Search highlights"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
          <div className="w-px h-4 bg-black/10 mx-1" />
          <button
            onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
            disabled={zoom <= 0.7}
            className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-black transition-colors disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-gray-400 w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))}
            disabled={zoom >= 1.6}
            className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-black transition-colors disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Highlights scroll area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div
          className="mx-auto py-10 px-8 max-w-2xl"
          style={{ fontSize: `${zoom}rem` }}
        >
          {/* Book header */}
          <div className="mb-10 pb-8 border-b-2 border-black/8">
            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.25em] mb-3">Your highlights</p>
            <h1
              className="font-typewriter font-bold leading-tight text-black mb-1"
              style={{ fontSize: `${1.4 * zoom}rem` }}
            >
              {book.title}
            </h1>
            <p className="text-gray-500" style={{ fontSize: `${0.8 * zoom}rem` }}>
              {book.author}
            </p>
          </div>

          {/* Highlight cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No highlights match your search.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((h, idx) => {
                const isActive = hoveredCitationId === h.id;
                return (
                  <motion.div
                    key={h.id}
                    ref={isActive ? highlightedRef : null}
                    animate={{
                      backgroundColor: isActive ? "#FEF9C3" : "transparent",
                      borderLeftColor: isActive ? "#FBBF24" : "transparent",
                    }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => onHoverHighlight(h.id)}
                    onMouseLeave={() => onHoverHighlight(null)}
                    className="group relative pl-5 pr-3 py-4 rounded-r-lg border-l-4 cursor-default transition-all"
                    style={{ borderLeftColor: isActive ? "#FBBF24" : "transparent" }}
                  >
                    {/* Highlight number */}
                    <span
                      className="absolute left-[-2px] top-4 text-[0.55rem] font-mono text-gray-300 group-hover:text-gray-400 transition-colors select-none"
                      style={{ writingMode: "horizontal-tb", fontSize: `${0.6 * zoom}rem` }}
                    >
                      {idx + 1}
                    </span>

                    {/* Highlight mark – yellow strip behind text when active */}
                    {isActive && (
                      <motion.div
                        layoutId="active-glow"
                        className="absolute inset-0 bg-yellow-100/60 rounded-r-lg pointer-events-none"
                      />
                    )}

                    <p
                      className="relative text-gray-800 leading-[1.8] font-serif italic"
                      style={{ fontSize: `${0.9 * zoom}rem` }}
                    >
                      &ldquo;{h.text}&rdquo;
                    </p>
                    {h.page && (
                      <p
                        className="relative mt-1.5 font-mono text-gray-400 not-italic"
                        style={{ fontSize: `${0.65 * zoom}rem` }}
                      >
                        {h.page}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-black/8 text-center">
            <p className="text-[0.65rem] text-gray-300 uppercase tracking-widest font-mono">
              End of highlights · {highlights.length} passages
            </p>
          </div>
        </div>
      </div>
    </div>
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

export default function ChatPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  // ── Real data ─────────────────────────────────────────────
  const [book, setBook] = useState<BookData | null>(null);
  const [highlights, setHighlights] = useState<HighlightCitation[]>([]);
  const [loadingBook, setLoadingBook] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user || !bookId) return;
      const bookSnap = await getDoc(doc(db, "users", user.uid, "books", bookId));
      if (!bookSnap.exists()) { setLoadingBook(false); return; }
      const bookData = { id: bookSnap.id, ...(bookSnap.data() as Omit<BookData, "id">) };
      setBook(bookData);
      const hSnap = await getDocs(
        query(collection(db, "users", user.uid, "books", bookId, "highlights"), orderBy("position"), limit(50))
      );
      setHighlights(
        hSnap.docs.map((d) => ({
          id: d.id,
          text: d.data().content as string,
          page: d.data().pageRef ? `p.${d.data().pageRef}` : "",
        }))
      );
      setLoadingBook(false);
    });
    return () => unsubAuth();
  }, [bookId]);

  // ── Chat state ────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Set opening message once book loads
  useEffect(() => {
    if (!book) return;
    setMessages([{
      id: "0",
      role: "assistant",
      content: `Hey! I've read through all **${book.highlightCount}** of your highlights from **${book.title}**.\n\nBefore we dive in — what's going on in your life right now that made you want to revisit this book?`,
      timestamp: new Date(),
      feedback: null,
    }]);
  }, [book]);

  const callChatAPI = async (userText: string) => {
    setIsTyping(true);
    setShowSuggested(false);
    const messageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: messageId, role: "assistant", content: "", citations: [], timestamp: new Date(), isStreaming: true },
    ]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          message: userText,
          context: savedSituations.join("\n"),
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok || !res.body) throw new Error("Chat API failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: accumulated } : m)));
      }
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isStreaming: false } : m)));
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.id === messageId ? { ...m, content: "Sorry, I couldn't respond right now. Please try again.", isStreaming: false } : m
      ));
    } finally {
      setIsTyping(false);
    }
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
    await callChatAPI(currentInput);
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

  const suggestedPrompts = book ? [
    `What are the 3 most important ideas from ${book.title}?`,
    `Quiz me on a key concept from this book`,
    `How can I apply this book to my daily life?`,
  ] : [];

  if (loadingBook) {
    return <div className="flex h-[calc(100dvh-73px)] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
  }
  if (!book) {
    return (
      <div className="flex h-[calc(100dvh-73px)] items-center justify-center flex-col gap-4">
        <BookOpen className="w-10 h-10 text-gray-300" />
        <p className="text-gray-500">Book not found.</p>
        <Link href="/dashboard" className="btn-primary text-sm px-6 py-2">Back to Library</Link>
      </div>
    );
  }

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
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">{book.author}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mt-6">
                  <span className="bg-black/5 text-gray-600 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md capitalize">
                    {book.category}
                  </span>
                  <span className="bg-black/5 text-gray-600 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-md">
                    {book.highlightCount} highlights
                  </span>
                </div>
              </div>

              {/* Highlights list */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
                  Highlights
                </p>
                <div className="space-y-4">
                  {highlights.map((h) => {
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
                    setMessages([{
                        id: "0",
                        role: "assistant",
                        content: `Hey! I've read through all **${book.highlightCount}** of your highlights from **${book.title}**.\n\nBefore we dive in — what's going on in your life right now that made you want to revisit this book?`,
                        timestamp: new Date(),
                        feedback: null,
                    }]);
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
              Highlights — {book.highlightCount}
            </span>
          </div>
        )}
      </motion.div>

      {/* ─── Column 2: Highlight Viewer ──────────── */}
      <HighlightViewer
        highlights={highlights}
        hoveredCitationId={hoveredCitationId}
        onHoverHighlight={setHoveredCitationId}
        book={book}
      />

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
                      {suggestedPrompts.map((p, i) => (
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
