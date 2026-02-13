"use client";

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { ImagePlus, Loader2, Rocket, Sparkles } from "lucide-react";

type AnalysisResponse = {
  brand: string;
  caption: string;
  hashtags: string[];
  is_urgent: boolean;
  image_url: string;
  filename: string;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const hashtagsLine = useMemo(() => (analysis ? analysis.hashtags.join(" ") : ""), [analysis]);

  function resetFeedback() {
    setError("");
    setMessage("");
  }

  function applyFile(file: File) {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG and PNG files are supported.");
      return;
    }
    resetFeedback();
    setAnalysis(null);
    setCaption("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) applyFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) applyFile(file);
  }

  async function analyzePoster() {
    if (!selectedFile) {
      setError("Upload a poster first.");
      return;
    }

    resetFeedback();
    setIsAnalyzing(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Analysis failed.");

      const parsed = data as AnalysisResponse;
      const initialCaption = `${parsed.caption}\n\n${parsed.hashtags.join(" ")}`;
      setAnalysis(parsed);
      setCaption(initialCaption);
      if (parsed.is_urgent) {
        setMessage("Urgent event detected: recommended to post immediately.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function publishNow() {
    if (!analysis) {
      setError("Run analysis before publishing.");
      return;
    }
    if (!caption.trim()) {
      setError("Caption cannot be empty.");
      return;
    }

    resetFeedback();
    setIsPublishing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: analysis.image_url, caption, brand: analysis.brand }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Publish failed.");
      if (data.story_success) {
        setMessage(
          `Published post (${data.instagram_post_id}) and story (${data.instagram_story_id}) successfully.`
        );
      } else {
        setMessage(`Post published (${data.instagram_post_id}). Story status: ${data.detail}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error during publishing.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-r from-cyan-600 via-sky-700 to-indigo-900 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            Vishra Social OS
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            AI-Powered Instagram Automation for Event Posters
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-cyan-100 md:text-base">
            Upload once, generate high-converting captions with Groq, edit the draft, and publish directly using
            Meta Graph API.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
            isDragging ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 bg-slate-900/70"
          }`}
        >
          <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} className="hidden" />
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <ImagePlus className="h-10 w-10 text-cyan-300" />
            <p className="text-lg font-semibold">Drag & drop event poster here</p>
            <p className="text-sm text-slate-400">or click to choose JPG/PNG file</p>
          </div>
        </label>

        {previewUrl && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <img src={previewUrl} alt="Uploaded preview" className="mx-auto max-h-96 rounded-xl object-contain" />
          </div>
        )}

        <button
          type="button"
          onClick={analyzePoster}
          disabled={!selectedFile || isAnalyzing}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {isAnalyzing ? "Analyzing with Groq..." : "Generate Caption"}
        </button>

        {analysis && (
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Editor Card</h2>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300">
                {analysis.brand}
              </span>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-52 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none ring-cyan-400 transition focus:ring-2"
            />

            <p className="mt-3 text-xs text-slate-400">Detected hashtags: {hashtagsLine}</p>

            <button
              type="button"
              onClick={publishNow}
              disabled={isPublishing}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
              {isPublishing ? "Publishing Post + Story..." : "Post + Story Now"}
            </button>
          </article>
        )}

        {message && <p className="rounded-lg border border-emerald-700 bg-emerald-900/30 p-3 text-sm text-emerald-300">{message}</p>}
        {error && <p className="rounded-lg border border-rose-700 bg-rose-900/30 p-3 text-sm text-rose-300">{error}</p>}
      </section>
    </main>
  );
}
