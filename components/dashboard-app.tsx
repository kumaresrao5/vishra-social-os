"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Film,
  History,
  ImagePlus,
  LayoutGrid,
  Loader2,
  LogOut,
  PanelLeft,
  Rocket,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

type AnalysisResponse = {
  brand: string;
  caption: string;
  hashtags: string[];
  is_urgent: boolean;
  image_url: string;
  filename: string;
};

type PublishTarget = "post" | "story" | "both";
type Section = "dashboard" | "create" | "queue" | "history" | "assets" | "admin" | "settings";

type AppUser = {
  username: string;
  role: "agency_manager" | "bar_manager";
  brands: string[];
};

type ManagedUser = {
  username: string;
  role: "agency_manager" | "bar_manager";
  brands: string[];
};

type PublishRecord = {
  id: string;
  brand: string;
  caption: string;
  image_url: string;
  image_urls?: string[];
  target: PublishTarget;
  status: "queued" | "published" | "failed";
  created_by: string;
  created_at: string;
  scheduled_for?: string;
  published_at?: string;
  post_id?: string;
  story_id?: string;
  error?: string;
};

type Toast = {
  id: string;
  tone: "success" | "error" | "info";
  text: string;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const BRAND_OPTIONS = ["Dravidian", "Fire & Ice", "Barley & Hops", "Scorebar", "Southern Spice"];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function humanDate(value?: string): string {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString();
}

function FlextLogo() {
  return (
    <div className="leading-none">
      <p className="text-xl font-black tracking-tight text-slate-950">FLEXT</p>
      <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-700/80">Social OS</p>
    </div>
  );
}

function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-black/10 bg-white/75 shadow-sm backdrop-blur", className)}>
      {children}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <SoftCard className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-600">{hint}</p> : null}
    </SoftCard>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const safe = points.length > 0 ? points : [0];
  const max = Math.max(...safe, 1);
  const w = 220;
  const h = 44;
  const pad = 4;
  const step = safe.length === 1 ? w : w / (safe.length - 1);
  const d = safe
    .map((v, i) => {
      const x = i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-sky-600">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M 0 ${h - pad} L ${w} ${h - pad}`} fill="none" stroke="rgba(2,6,23,0.08)" strokeWidth="1" />
    </svg>
  );
}

function StatusBadge({ status }: { status: PublishRecord["status"] }) {
  const map = {
    queued: "bg-amber-50 text-amber-800 border-amber-300/60",
    published: "bg-emerald-50 text-emerald-800 border-emerald-300/60",
    failed: "bg-rose-50 text-rose-800 border-rose-300/60",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold uppercase", map[status])}>{status}</span>
  );
}

function PublishTargetSwitch({ value, onChange }: { value: PublishTarget; onChange: (next: PublishTarget) => void }) {
  const options: PublishTarget[] = ["post", "story", "both"];
  return (
    <div className="inline-flex rounded-lg border border-black/10 bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition",
            value === option ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  step,
}: {
  step: 1 | 2 | 3 | 4;
}) {
  const steps: Array<{ id: 1 | 2 | 3 | 4; label: string }> = [
    { id: 1, label: "Upload" },
    { id: 2, label: "Generate" },
    { id: 3, label: "Review" },
    { id: 4, label: "Result" },
  ];
  return (
    <SoftCard className="p-4">
      <div className="flex items-center justify-between gap-3">
        {steps.map((s, idx) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-2xl border text-sm font-black",
                  done && "border-emerald-300/70 bg-emerald-50 text-emerald-800",
                  active && "border-slate-950 bg-slate-950 text-white",
                  !done && !active && "border-black/10 bg-white text-slate-700"
                )}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : s.id}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {s.id}</p>
                <p className="truncate text-sm font-semibold text-slate-900">{s.label}</p>
              </div>
              {idx < steps.length - 1 ? (
                <div className={cn("mx-2 hidden h-px flex-1 sm:block", done ? "bg-emerald-300/60" : "bg-black/10")} />
              ) : null}
            </div>
          );
        })}
      </div>
    </SoftCard>
  );
}

