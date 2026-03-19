"use client";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import NbCard from "@/components/ui/NbCard";
import NbButton from "@/components/ui/NbButton";
import {
  ArrowLeft, RefreshCw, Zap, ShieldAlert, CheckCircle2, Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ExplanationResponse } from "@/types/explanation";

export default function ExplainPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--ink)' }}>
        <div className="nb-mono" style={{ color: '#888' }}>Loading...</div>
      </div>
    }>
      <ExplainPage />
    </Suspense>
  );
}

function ExplainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, user, userProfile } = useAuth();

  const conceptFromUrl = searchParams.get("concept") || "";
  const mode = (searchParams.get("mode") || "casual") as "casual" | "exam";
  const language = searchParams.get("language") || "english";

  const [concept, setConcept] = useState(conceptFromUrl);
  const [initialInterest] = useState(
    () => searchParams.get("interest") || ""
  );
  const [activeInterest, setActiveInterest] = useState(initialInterest);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [specificContext, setSpecificContext] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  // Use interests from user profile, fallback to defaults
  const availableInterests = userProfile?.interests?.length
    ? userProfile.interests
    : ["Movies", "Cricket", "Anime", "Gaming"];

  // Set default interest from profile if not from URL
  useEffect(() => {
    if (!activeInterest && availableInterests.length > 0) {
      setActiveInterest(availableInterests[0]);
    }
  }, [availableInterests, activeInterest]);

  const generate = async (currentInterest: string, contextOverride?: string) => {
    if (!user || !concept.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const currentContext =
        contextOverride !== undefined ? contextOverride : specificContext;

      // Track history in background (non-blocking)
      fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: concept,
          interest: currentInterest,
          mode,
          language,
          specificContext: currentContext || undefined,
        }),
      }).catch((e) => console.error("History tracking failed", e));

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: concept,
          interest: currentInterest,
          mode,
          language,
          specificContext: currentContext || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.error("API error response:", errData);
        throw new Error("Failed to generate explanation.");
      }

      const data = await res.json();
      setExplanation(data.explanation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate if concept came from URL
  useEffect(() => {
    if (!hasGenerated && user !== undefined && conceptFromUrl && activeInterest) {
      setHasGenerated(true);
      generate(activeInterest);
    }
  }, [user, activeInterest]);

  const handleInterestChange = (int: string) => {
    setActiveInterest(int);
    setSpecificContext("");
    if (concept.trim() && explanation) {
      generate(int, "");
    }
  };

  const handleExplain = () => {
    if (!concept.trim() || !activeInterest) return;
    setHasGenerated(true);
    generate(activeInterest);
  };

  // --- INPUT SCREEN (no concept yet) ---
  if (!hasGenerated || (!explanation && !loading && !error)) {
    return (
      <main style={{ background: 'var(--ink)', minHeight: '100vh' }} className="p-4 md:p-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="nb-mono flex items-center gap-2 mb-8 px-3 py-1 transition-all"
            style={{ fontSize: '11px', color: '#888', border: 'var(--bd)', background: 'transparent', cursor: 'pointer' }}
          >
            <ArrowLeft className="w-4 h-4" /> BACK
          </button>

          <h1 className="nb-display mb-2" style={{ fontSize: '48px', color: 'var(--volt)' }}>
            QUICK EXPLAIN
          </h1>
          <p className="nb-mono mb-8" style={{ fontSize: '12px', color: '#888' }}>
            Type any concept. Pick your interest. Get a thriller-style explanation.
          </p>

          {/* Concept Input */}
          <div className="mb-6">
            <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
              WHAT DO YOU WANT TO LEARN?
            </label>
            <input
              type="text"
              className="nb-input w-full"
              placeholder="e.g. Deadlocks, Recursion, Supply & Demand, Photosynthesis..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExplain()}
              autoFocus
            />
          </div>

          {/* Interest Picker */}
          <div className="mb-6">
            <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
              EXPLAIN THROUGH
            </label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map((int: string) => (
                <button
                  key={int}
                  onClick={() => setActiveInterest(int)}
                  className="nb-mono px-4 py-2 transition-all capitalize"
                  style={{
                    fontSize: '12px',
                    border: 'var(--bd)',
                    background: activeInterest === int ? 'var(--volt)' : 'transparent',
                    color: activeInterest === int ? 'var(--ink)' : '#888',
                    boxShadow: activeInterest === int ? 'var(--sh-sm)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {int}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <NbButton
            variant="volt"
            size="lg"
            onClick={handleExplain}
            disabled={!concept.trim() || !activeInterest}
          >
            <Search className="w-5 h-5" /> EXPLAIN THIS →
          </NbButton>
        </div>
      </main>
    );
  }

  // --- RESULT SCREEN ---
  return (
    <main style={{ background: 'var(--ink)', minHeight: '100vh' }} className="p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8 pb-32">

        {/* Back Button */}
        <button
          onClick={() => {
            setExplanation(null);
            setHasGenerated(false);
            setError(null);
          }}
          className="nb-mono flex items-center gap-2 px-3 py-1 transition-all"
          style={{ fontSize: '11px', color: '#888', border: 'var(--bd)', background: 'transparent', cursor: 'pointer' }}
        >
          <ArrowLeft className="w-4 h-4" /> NEW CONCEPT
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderBottom: '2px solid #222', paddingBottom: '24px' }}>
          <div>
            <h1 className="nb-display" style={{ fontSize: '40px', color: 'var(--chalk)' }}>
              {concept}
            </h1>
            <p className="nb-mono mt-2" style={{ fontSize: '11px', color: '#888' }}>
              Explained through{" "}
              <span style={{ color: 'var(--volt)', fontWeight: 'bold' }}>{activeInterest}</span>
              {" "}in {language}
            </p>
          </div>

          {/* Interest Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {availableInterests.map((int: string) => (
              <button
                key={int}
                onClick={() => handleInterestChange(int)}
                className="nb-mono px-3 py-1 transition-all capitalize"
                style={{
                  fontSize: '11px',
                  border: 'var(--bd)',
                  background: activeInterest === int ? 'var(--volt)' : 'transparent',
                  color: activeInterest === int ? 'var(--ink)' : '#888',
                  cursor: 'pointer',
                }}
              >
                {int}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="nb-cube-scene mb-6">
              <div className="nb-cube">
                <div className="nb-cube-face nb-cube-front">E</div>
                <div className="nb-cube-face nb-cube-back">D</div>
                <div className="nb-cube-face nb-cube-top">U</div>
                <div className="nb-cube-face nb-cube-bottom">F</div>
              </div>
            </div>
            <p className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>
              Crafting your {activeInterest} explanation...
            </p>
          </div>

        /* Error State */
        ) : error ? (
          <div className="text-center py-12">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4" style={{ color: '#f87171' }} />
            <h2 className="nb-display mb-2" style={{ fontSize: '24px', color: '#f87171' }}>
              Generation Failed
            </h2>
            <p className="nb-mono mb-4" style={{ fontSize: '12px', color: '#888' }}>{error}</p>
            <NbButton variant="plasma" onClick={() => generate(activeInterest)}>
              TRY AGAIN
            </NbButton>
          </div>

        /* Explanation Content */
        ) : explanation ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <NbCard>
                <div className="space-y-8">
                  {/* Scene Source */}
                  <section>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--volt)', color: 'var(--ink)' }}>
                      SCENE SOURCE
                    </span>
                    <p className="nb-mono mt-3" style={{ fontSize: '13px', color: 'var(--chalk)', lineHeight: 1.7 }}>
                      {explanation.scene_source}
                    </p>
                  </section>

                  {/* Hook */}
                  <section>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--plasma)', color: '#fff' }}>
                      THE HOOK
                    </span>
                    <p className="mt-3" style={{ fontSize: '18px', color: 'var(--chalk)', fontWeight: 'bold', lineHeight: 1.5 }}>
                      {explanation.hook}
                    </p>
                  </section>

                  {/* Scene */}
                  <section>
                    <span className="nb-mono px-2 py-1 inline-flex items-center gap-1" style={{ fontSize: '10px', background: 'var(--volt)', color: 'var(--ink)' }}>
                      <Zap className="w-3 h-3" /> THE SCENE
                    </span>
                    <div className="mt-3 p-4" style={{ border: '2px solid #333', background: 'rgba(212,255,0,0.03)' }}>
                      <p className="nb-mono" style={{ fontSize: '13px', color: 'var(--chalk)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {explanation.scene}
                      </p>
                    </div>
                  </section>

                  {/* Twist */}
                  <section>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--solar)', color: 'var(--ink)' }}>
                      THE TWIST
                    </span>
                    <div className="mt-3 p-4" style={{ borderLeft: '4px solid var(--solar)' }}>
                      <p style={{ fontSize: '16px', color: 'var(--chalk)', fontStyle: 'italic', fontWeight: 'bold', lineHeight: 1.5 }}>
                        {explanation.twist}
                      </p>
                    </div>
                  </section>

                  {/* Deep Dive */}
                  <section>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--ion)', color: 'var(--ink)' }}>
                      DEEP DIVE
                    </span>
                    <div className="mt-3 space-y-4">
                      {explanation.deep_dive
                        .split("\n\n")
                        .filter(Boolean)
                        .map((para, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="p-4"
                            style={{ border: '1px solid #333', background: 'rgba(0,200,200,0.03)' }}
                          >
                            <p className="nb-mono" style={{ fontSize: '13px', color: 'var(--chalk)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                              {para}
                            </p>
                          </motion.div>
                        ))}
                    </div>
                  </section>

                  {/* Technical Definition */}
                  <section>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--ion)', color: 'var(--ink)' }}>
                      TECHNICAL DEFINITION
                    </span>
                    <div className="mt-3 p-4" style={{ border: '1px solid #333', background: 'rgba(0,200,100,0.03)' }}>
                      <p className="nb-mono" style={{ fontSize: '13px', color: 'var(--chalk)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {explanation.technical}
                      </p>
                    </div>
                  </section>

                  {/* Analogy Mapping */}
                  <section>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--plasma)', color: '#fff' }}>
                      ANALOGY MAPPING
                    </span>
                    <div className="mt-3 space-y-2">
                      {explanation.mapping?.map((item, id) => (
                        <div key={id} className="flex items-center gap-3" style={{ fontSize: '12px' }}>
                          <span className="nb-mono px-2 py-1" style={{ background: 'var(--volt)', color: 'var(--ink)', minWidth: '120px', textAlign: 'center' }}>
                            {item.concept}
                          </span>
                          <span style={{ color: '#666' }}>→</span>
                          <span className="nb-mono" style={{ color: 'var(--chalk)' }}>
                            {item.scene_element}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Key Points — Exam Mode Only */}
                  {mode === "exam" && explanation.key_points && explanation.key_points.length > 0 && (
                    <section>
                      <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--volt)', color: 'var(--ink)' }}>
                        🔑 KEY POINTS FOR EXAMS
                      </span>
                      <ul className="mt-3 space-y-2">
                        {explanation.key_points.map((pt, id) => (
                          <li key={id} className="nb-mono flex items-start gap-2 p-2" style={{ fontSize: '12px', color: 'var(--chalk)', border: '1px solid #333' }}>
                            <span style={{ color: 'var(--volt)' }}>▸</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Cliffhanger Summary */}
                  <section style={{ borderTop: '2px solid #333', paddingTop: '24px' }}>
                    <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--volt)', color: 'var(--ink)' }}>
                      CLIFFHANGER
                    </span>
                    <p className="mt-3 nb-display" style={{ fontSize: '20px', color: 'var(--volt)', fontStyle: 'italic' }}>
                      &ldquo;{explanation.summary}&rdquo;
                    </p>
                  </section>
                </div>
              </NbCard>

              {/* Storyboard */}
              {explanation.storyboard && explanation.storyboard.length > 0 && (
                <div>
                  <span className="nb-mono px-2 py-1 mb-4 inline-block" style={{ fontSize: '10px', background: '#333', color: 'var(--chalk)' }}>
                    VISUAL STORYBOARD
                  </span>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    {explanation.storyboard.map((frame, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.15 + 0.3 }}
                      >
                        <NbCard className="aspect-square flex flex-col items-center justify-center p-3 text-center">
                          <div className="nb-display mb-2" style={{ fontSize: '28px', color: 'var(--volt)' }}>{idx + 1}</div>
                          <p className="nb-mono" style={{ fontSize: '10px', color: '#888' }}>{frame}</p>
                        </NbCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">

              {/* Analogy Works */}
              <NbCard>
                <span className="nb-mono px-2 py-1 inline-flex items-center gap-1" style={{ fontSize: '10px', background: 'var(--ion)', color: 'var(--ink)' }}>
                  <CheckCircle2 className="w-3 h-3" /> WHERE IT WORKS
                </span>
                <p className="nb-mono mt-3" style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {explanation.analogy_works}
                </p>
              </NbCard>

              {/* Analogy Breaks */}
              <NbCard>
                <span className="nb-mono px-2 py-1 inline-flex items-center gap-1" style={{ fontSize: '10px', background: '#f87171', color: '#fff' }}>
                  <ShieldAlert className="w-3 h-3" /> WHERE IT BREAKS
                </span>
                <p className="nb-mono mt-3" style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {explanation.analogy_breaks}
                </p>
              </NbCard>

              {/* Regenerate with Specific Context */}
              <NbCard variant="volt">
                <span className="nb-mono px-2 py-1" style={{ fontSize: '10px', background: 'var(--nova)', color: '#fff' }}>
                  WANT A SPECIFIC SCENE?
                </span>
                <p className="nb-mono mt-3 mb-3" style={{ fontSize: '11px', color: '#888' }}>
                  Got a favourite{" "}
                  {activeInterest === "Movies"
                    ? "movie or genre"
                    : activeInterest === "Cricket"
                    ? "match or player"
                    : activeInterest === "Gaming"
                    ? "game"
                    : activeInterest === "Anime"
                    ? "show or arc"
                    : "moment"}{" "}
                  in mind?
                </p>
                <input
                  type="text"
                  className="nb-input w-full mb-3"
                  placeholder={
                    activeInterest === "Movies"
                      ? "e.g. Inception or Interstellar"
                      : activeInterest === "Cricket"
                      ? "e.g. 2011 World Cup or Dhoni"
                      : activeInterest === "Gaming"
                      ? "e.g. Minecraft or GTA V"
                      : activeInterest === "Anime"
                      ? "e.g. Naruto or Attack on Titan"
                      : "Type a specific context..."
                  }
                  value={specificContext}
                  onChange={(e) => setSpecificContext(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate(activeInterest)}
                />
                <NbButton
                  variant="plasma"
                  className="w-full"
                  onClick={() => generate(activeInterest)}
                >
                  <RefreshCw className="w-4 h-4" /> REGENERATE
                </NbButton>
              </NbCard>
            </div>
          </motion.div>
        ) : null}
      </div>
    </main>
  );
}
