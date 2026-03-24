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
import UnifiedExplainer from "@/components/learning/UnifiedExplainer";
import VoicePlayer from "@/components/ai/VoicePlayer";
import ThemeFlare from "@/components/learning/ThemeFlare";
import MentorDrawer from "@/components/ai/MentorDrawer";
import { MessageCircle } from "lucide-react";

export default function ExplainPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
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
  const [imageUrl, setImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [storyboardImages, setStoryboardImages] = useState<string[] | null>(null);
  const [loadingStoryboard, setLoadingStoryboard] = useState(false);
  const [sessionSeed] = useState(() => Math.floor(Math.random() * 999999));
  const [mentorOpen, setMentorOpen] = useState(false);

  // Use interests from user profile, fallback to defaults
  const availableInterests = userProfile?.interests?.length
    ? userProfile.interests.map(i => i.toLowerCase())
    : ["movies", "cricket", "anime", "gaming"];

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

  const handleGenerateImage = async () => {
    if (!explanation) return;
    setLoadingImage(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/scene-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          sceneDescription: Array.isArray((explanation as any).scene) 
            ? (explanation as any).scene.join(" ") 
            : (explanation as any).scene,
          concept: concept,
          interest: activeInterest,
          sceneSource: (explanation as any).scene_source
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error("Image generation failed", err);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerateStoryboard = async () => {
    console.log("--- START STORYBOARD GENERATION (EXPLAIN) ---");
    if (!user || !explanation || !(explanation as any).storyboard) {
      console.log("MISSING DATA:", { user: !!user, hasExpl: !!explanation, hasStory: !!(explanation as any)?.storyboard });
      return;
    }
    const storyboard = (explanation as any).storyboard as string[];
    console.log("Frames to generate:", storyboard.length);
    setLoadingStoryboard(true);
    try {
      const token = await getToken();
      // Generate images one-by-one to respect Pollinations IP rate limits (max 1 concurrent)
      const urls: string[] = [];
      for (let i = 0; i < storyboard.length; i++) {
        const frame = storyboard[i];
        try {
          const res = await fetch("/api/scene-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              sceneDescription: frame,
              concept: concept,
              interest: activeInterest,
              sceneSource: (explanation as any).scene_source
            }),
          });
          const data = await res.json();
          if (data.imageUrl) {
            // Sync seed for visual likeness across the analogy
            const syncedUrl = data.imageUrl.replace(/seed=\d+/, `seed=${sessionSeed}`);
            urls.push(syncedUrl);
            setStoryboardImages([...urls]);
          }
          // Buffer (2.5s) to avoid concurrent IP rate limits
          await new Promise(r => setTimeout(r, 2500));
        } catch (e) {
          console.error(`Frame ${i} failed:`, e);
        }
      }
    } catch (err) {
      console.error("Storyboard generation failed", err);
    } finally {
      setLoadingStoryboard(false);
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
      <main 
        style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }} 
        className="p-4 md:p-8 pt-24"
        data-theme={activeInterest.toLowerCase()}
      >
        <ThemeFlare interest={activeInterest.toLowerCase()} />
        <div className="nb-bg-grid fixed inset-0 z-0" style={{ backgroundColor: 'var(--theme-bg)' }} />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <button
            onClick={() => router.back()}
            className="nb-mono flex items-center gap-2 mb-8 px-3 py-1 transition-all"
            style={{ fontSize: '11px', color: '#888', border: 'var(--bd)', background: 'transparent', cursor: 'pointer' }}
            suppressHydrationWarning
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
                WHAT DO YOU WANT TO LEARN?
              </label>
              <input
                type="text"
                className="nb-input w-full"
                placeholder="e.g. Deadlocks, Recursion..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExplain()}
                autoFocus
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="nb-mono block mb-2" style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em' }}>
                SPECIFIC SCENE (OPTIONAL)
              </label>
              <input
                type="text"
                className="nb-input w-full"
                placeholder="e.g. In The Office, F1 Pitstop..."
                value={specificContext}
                onChange={(e) => setSpecificContext(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExplain()}
                suppressHydrationWarning
              />
            </div>
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
                  suppressHydrationWarning
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
    <main 
      style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }} 
      className="p-4 md:p-8 pt-24"
      data-theme={activeInterest.toLowerCase()}
    >
      <ThemeFlare interest={activeInterest.toLowerCase()} />
      <div className="nb-bg-grid fixed inset-0 z-0" style={{ backgroundColor: 'var(--theme-bg)' }} />

      <div className="max-w-7xl mx-auto space-y-8 pb-32 relative z-10">

        {/* Back Button */}
        <button
          onClick={() => {
            setExplanation(null);
            setHasGenerated(false);
            setError(null);
            setStoryboardImages(null);
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

          <div className="flex items-center gap-6">
            {explanation && (
              <div className="w-64">
                <VoicePlayer
                  text={`${explanation.hook}. ${Array.isArray(explanation.scene) ? explanation.scene.join(". ") : explanation.scene}. ${explanation.twist}. ${Array.isArray(explanation.deep_dive) ? explanation.deep_dive.join(". ") : explanation.deep_dive}`}
                  language={language}
                />
              </div>
            )}
            
            {/* Interest Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
            {availableInterests.map((int: string) => (
              <button
                key={int}
                onClick={() => handleInterestChange(int)}
                className="nb-mono px-3 py-1 transition-all capitalize"
                suppressHydrationWarning
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
                <div className="nb-cube-face nb-cube-left">U</div>
                <div className="nb-cube-face nb-cube-right">!</div>
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

        ) : explanation ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <UnifiedExplainer
                explanation={explanation as any}
                interest={activeInterest}
                mode={mode}
                onRegenerate={(specificity) => generate(activeInterest, specificity)}
                onGenerateImage={handleGenerateImage}
                onGenerateStoryboard={handleGenerateStoryboard}
                imageUrl={imageUrl}
                storyboardImages={storyboardImages || undefined}
                loadingImage={loadingImage}
                loadingStoryboard={loadingStoryboard}
              />
            </div>
            <div className="space-y-6">
              <NbCard variant="plasma" className="p-6 border-4">
                <label className="nb-mono block mb-3" style={{ fontSize: '10px', color: 'var(--ink)', fontWeight: 'bold' }}>
                  TRY ANOTHER SPECIFIC SCENE?
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="nb-input w-full text-xs"
                    style={{ background: 'white', color: 'black' }}
                    placeholder="e.g. Describe it like a bank heist..."
                    value={specificContext}
                    onChange={(e) => setSpecificContext(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generate(activeInterest, specificContext)}
                  />
                  <NbButton 
                    variant="dark" 
                    size="sm" 
                    onClick={() => generate(activeInterest, specificContext)}
                    className="w-full"
                  >
                    REGENERATE SCENE →
                  </NbButton>
                </div>
              </NbCard>

              {/* AI Mentor Button */}
              <NbButton
                variant="nova"
                className="w-full py-6 flex items-center justify-center gap-3 group"
                onClick={() => setMentorOpen(true)}
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="nb-mono text-[9px] opacity-60 leading-none mb-1 uppercase tracking-tighter">Live Guidance</div>
                  <div className="nb-display text-base leading-none">CHAT WITH MENTOR</div>
                </div>
              </NbButton>
            </div>
          </div>
        ) : null}

        {/* Global Mentor Drawer */}
        <MentorDrawer
          subtopicTitle={concept}
          activeInterest={activeInterest}
          isOpen={mentorOpen}
          onClose={() => setMentorOpen(false)}
        />
      </div>
    </main>
  );
}