export default function DashboardApp({ initialSection = "create" }: { initialSection?: Section }) {
  const [section, setSection] = useState<Section>(initialSection);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localPreviewUrls, setLocalPreviewUrls] = useState<string[]>([]);
  const [draftResults, setDraftResults] = useState<AnalysisResponse[]>([]);
  const [activeDraftIndex, setActiveDraftIndex] = useState<number>(0);
  const [carouselEnabled, setCarouselEnabled] = useState<boolean>(false);
  const [carouselSelection, setCarouselSelection] = useState<Record<string, boolean>>({});

  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [chosenBrand, setChosenBrand] = useState<string>("");
  const [draftCaptions, setDraftCaptions] = useState<Record<string, string>>({});
  const [draftBrands, setDraftBrands] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTarget, setPublishTarget] = useState<PublishTarget>("post");
  const [scheduledFor, setScheduledFor] = useState<string>("");

  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [queueRecords, setQueueRecords] = useState<PublishRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<PublishRecord[]>([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"agency_manager" | "bar_manager">("bar_manager");
  const [newBrands, setNewBrands] = useState("");
  const [userFilterRole, setUserFilterRole] = useState<"all" | "agency_manager" | "bar_manager">("all");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [inlineError, setInlineError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PublishRecord | null>(null);
  const [lastResult, setLastResult] = useState<{ postId?: string; storyId?: string; target?: PublishTarget } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const hashtagsLine = useMemo(() => (analysis ? analysis.hashtags.join(" ") : ""), [analysis]);
  const uploadStepDone = selectedFiles.length > 0;
  const draftStepDone = Boolean(analysis);
  const allowedBrands = useMemo(() => {
    if (!user) return [] as string[];
    if (user.role === "agency_manager" || user.brands.includes("*")) return BRAND_OPTIONS;
    return BRAND_OPTIONS.filter((brand) => user.brands.some((allowed) => brand.toLowerCase().includes(allowed)));
  }, [user]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`);
        if (!response.ok) return;
        const data = await response.json();
        setUser(data.user ?? null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    void bootstrap();
  }, []);

  useEffect(() => {
    if (draftResults.length === 0) {
      setAnalysis(null);
      setCaption("");
      setChosenBrand("");
      return;
    }

    const active = draftResults[Math.min(activeDraftIndex, draftResults.length - 1)];
    if (!active) return;
    const key = active.image_url;
    setAnalysis(active);
    setCaption(draftCaptions[key] ?? `${active.caption}\n\n${active.hashtags.join(" ")}`);

    const fallback = active.brand || allowedBrands[0] || "";
    setChosenBrand(draftBrands[key] ?? fallback);
  }, [draftResults, activeDraftIndex, draftCaptions, draftBrands, allowedBrands]);

  useEffect(() => {
    if (!user) return;
    if (section === "queue" || section === "history" || section === "assets") {
      void loadRecords();
    }
    if (section === "admin" && user.role === "agency_manager") {
      void loadUsers();
    }
  }, [section, user]);

  function showToast(text: string, tone: Toast["tone"]) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }

  function clearFeedback() {
    setInlineError("");
  }

  async function loadRecords() {
    setIsRecordsLoading(true);
    clearFeedback();
    try {
      const [queueResp, historyResp] = await Promise.all([
        fetch(`${API_BASE_URL}/api/records?mode=queue`),
        fetch(`${API_BASE_URL}/api/records?mode=history`),
      ]);
      const queueData = await queueResp.json();
      const historyData = await historyResp.json();
      if (!queueResp.ok) throw new Error(queueData.detail ?? "Failed loading queue.");
      if (!historyResp.ok) throw new Error(historyData.detail ?? "Failed loading history.");
      setQueueRecords(queueData.records ?? []);
      setHistoryRecords(historyData.records ?? []);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed loading records.");
    } finally {
      setIsRecordsLoading(false);
    }
  }

  async function loadUsers() {
    setIsUsersLoading(true);
    clearFeedback();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Failed loading users.");
      setManagedUsers(data.users ?? []);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed loading users.");
    } finally {
      setIsUsersLoading(false);
    }
  }

  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setIsLoginLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Login failed.");
      setUser(data.user ?? null);
      setLoginPassword("");
      showToast("Signed in successfully.", "success");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Unexpected login error.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  async function logout() {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
    setUser(null);
    setAnalysis(null);
    setSelectedFiles([]);
    setLocalPreviewUrls([]);
    setDraftResults([]);
    setActiveDraftIndex(0);
    setCarouselEnabled(false);
    setCarouselSelection({});
    setDraftCaptions({});
    setDraftBrands({});
    setCaption("");
    setLastResult(null);
    setQueueRecords([]);
    setHistoryRecords([]);
    setManagedUsers([]);
    setSection("dashboard");
  }

  function applyFiles(files: File[]) {
    const allowed = ["image/jpeg", "image/png"];
    const normalized = files.filter(Boolean);
    if (normalized.length === 0) return;
    if (normalized.some((f) => !allowed.includes(f.type))) {
      setInlineError("Only JPG and PNG files are supported.");
      return;
    }
    clearFeedback();
    setAnalysis(null);
    setDraftResults([]);
    setActiveDraftIndex(0);
    setCarouselEnabled(false);
    setCarouselSelection({});
    setDraftCaptions({});
    setDraftBrands({});
    setCaption("");
    setChosenBrand("");
    setSelectedFiles(normalized);
    setLocalPreviewUrls(normalized.map((f) => URL.createObjectURL(f)));
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const list = event.target.files ? Array.from(event.target.files) : [];
    if (list.length > 0) applyFiles(list);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const list = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (list.length > 0) applyFiles(list);
  }

  async function analyzePoster() {
    if (selectedFiles.length === 0) {
      setInlineError("Upload a poster first.");
      return;
    }

    clearFeedback();
    setIsAnalyzing(true);
    try {
      const form = new FormData();
      if (selectedFiles.length === 1) {
        form.append("file", selectedFiles[0]);
      } else {
        for (const f of selectedFiles) form.append("files", f);
      }

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Analysis failed.");

      const results: AnalysisResponse[] =
        Array.isArray(data?.results) ? (data.results as AnalysisResponse[]) : [(data as AnalysisResponse)];

      setDraftResults(results);
      setActiveDraftIndex(0);

      const captions: Record<string, string> = {};
      const brands: Record<string, string> = {};
      const selection: Record<string, boolean> = {};
      for (const r of results) {
        const key = String(r.image_url);
        captions[key] = `${r.caption}\n\n${r.hashtags.join(" ")}`;
        brands[key] = r.brand || allowedBrands[0] || "";
        selection[key] = true;
      }
      setDraftCaptions(captions);
      setDraftBrands(brands);
      setCarouselSelection(selection);
      showToast(results.some((r) => r.is_urgent) ? "Urgent event detected." : "Captions generated.", "success");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Unexpected analysis error.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function publishNow() {
    if (!analysis) return setInlineError("Generate a draft first.");
    if (!caption.trim()) return setInlineError("Caption cannot be empty.");
    if (!chosenBrand.trim()) return setInlineError("Brand must be selected.");

    setIsPublishing(true);
    clearFeedback();
    try {
      const selectedCarouselUrls =
        carouselEnabled && draftResults.length > 1
          ? draftResults
              .filter((r) => carouselSelection[String(r.image_url)])
              .map((r) => String(r.image_url))
              .filter(Boolean)
          : [];
      if (carouselEnabled && draftResults.length > 1 && selectedCarouselUrls.length < 2) {
        throw new Error("Select at least 2 images for a carousel.");
      }

      const response = await fetch(`${API_BASE_URL}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: analysis.image_url,
          image_urls: selectedCarouselUrls.length > 0 ? selectedCarouselUrls : undefined,
          caption,
          brand: chosenBrand,
          target: publishTarget,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Publish failed.");
      setLastResult({
        postId: data.instagram_post_id,
        storyId: data.instagram_story_id,
        target: publishTarget,
      });
      showToast("Published successfully.", "success");
      await loadRecords();
      setSection("create");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Unexpected publish error.");
    } finally {
      setIsPublishing(false);
    }
  }

  async function addToQueue() {
    if (!analysis) return setInlineError("Generate a draft first.");
    if (!caption.trim()) return setInlineError("Caption cannot be empty.");
    if (!chosenBrand.trim()) return setInlineError("Brand must be selected.");

    clearFeedback();
    try {
      const selectedCarouselUrls =
        carouselEnabled && draftResults.length > 1
          ? draftResults
              .filter((r) => carouselSelection[String(r.image_url)])
              .map((r) => String(r.image_url))
              .filter(Boolean)
          : [];
      if (carouselEnabled && draftResults.length > 1 && selectedCarouselUrls.length < 2) {
        throw new Error("Select at least 2 images for a carousel.");
      }

      const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: analysis.image_url,
          image_urls: selectedCarouselUrls.length > 0 ? selectedCarouselUrls : undefined,
          caption,
          brand: chosenBrand,
          target: publishTarget,
          scheduled_for: scheduledFor || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Failed to queue.");
      showToast("Added to queue.", "success");
      await loadRecords();
      setSection("queue");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to queue item.");
    }
  }

  async function publishQueuedRecord(recordId: string) {
    clearFeedback();
    try {
      const response = await fetch(`${API_BASE_URL}/api/records/${encodeURIComponent(recordId)}/publish`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Failed to publish queued record.");
      showToast("Queued item published.", "success");
      await loadRecords();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to publish queued item.");
    }
  }

  async function retryHistory(record: PublishRecord) {
    clearFeedback();
    try {
      const response = await fetch(`${API_BASE_URL}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: record.image_url,
          image_urls: record.image_urls,
          caption: record.caption,
          brand: record.brand,
          target: record.target,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Retry failed.");
      showToast("Retry publish succeeded.", "success");
      await loadRecords();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Retry failed.");
    }
  }

  async function createUser() {
    if (!newUsername.trim() || !newPassword.trim()) {
      setInlineError("Username and password are required.");
      return;
    }
    const brands =
      newRole === "agency_manager"
        ? ["*"]
        : newBrands
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean);
    if (newRole === "bar_manager" && brands.length === 0) {
      setInlineError("Bar manager must have at least one brand.");
      return;
    }

    clearFeedback();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          role: newRole,
          brands,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Failed to create user.");
      setManagedUsers(data.users ?? []);
      setNewUsername("");
      setNewPassword("");
      setNewBrands("");
      showToast("User saved.", "success");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to create user.");
    }
  }

  async function deleteManagedUser(username: string) {
    clearFeedback();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(username)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Failed to delete user.");
      setManagedUsers(data.users ?? []);
      showToast(`Deleted user ${username}.`, "info");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to delete user.");
    }
  }

  const filteredUsers = useMemo(() => {
    return managedUsers.filter((managedUser) => {
      if (userFilterRole === "all") return true;
      return managedUser.role === userFilterRole;
    });
  }, [managedUsers, userFilterRole]);

  const recentAssets = useMemo(() => {
    const pool = [...queueRecords, ...historyRecords];
    const unique = new Map<string, PublishRecord>();
    for (const record of pool) {
      if (!unique.has(record.image_url)) unique.set(record.image_url, record);
    }
    return Array.from(unique.values()).slice(0, 12);
  }, [queueRecords, historyRecords]);

  const activePreviewUrl = useMemo(() => {
    if (draftResults.length > 0) {
      return draftResults[Math.min(activeDraftIndex, draftResults.length - 1)]?.image_url ?? "";
    }
    if (localPreviewUrls.length > 0) {
      return localPreviewUrls[Math.min(activeDraftIndex, localPreviewUrls.length - 1)] ?? "";
    }
    return "";
  }, [draftResults, localPreviewUrls, activeDraftIndex]);

  const flowStep: 1 | 2 | 3 | 4 = useMemo(() => {
    if (lastResult) return 4;
    if (analysis) return 3;
    if (selectedFiles.length > 0) return 2;
    return 1;
  }, [lastResult, analysis, selectedFiles.length]);

  const filteredQueue = useMemo(() => {
    if (!search.trim()) return queueRecords;
    const q = search.toLowerCase();
    return queueRecords.filter((r) => r.brand.toLowerCase().includes(q) || r.created_by.toLowerCase().includes(q));
  }, [queueRecords, search]);

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return historyRecords;
    const q = search.toLowerCase();
    return historyRecords.filter((r) => r.brand.toLowerCase().includes(q) || r.created_by.toLowerCase().includes(q));
  }, [historyRecords, search]);

  const stats = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const last24h = filteredHistory.filter((r) => {
      const t = new Date(r.published_at || r.created_at).getTime();
      return Number.isFinite(t) && now - t < dayMs;
    });
    const last7d = filteredHistory.filter((r) => {
      const t = new Date(r.published_at || r.created_at).getTime();
      return Number.isFinite(t) && now - t < dayMs * 7;
    });
    const success7d = last7d.filter((r) => r.status === "published").length;
    const total7d = last7d.length || 1;
    const outlets30 = new Set(
      filteredHistory
        .filter((r) => {
          const t = new Date(r.created_at).getTime();
          return Number.isFinite(t) && now - t < dayMs * 30;
        })
        .map((r) => r.brand)
    ).size;

    // 14-day daily publish counts for the chart.
    const buckets = new Array<number>(14).fill(0);
    for (const r of filteredHistory) {
      if (r.status !== "published") continue;
      const t = new Date(r.published_at || r.created_at).getTime();
      if (!Number.isFinite(t)) continue;
      const diffDays = Math.floor((now - t) / dayMs);
      if (diffDays >= 0 && diffDays < 14) buckets[13 - diffDays] += 1;
    }

    return {
      queued: filteredQueue.length,
      published24h: last24h.filter((r) => r.status === "published").length,
      successRate7d: Math.round((success7d / total7d) * 100),
      outlets30,
      chart: buckets,
    };
  }, [filteredQueue, filteredHistory]);

  const sideNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "create", label: "Create Post", icon: LayoutGrid },
    { id: "queue", label: "Queue", icon: Clock3 },
    { id: "history", label: "History", icon: History },
    { id: "assets", label: "Assets", icon: Film },
    ...(user?.role === "agency_manager" ? [{ id: "admin", label: "Users", icon: Users }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ] as Array<{ id: Section; label: string; icon: typeof LayoutGrid }>;

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-900">
        <p className="inline-flex items-center gap-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading application...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-slate-900">
        <form onSubmit={onLoginSubmit} className="w-full max-w-md rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur">
          <FlextLogo />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-700">Internal access</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight">Team Login</h1>
          <p className="mb-5 mt-1 text-sm text-slate-600">Use your username credentials to manage outlet publishing.</p>

          <label className="mb-1 block text-sm font-semibold text-slate-700">Username</label>
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            className="mb-4 w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none ring-sky-300 transition focus:ring-2"
            required
          />
          <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="mb-5 w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none ring-sky-300 transition focus:ring-2"
            required
          />
          <button
            type="submit"
            disabled={isLoginLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60"
          >
            {isLoginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoginLoading ? "Signing in..." : "Sign in"}
          </button>
          {inlineError ? <p className="mt-4 text-sm text-rose-700">{inlineError}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="flex min-h-screen">
        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/20"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
            />
            <div className="absolute left-0 top-0 h-full w-80 border-r border-black/10 bg-white/90 p-5 shadow-2xl backdrop-blur">
              <FlextLogo />
              <p className="mt-3 text-xs text-slate-600">AI publishing command center</p>
              <nav className="mt-8 space-y-1">
                {sideNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition",
                        active ? "bg-sky-500/10 text-sky-900" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <SoftCard className="mt-6 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick action</p>
                <button
                  type="button"
                  onClick={() => {
                    setSection("create");
                    setSidebarOpen(false);
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900"
                >
                  <ImagePlus className="h-4 w-4" /> New post
                </button>
              </SoftCard>
              <button
                type="button"
                onClick={logout}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        ) : null}

        <aside className="hidden w-72 shrink-0 border-r border-black/10 bg-white/70 p-5 lg:flex lg:flex-col backdrop-blur">
          <FlextLogo />
          <p className="mt-3 text-xs text-slate-600">AI publishing command center</p>

          <nav className="mt-8 space-y-1">
            {sideNavItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition",
                    active ? "bg-sky-500/10 text-sky-900" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <SoftCard className="mt-6 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick action</p>
            <button
              type="button"
              onClick={() => setSection("create")}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900"
            >
              <ImagePlus className="h-4 w-4" /> New post
            </button>
          </SoftCard>

          <button
            type="button"
            onClick={logout}
            className="mt-auto inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        <main className="flex-1 pb-20 lg:pb-6">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-white/75 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-black tracking-tight">Flext Social OS</h1>
                <p className="text-xs text-slate-600">{user.username} • {user.role.replace("_", " ")}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm md:flex">
                  <Search className="h-4 w-4 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search records..."
                    className="w-52 bg-transparent outline-none placeholder:text-slate-400"
                  />
                </div>

                <select
                  value={chosenBrand || allowedBrands[0] || ""}
                  onChange={(e) => setChosenBrand(e.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
                >
                  {allowedBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSection("create")}
                  className="hidden items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 md:inline-flex"
                >
                  New <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm lg:hidden"
                  aria-label="Open navigation"
                >
                  <PanelLeft className="h-4 w-4 text-slate-700" />
                </button>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
                  <Bell className="h-4 w-4 text-slate-600" />
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
            {inlineError ? (
              <div className="mb-5 rounded-2xl border border-rose-300/60 bg-rose-50 px-3 py-2 text-sm text-rose-800 shadow-sm">{inlineError}</div>
            ) : null}

            {section === "dashboard" ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Queue" value={String(stats.queued)} hint="Ready to publish" />
                  <StatCard label="Published" value={String(stats.published24h)} hint="Last 24 hours" />
                  <StatCard label="Success Rate" value={`${stats.successRate7d}%`} hint="Last 7 days" />
                  <StatCard label="Outlets Active" value={String(stats.outlets30)} hint="Last 30 days" />
                </div>

                <SoftCard className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black tracking-tight text-slate-950">Publishing activity</p>
                      <p className="mt-1 text-sm text-slate-600">14-day trend (published posts only)</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                      <CalendarDays className="mr-2 inline h-4 w-4 text-slate-500" />
                      Last 14 days
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <Sparkline points={stats.chart} />
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                        {stats.chart.reduce((a, b) => a + b, 0)}
                      </p>
                    </div>
                  </div>
                </SoftCard>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SoftCard className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black tracking-tight text-slate-950">Queue</p>
                      <button type="button" onClick={() => void loadRecords()} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
                        Refresh
                      </button>
                    </div>
                    {/* Mobile-first: cards on small screens, table on larger screens */}
                    <div className="mt-4 grid gap-3 sm:hidden">
                      {filteredQueue.slice(0, 6).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRecord(r)}
                          className="text-left rounded-3xl border border-black/10 bg-white p-4 shadow-sm hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black tracking-tight text-slate-950">{r.brand}</p>
                              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{r.target}</p>
                            </div>
                            <StatusBadge status={r.status} />
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-xs text-slate-600">By {r.created_by}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void publishQueuedRecord(r.id);
                              }}
                              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm"
                            >
                              Publish
                            </button>
                          </div>
                        </button>
                      ))}
                      {filteredQueue.length === 0 ? (
                        <div className="rounded-3xl border border-black/10 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
                          No queued posts.
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="pb-2">Outlet</th>
                            <th className="pb-2">Target</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {filteredQueue.slice(0, 6).map((r) => (
                            <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRecord(r)}>
                              <td className="py-3 font-semibold text-slate-900">{r.brand}</td>
                              <td className="py-3 uppercase text-slate-700">{r.target}</td>
                              <td className="py-3"><StatusBadge status={r.status} /></td>
                              <td className="py-3">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); void publishQueuedRecord(r.id); }}
                                  className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900"
                                >
                                  Publish
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredQueue.length === 0 ? (
                            <tr><td colSpan={4} className="py-8 text-center text-sm text-slate-600">No queued posts.</td></tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </SoftCard>

                  <SoftCard className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black tracking-tight text-slate-950">Recent activity</p>
                      <button type="button" onClick={() => setSection("history")} className="text-sm font-semibold text-sky-700 hover:text-sky-900">
                        View all
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:hidden">
                      {filteredHistory.slice(0, 6).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRecord(r)}
                          className="text-left rounded-3xl border border-black/10 bg-white p-4 shadow-sm hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black tracking-tight text-slate-950">{r.brand}</p>
                              <p className="mt-1 text-xs text-slate-600">{humanDate(r.published_at || r.created_at)}</p>
                            </div>
                            <StatusBadge status={r.status} />
                          </div>
                          <p className="mt-3 text-xs text-slate-600">
                            P:{r.post_id || "-"} / S:{r.story_id || "-"}
                          </p>
                        </button>
                      ))}
                      {filteredHistory.length === 0 ? (
                        <div className="rounded-3xl border border-black/10 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
                          No history yet.
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="pb-2">Outlet</th>
                            <th className="pb-2">When</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {filteredHistory.slice(0, 6).map((r) => (
                            <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRecord(r)}>
                              <td className="py-3 font-semibold text-slate-900">{r.brand}</td>
                              <td className="py-3 text-slate-700">{humanDate(r.published_at || r.created_at)}</td>
                              <td className="py-3"><StatusBadge status={r.status} /></td>
                            </tr>
                          ))}
                          {filteredHistory.length === 0 ? (
                            <tr><td colSpan={3} className="py-8 text-center text-sm text-slate-600">No history yet.</td></tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </SoftCard>
                </div>
              </div>
            ) : null}

            {section === "create" ? (
              <div className="space-y-5">
                <Stepper step={flowStep} />

                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition",
                    isDragging ? "border-sky-500 bg-sky-50" : "border-slate-300 bg-white/70"
                  )}
                >
                  <input type="file" multiple accept="image/png,image/jpeg" onChange={onFileChange} className="hidden" />
                  <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-sky-600" />
                    <p className="text-lg font-semibold text-slate-900">Drop poster or click to browse</p>
                    <p className="text-sm text-slate-600">JPG/PNG up to your platform limit</p>
                  </div>
                </label>

                {lastResult ? (
                  <SoftCard className="p-5">
                    <p className="text-sm font-black tracking-tight text-slate-950">Result</p>
                    <p className="mt-1 text-sm text-slate-600">Published to Instagram. IDs are shown below.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Post ID</p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-900">{lastResult.postId || "-"}</p>
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Story ID</p>
                        <p className="mt-1 break-all text-sm font-semibold text-slate-900">{lastResult.storyId || "-"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => { setLastResult(null); }}
                        className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                      >
                        Create another
                      </button>
                      <button
                        type="button"
                        onClick={() => setSection("history")}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900"
                      >
                        View history <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </SoftCard>
                ) : null}

                {selectedFiles.length > 1 ? (
                  <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedFiles.length} posters selected</p>
                        <p className="text-xs text-slate-600">
                          Analyze them together, then optionally publish as a carousel (magazine).
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">
                          <input
                            type="checkbox"
                            checked={carouselEnabled}
                            onChange={(e) => setCarouselEnabled(e.target.checked)}
                          />
                          Carousel (magazine)
                        </label>
                      </div>
                    </div>

                    {(draftResults.length > 0 || localPreviewUrls.length > 0) ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {(draftResults.length > 0 ? draftResults.map((r) => r.image_url) : localPreviewUrls).map((url, idx) => {
                          const selected = carouselSelection[String(url)] ?? true;
                          const active = idx === activeDraftIndex;
                          return (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setActiveDraftIndex(idx)}
                              className={cn(
                                "relative overflow-hidden rounded-2xl border bg-white shadow-sm",
                                active ? "border-slate-950" : "border-black/10 hover:border-slate-400"
                              )}
                            >
                              <img src={url} alt={`Poster ${idx + 1}`} className="h-28 w-full object-cover" />
                              {carouselEnabled ? (
                                <label className="absolute left-2 top-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-800">
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(e) => {
                                      const next = e.target.checked;
                                      setCarouselSelection((prev) => ({ ...prev, [String(url)]: next }));
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  Use
                                </label>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_1fr]">
                  <SoftCard className="p-4">
                    {activePreviewUrl ? (
                      <img src={activePreviewUrl} alt="Preview" className="mx-auto max-h-[520px] rounded-2xl object-contain" />
                    ) : (
                      <div className="grid min-h-80 place-items-center rounded-2xl border border-black/10 bg-slate-50 text-slate-500">
                        Poster preview
                      </div>
                    )}
                  </SoftCard>

                  <SoftCard className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-semibold">Draft Editor</h2>
                      {analysis?.brand ? <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">{analysis.brand}</span> : null}
                    </div>

                    <button
                      type="button"
                      onClick={analyzePoster}
                      disabled={selectedFiles.length === 0 || isAnalyzing}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60"
                    >
                      {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {isAnalyzing ? "Generating..." : selectedFiles.length > 1 ? "Generate Captions" : "Generate Caption"}
                    </button>

                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">Outlet</label>
                    <select
                      value={chosenBrand}
                      onChange={(e) => setChosenBrand(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      {allowedBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>

                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">Caption</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="AI draft appears here..."
                      className="mt-1 min-h-52 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none ring-sky-300 focus:ring-2"
                    />
                    <p className="mt-2 text-xs text-slate-600">{hashtagsLine}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <PublishTargetSwitch value={publishTarget} onChange={setPublishTarget} />
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm shadow-sm"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={publishNow}
                        disabled={isPublishing || !analysis}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                        Publish Now
                      </button>
                      <button
                        type="button"
                        onClick={addToQueue}
                        disabled={!analysis}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                      >
                        <Clock3 className="h-4 w-4" /> Add to Queue
                      </button>
                    </div>
                  </SoftCard>
                </div>
              </div>
            ) : null}

            {section === "queue" ? (
              <section className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Publishing Queue</h2>
                  <button type="button" onClick={() => void loadRecords()} className="text-sm font-semibold text-sky-700 hover:text-sky-900">Refresh</button>
                </div>
                {isRecordsLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                ) : filteredQueue.length === 0 ? (
                  <p className="text-sm text-slate-600">No queued posts.</p>
                ) : (
                  <>
                    <div className="grid gap-3 sm:hidden">
                      {filteredQueue.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="text-left rounded-3xl border border-black/10 bg-white p-4 shadow-sm hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black tracking-tight text-slate-950">{record.brand}</p>
                              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{record.target}</p>
                              <p className="mt-1 text-xs text-slate-600">Scheduled: {humanDate(record.scheduled_for)}</p>
                            </div>
                            <StatusBadge status={record.status} />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-slate-600">By {record.created_by}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void publishQueuedRecord(record.id);
                              }}
                              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm"
                            >
                              Publish
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-2">Outlet</th><th className="pb-2">Target</th><th className="pb-2">Scheduled</th><th className="pb-2">Created By</th><th className="pb-2">Status</th><th className="pb-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {filteredQueue.map((record) => (
                          <tr key={record.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRecord(record)}>
                            <td className="py-3">{record.brand}</td>
                            <td className="py-3 uppercase">{record.target}</td>
                            <td className="py-3">{humanDate(record.scheduled_for)}</td>
                            <td className="py-3">{record.created_by}</td>
                            <td className="py-3"><StatusBadge status={record.status} /></td>
                            <td className="py-3">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); void publishQueuedRecord(record.id); }}
                                className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900"
                              >
                                Publish
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </section>
            ) : null}

            {section === "history" ? (
              <section className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Publish History</h2>
                  <button type="button" onClick={() => void loadRecords()} className="text-sm font-semibold text-sky-700 hover:text-sky-900">Refresh</button>
                </div>
                {isRecordsLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                    <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <p className="text-sm text-slate-600">No history yet.</p>
                ) : (
                  <>
                    <div className="grid gap-3 sm:hidden">
                      {filteredHistory.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => setSelectedRecord(record)}
                          className="text-left rounded-3xl border border-black/10 bg-white p-4 shadow-sm hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black tracking-tight text-slate-950">{record.brand}</p>
                              <p className="mt-1 text-xs text-slate-600">{humanDate(record.published_at || record.created_at)}</p>
                            </div>
                            <StatusBadge status={record.status} />
                          </div>
                          <p className="mt-3 text-xs text-slate-600">P:{record.post_id || "-"} / S:{record.story_id || "-"}</p>
                          {record.error ? <p className="mt-1 text-xs text-rose-700">{record.error}</p> : null}
                          {record.status === "failed" ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); void retryHistory(record); }}
                              className="mt-3 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold shadow-sm hover:bg-slate-50"
                            >
                              Retry
                            </button>
                          ) : null}
                        </button>
                      ))}
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-2">Outlet</th><th className="pb-2">Published At</th><th className="pb-2">Status</th><th className="pb-2">IDs</th><th className="pb-2">Error</th><th className="pb-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {filteredHistory.map((record) => (
                          <tr key={record.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRecord(record)}>
                            <td className="py-3">{record.brand}</td>
                            <td className="py-3">{humanDate(record.published_at || record.created_at)}</td>
                            <td className="py-3"><StatusBadge status={record.status} /></td>
                            <td className="py-3 text-xs text-slate-600">P:{record.post_id || "-"} / S:{record.story_id || "-"}</td>
                            <td className="py-3 text-xs text-rose-700">{record.error || "-"}</td>
                            <td className="py-3">
                              {record.status === "failed" ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); void retryHistory(record); }}
                                  className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-slate-50"
                                >
                                  Retry
                                </button>
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </section>
            ) : null}

            {section === "assets" ? (
              <section className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                <h2 className="mb-3 text-lg font-semibold">Assets Library</h2>
                {recentAssets.length === 0 ? (
                  <p className="text-sm text-slate-600">No assets yet. Upload and publish to build your internal library.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {recentAssets.map((asset) => (
                      <div key={asset.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                        <img src={asset.image_url} alt={asset.brand} className="h-40 w-full object-cover" />
                        <div className="p-2 text-xs text-slate-700">
                          <p className="truncate font-semibold">{asset.brand}</p>
                          <p className="text-slate-500">{humanDate(asset.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {section === "admin" ? (
              user.role !== "agency_manager" ? (
                <section className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">
                  Only agency managers can access user administration.
                </section>
              ) : (
                <section className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Admin Users</h2>
                    <button type="button" onClick={() => void loadUsers()} className="text-sm font-semibold text-sky-700 hover:text-sky-900">Refresh</button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-sm md:grid-cols-2">
                    <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
                    <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value as "agency_manager" | "bar_manager")} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm">
                      <option value="agency_manager">Agency manager</option>
                      <option value="bar_manager">Bar manager</option>
                    </select>
                    <input value={newBrands} onChange={(e) => setNewBrands(e.target.value)} placeholder="Brands (comma separated)" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm" />
                    <button type="button" onClick={createUser} className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-900">Save User</button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-600">Filter users</p>
                    <select value={userFilterRole} onChange={(e) => setUserFilterRole(e.target.value as "all" | "agency_manager" | "bar_manager")} className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm shadow-sm">
                      <option value="all">All</option>
                      <option value="agency_manager">Agency manager</option>
                      <option value="bar_manager">Bar manager</option>
                    </select>
                  </div>

                  {isUsersLoading ? (
                    <div className="mt-3 h-12 animate-pulse rounded-2xl bg-slate-100" />
                  ) : (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Username</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Brands</th>
                            <th className="px-3 py-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10">
                          {filteredUsers.map((managedUser) => (
                            <tr key={managedUser.username}>
                              <td className="px-3 py-2">{managedUser.username}</td>
                              <td className="px-3 py-2">{managedUser.role}</td>
                              <td className="px-3 py-2">{managedUser.brands.join(", ")}</td>
                              <td className="px-3 py-2">
                                {managedUser.username !== user.username ? (
                                  <button type="button" onClick={() => void deleteManagedUser(managedUser.username)} className="inline-flex items-center gap-1 rounded-xl border border-rose-300/60 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                                ) : (
                                  <span className="text-xs text-slate-500">Current user</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )
            ) : null}

            {section === "settings" ? (
              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <h2 className="text-lg font-semibold">Workspace Settings</h2>
                  <p className="mt-2 text-sm text-slate-600">Environment: Production</p>
                  <p className="text-sm text-slate-600">API Routes secured with session tokens.</p>
                </div>
                <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <h2 className="text-lg font-semibold">Role Permissions</h2>
                  <p className="mt-2 text-sm text-slate-600">Agency managers can access all outlets and user administration.</p>
                  <p className="text-sm text-slate-600">Bar managers can publish only to assigned outlets.</p>
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-black/10 bg-white/90 backdrop-blur lg:hidden">
        {sideNavItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button key={item.id} type="button" onClick={() => setSection(item.id)} className={cn("flex flex-col items-center gap-1 py-2 text-[11px]", active ? "text-sky-800" : "text-slate-500") }>
              <Icon className="h-4 w-4" />
              {item.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>

      {selectedRecord ? (
        <div className="fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-black/20" onClick={() => setSelectedRecord(null)} aria-label="Close" />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg border-l border-black/10 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Record</p>
                <p className="mt-1 text-lg font-black tracking-tight text-slate-950">{selectedRecord.brand}</p>
                <p className="mt-1 text-xs text-slate-600">{humanDate(selectedRecord.published_at || selectedRecord.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <StatusBadge status={selectedRecord.status} />
              <span className="ml-2 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
                {selectedRecord.target}
              </span>
              {Array.isArray(selectedRecord.image_urls) && selectedRecord.image_urls.length > 1 ? (
                <span className="ml-2 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Carousel: {selectedRecord.image_urls.length}
                </span>
              ) : null}
            </div>

            <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-slate-50">
              <img src={selectedRecord.image_url} alt={selectedRecord.brand} className="h-64 w-full object-cover" />
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Caption</p>
              <div className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-3xl border border-black/10 bg-white p-4 text-sm text-slate-800 shadow-sm">
                {selectedRecord.caption}
              </div>
            </div>

            {selectedRecord.status === "queued" ? (
              <button
                type="button"
                onClick={() => void publishQueuedRecord(selectedRecord.id)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900"
              >
                Publish now <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-xs flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-xl",
              toast.tone === "success" && "border-emerald-300/60 bg-emerald-50 text-emerald-900",
              toast.tone === "error" && "border-rose-300/60 bg-rose-50 text-rose-900",
              toast.tone === "info" && "border-sky-300/60 bg-sky-50 text-sky-900"
            )}
          >
            {toast.tone === "success" ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : null}
            {toast.tone === "error" ? <XCircle className="mr-2 inline h-4 w-4" /> : null}
            {toast.tone === "info" ? <Shield className="mr-2 inline h-4 w-4" /> : null}
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
