"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "dida";
  content: string;
}

export function Dida() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showBubble, setShowBubble] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      loadIntro();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadIntro = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/intro`
      );
      setMessages([{ role: "dida", content: res.data.message }]);
    } catch {
      setMessages([
        {
          role: "dida",
          content:
            "👋 Hi! I'm **Dida**, your diabetes risk assistant. How can I help you today?",
        },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        { message: userMessage, history }
      );
      setHistory(res.data.history);
      setMessages((prev) => [
        ...prev,
        { role: "dida", content: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "dida",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Intro bubble */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 max-w-xs"
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl rounded-br-sm shadow-xl border p-4 cursor-pointer"
              onClick={() => {
                setOpen(true);
                setShowBubble(false);
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-full bg-primary-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-primary-600">
                  Dida
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  Just now
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                👋 Hi! I can check your diabetes risk in seconds. Want to try?
              </p>
            </div>
            <div
              className="absolute -bottom-2 right-4 w-0 h-0
              border-l-8 border-l-transparent
              border-r-8 border-r-transparent
              border-t-8 border-t-white dark:border-t-slate-800"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-primary-500 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Dida</p>
                <p className="text-xs text-primary-100">
                  Diabetes Risk Assistant
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-primary-100">Online</span>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-3 text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "dida" && (
                    <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary-500 text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "dida" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 shrink-0">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-primary-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {[
                  "Check my risk",
                  "What is diabetes?",
                  "How does this work?",
                  "Prevention tips",
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(action);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="rounded-full border px-2.5 py-1 text-xs font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask Dida anything..."
                className="flex-1 rounded-xl border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="rounded-xl bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:opacity-40 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button
        onClick={() => {
          setOpen(!open);
          setShowBubble(false);
        }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary-500 shadow-lg shadow-primary-200 flex items-center justify-center hover:bg-primary-600 transition-all hover:scale-105"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {!open && showBubble && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-white text-xs flex items-center justify-center">
            1
          </span>
        )}
      </button>
    </>
  );
}