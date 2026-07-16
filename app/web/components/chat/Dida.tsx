"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, Calculator, ShieldCheck, AlertTriangle, Download, Mail, Save } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { DIDA_FIELDS, looksLikeRiskCheckIntent, bmiCategory } from "@/lib/dida-fields";
import api, { exportSinglePdf, emailPrediction } from "@/lib/api";

interface Message {
  role: "user" | "dida";
  content: string;
  kind?: "text" | "result"; // "result" gets special styled rendering
  resultData?: PredictionResultData | null;
}

interface PredictionResultData {
  riskLevel: string;   // e.g. "High", "Moderate", "Low"
  probability: number; // 0–1
  summary: string;
  predictionId?: number; // only present when the prediction was saved (authenticated user)
}

const TOTAL_FIELDS = DIDA_FIELDS.length;

export function Dida() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showBubble, setShowBubble] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Collection-mode state (deterministic, no LLM involved) ──
  const [collecting, setCollecting] = useState(false);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showBmiCalc, setShowBmiCalc] = useState(false);
  const [bmiUnit, setBmiUnit] = useState<"imperial" | "metric">("imperial");
  const [bmiFt, setBmiFt] = useState("");
  const [bmiIn, setBmiIn] = useState("");
  const [bmiCm, setBmiCm] = useState("");
  const [bmiKg, setBmiKg] = useState("");

  const currentField = collecting ? DIDA_FIELDS[fieldIndex] : null;

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) loadIntro();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, collecting, showBmiCalc]);

  const loadIntro = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/chat/intro`);
      setMessages([{ role: "dida", content: res.data.message }]);
    } catch {
      setMessages([{
        role: "dida",
        content: "👋 Hi! I'm **Dida**, your diabetes risk assistant. How can I help you today?",
      }]);
    }
  };

  const pushDida = (content: string, extra?: Partial<Message>) =>
    setMessages((prev) => [...prev, { role: "dida", content, kind: "text", ...extra }]);

  const pushUser = (content: string) =>
    setMessages((prev) => [...prev, { role: "user", content }]);

  // ── Start the deterministic collection flow ──
  const startCollecting = () => {
    setCollecting(true);
    setFieldIndex(0);
    setAnswers({});
    pushDida(`Great, let's check your risk! I'll ask ${TOTAL_FIELDS} quick questions — tap a button or type a number where needed.`);
    setTimeout(() => pushDida(DIDA_FIELDS[0].question), 200);
  };

  // ── Record an answer and move to next field, or submit ──
  const answerField = (value: number, label: string) => {
    if (!currentField) return;
    pushUser(label);
    const updated = { ...answers, [currentField.key]: value };
    setAnswers(updated);
    setShowBmiCalc(false);

    const nextIndex = fieldIndex + 1;
    if (nextIndex < TOTAL_FIELDS) {
      setFieldIndex(nextIndex);
      setTimeout(() => pushDida(DIDA_FIELDS[nextIndex].question), 200);
    } else {
      setCollecting(false);
      submitPrediction(updated);
    }
  };

  // ── Actually call the prediction API once all 14 fields are in ──
  const submitPrediction = async (payload: Record<string, number>) => {
    setLoading(true);
    pushDida("Thanks — crunching the numbers now…");
    try {
      const data = await api.post("/predict", payload).then((r) => r.data);

      const riskLevel: string = data.risk_level ?? "Unknown";
      const probability: number = data.probability ?? 0;
      const predictionId: number | undefined = data.id ?? undefined;
      const summary: string =
        data.recommendation ??
        `Based on your answers, your estimated diabetes risk is ${riskLevel.toLowerCase()}.`;

      const followUp = isAuthenticated
        ? "Remember — this is a screening estimate, not a diagnosis. I'd recommend discussing these results with a healthcare professional. You can download or email the PDF above, or ask me to explain what's driving this result."
        : "Remember — this is a screening estimate, not a diagnosis. I'd recommend discussing these results with a healthcare professional. Sign in if you'd like to save, download, or email this result.";

      setMessages((prev) => [
        ...prev,
        {
          role: "dida",
          content: "",
          kind: "result",
          resultData: { riskLevel, probability, summary, predictionId },
        },
        { role: "dida", content: followUp },
      ]);
    } catch {
      pushDida("Sorry, I couldn't complete the prediction just now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // ── Normal free-form chat (only when NOT collecting) ──
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    pushUser(text);

    if (looksLikeRiskCheckIntent(text)) {
      startCollecting();
      return;
    }

    setLoading(true);
    try {
      const data = await api.post("/chat", { message: text, history }).then((r) => r.data);
      setHistory(data.history);
      pushDida(data.response);
    } catch {
      pushDida("Sorry, I'm having trouble connecting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (looksLikeRiskCheckIntent(action)) {
      pushUser(action);
      startCollecting();
      return;
    }
    setInput(action);
    setTimeout(() => sendMessage(), 50);
  };

  // ── Inline mini BMI calculator (same math as the step form) ──
  const computeBmi = (): number | null => {
    const kg = parseFloat(bmiKg);
    if (!kg) return null;
    let heightM: number;
    if (bmiUnit === "imperial") {
      const totalIn = (parseFloat(bmiFt) || 0) * 12 + (parseFloat(bmiIn) || 0);
      if (!totalIn) return null;
      heightM = totalIn * 0.0254;
    } else {
      const cm = parseFloat(bmiCm);
      if (!cm) return null;
      heightM = cm / 100;
    }
    if (heightM <= 0) return null;
    return Math.round((kg / (heightM * heightM)) * 10) / 10;
  };
  const liveBmi = computeBmi();
  const liveCategory = liveBmi ? bmiCategory(liveBmi) : null;

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
              onClick={() => { setOpen(true); setShowBubble(false); }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-full bg-primary-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-primary-600">Dida</span>
                <span className="ml-auto text-xs text-muted-foreground">Just now</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                👋 Hi! I can check your diabetes risk in seconds. Want to try?
              </p>
            </div>
            <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-slate-800" />
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
            style={{ height: "560px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-primary-500 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Dida</p>
                <p className="text-xs text-primary-100">
                  {collecting ? `Question ${fieldIndex + 1} of ${TOTAL_FIELDS}` : "Diabetes Risk Assistant"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-primary-100">Online</span>
                <button onClick={() => setOpen(false)} className="ml-3 text-white/70 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress bar during collection */}
            {collecting && (
              <div className="h-1 bg-muted">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${(fieldIndex / TOTAL_FIELDS) * 100}%` }}
                />
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => {
                if (msg.kind === "result" && msg.resultData) {
                  return <ResultCard key={i} data={msg.resultData} isAuthenticated={isAuthenticated} />;
                }
                return (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center mr-2 shrink-0">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-2 w-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Deterministic quick-reply UI for the current field ── */}
              {collecting && !loading && currentField?.type === "choice" && (
                <div className="flex flex-wrap gap-1.5 pl-9">
                  {currentField.options!.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => answerField(opt.value, opt.label)}
                      className="rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {collecting && !loading && currentField?.type === "numeric" && (
                <div className="pl-9 space-y-2">
                  <NumericQuickInput
                    field={currentField}
                    onSubmit={(val) => answerField(val, String(val))}
                  />
                  {currentField.showBmiCalculator && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowBmiCalc((v) => !v)}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        {showBmiCalc ? "Hide calculator" : "Don't know your BMI? Calculate it"}
                      </button>
                      {showBmiCalc && (
                        <div className="mt-2 rounded-lg border bg-muted/40 p-3">
                          <div className="flex rounded-md border bg-background p-0.5 text-xs w-fit mb-2">
                            <button type="button" onClick={() => setBmiUnit("imperial")}
                              className={`rounded px-2 py-1 ${bmiUnit === "imperial" ? "bg-primary-500 text-white" : "text-muted-foreground"}`}>
                              ft / kg
                            </button>
                            <button type="button" onClick={() => setBmiUnit("metric")}
                              className={`rounded px-2 py-1 ${bmiUnit === "metric" ? "bg-primary-500 text-white" : "text-muted-foreground"}`}>
                              cm / kg
                            </button>
                          </div>
                          {bmiUnit === "imperial" ? (
                            <div className="grid grid-cols-3 gap-2">
                              <input type="number" placeholder="ft" value={bmiFt} onChange={(e) => setBmiFt(e.target.value)}
                                className="rounded-md border bg-background px-2 py-1.5 text-sm" />
                              <input type="number" placeholder="in" value={bmiIn} onChange={(e) => setBmiIn(e.target.value)}
                                className="rounded-md border bg-background px-2 py-1.5 text-sm" />
                              <input type="number" placeholder="kg" value={bmiKg} onChange={(e) => setBmiKg(e.target.value)}
                                className="rounded-md border bg-background px-2 py-1.5 text-sm" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <input type="number" placeholder="cm" value={bmiCm} onChange={(e) => setBmiCm(e.target.value)}
                                className="rounded-md border bg-background px-2 py-1.5 text-sm" />
                              <input type="number" placeholder="kg" value={bmiKg} onChange={(e) => setBmiKg(e.target.value)}
                                className="rounded-md border bg-background px-2 py-1.5 text-sm" />
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm">
                              {liveBmi ? (
                                <>BMI: <span className="font-semibold">{liveBmi}</span> <span className={liveCategory?.className}>({liveCategory?.label})</span></>
                              ) : (
                                <span className="text-xs text-muted-foreground">Enter height and weight</span>
                              )}
                            </span>
                            <button
                              type="button"
                              disabled={!liveBmi}
                              onClick={() => liveBmi && answerField(liveBmi, `${liveBmi} (calculated)`)}
                              className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:bg-primary-600"
                            >
                              Use this value
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick actions (initial greeting only) */}
            {messages.length <= 1 && !collecting && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {["Check my risk", "What is diabetes?", "How does this work?", "Prevention tips"].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="rounded-full border px-2.5 py-1 text-xs font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input — hidden while collecting (buttons/number field above handle it) */}
            {!collecting ? (
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
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <div className="border-t p-2 text-center text-xs text-muted-foreground">
                Answer above to continue
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button
        onClick={() => { setOpen(!open); setShowBubble(false); }}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary-500 shadow-lg shadow-primary-200 flex items-center justify-center hover:bg-primary-600 transition-all hover:scale-105"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && showBubble && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white text-white text-xs flex items-center justify-center">1</span>
        )}
      </button>
    </>
  );
}

// ── Small numeric input used inline in the chat during collection ──
function NumericQuickInput({ field, onSubmit }: { field: { min?: number; max?: number; step?: number; placeholder?: string }; onSubmit: (val: number) => void }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const num = parseFloat(val);
    if (!isNaN(num)) onSubmit(num);
  };
  return (
    <div className="flex gap-2">
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        min={field.min}
        max={field.max}
        step={field.step || 1}
        placeholder={field.placeholder}
        className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
      <button
        onClick={submit}
        disabled={!val.trim()}
        className="rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white disabled:opacity-40 hover:bg-primary-600"
      >
        Next
      </button>
    </div>
  );
}

// ── Styled, prominent result card ──
function ResultCard({
  data,
  isAuthenticated,
}: {
  data: PredictionResultData;
  isAuthenticated: boolean;
}) {
  const [showEmailBox, setShowEmailBox] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailing, setEmailing] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const level = data.riskLevel.toLowerCase();
  const isHigh = level.includes("high");
  const isModerate = level.includes("moderate") || level.includes("medium");
  const palette = isHigh
    ? { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-300 dark:border-red-800", text: "text-red-600 dark:text-red-400", icon: AlertTriangle }
    : isModerate
    ? { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-800", text: "text-amber-600 dark:text-amber-400", icon: AlertTriangle }
    : { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-800", text: "text-emerald-600 dark:text-emerald-400", icon: ShieldCheck };
  const Icon = palette.icon;

  const handleEmailSend = async () => {
    if (!emailInput.trim() || !data.predictionId) return;
    setEmailing(true);
    setEmailError(null);
    try {
      await emailPrediction(data.predictionId, emailInput.trim());
      setSent(true);
    } catch (e: any) {
      setEmailError(e.message || "Could not send email.");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className={`rounded-2xl border-2 ${palette.border} ${palette.bg} p-4 ml-9`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-5 w-5 ${palette.text}`} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${palette.text}`}>Prediction Result</span>
      </div>
      <p className={`text-2xl font-extrabold ${palette.text}`}>{data.riskLevel} Risk</p>
      {data.probability > 0 && (
        <p className="text-sm text-muted-foreground mt-0.5">
          Estimated probability: <span className="font-semibold text-foreground">{Math.round(data.probability * 100)}%</span>
        </p>
      )}
      <p className="text-sm mt-2 leading-relaxed">{data.summary}</p>

      {/* Download/email only available to logged-in users, matching the dashboard */}
      {isAuthenticated && data.predictionId && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <a
              href={exportSinglePdf(data.predictionId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </a>
            {!sent && (
              <button
                onClick={() => setShowEmailBox((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Email me a copy
              </button>
            )}
          </div>

          {showEmailBox && !sent && (
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSend()}
                placeholder="you@example.com"
                className="flex-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs"
              />
              <button
                onClick={handleEmailSend}
                disabled={emailing || !emailInput.trim()}
                className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 hover:bg-primary-600"
              >
                {emailing ? "Sending…" : "Send"}
              </button>
            </div>
          )}
          {sent && <p className="text-xs text-emerald-600">✓ Sent to {emailInput}</p>}
          {emailError && <p className="text-xs text-red-500">{emailError}</p>}
        </div>
      )}

      {/* Anonymous users: prompt to sign in instead of showing broken download/email buttons */}
      {!isAuthenticated && (
        <a
          href="/login"
          className="mt-3 flex items-center gap-1.5 w-fit rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          Sign in to save & download
        </a>
      )}
    </div>
  );
}
