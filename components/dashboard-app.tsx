"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Film,
  History,
  ImagePlus,
  LayoutGrid,
  Loader2,
  LogOut,
  Rocket,
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
type Section = "create" | "queue" | "history" | "assets" | "admin" | "settings";

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

export default function DashboardApp({ initialSection = "create" }: { initialSection?: Section }) {
  const [section, setSection] = useState<Section>(initialSection);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [chosenBrand, setChosenBrand] = useState<string>("");
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

  const hashtagsLine = useMemo(() => (analysis ? analysis.hashtags.join(" ") : ""), [analysis]);
  const uploadStepDone = Boolean(selectedFile);
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
    if (!analysis) return;
    setChosenBrand(analysis.brand || allowedBrands[0] || "");
  }, [analysis, allowedBrands]);

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
    setSelectedFile(null);
    setPreviewUrl("");
    setCaption("");
    setQueueRecords([]);
    setHistoryRecords([]);
    setManagedUsers([]);
    setSection("create");
  }

  function applyFile(file: File) {
    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setInlineError("Only JPG and PNG files are supported.");
      return;
    }
    clearFeedback();
    setAnalysis(null);
    setCaption("");
    setChosenBrand("");
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
      setInlineError("Upload a poster first.");
      return;
    }

    clearFeedback();
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
      setAnalysis(parsed);
      setCaption(`${parsed.caption}\n\n${parsed.hashtags.join(" ")}`);
      setChosenBrand(parsed.brand || allowedBrands[0] || "");
      showToast(parsed.is_urgent ? "Urgent event detected." : "Caption generated.", "success");
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
      const response = await fetch(`${API_BASE_URL}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: analysis.image_url,
          caption,
          brand: chosenBrand,
          target: publishTarget,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Publish failed.");
      showToast("Published successfully.", "success");
      await loadRecords();
      setSection("history");
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
      const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: analysis.image_url,
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

  const sideNavItems = [
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
        <aside className="hidden w-64 shrink-0 border-r border-black/10 bg-white/75 p-5 lg:flex lg:flex-col backdrop-blur">
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
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "bg-sky-500/10 text-sky-900" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

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
                <select
                  value={chosenBrand || allowedBrands[0] || ""}
                  onChange={(e) => setChosenBrand(e.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
                >
                  {allowedBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm">
                  <Bell className="h-4 w-4 text-slate-600" />
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
            {inlineError ? (
              <div className="mb-5 rounded-2xl border border-rose-300/60 bg-rose-50 px-3 py-2 text-sm text-rose-800 shadow-sm">{inlineError}</div>
            ) : null}

            {section === "create" ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className={cn("rounded-2xl border px-3 py-2", uploadStepDone ? "border-emerald-300/70 bg-emerald-50" : "border-black/10 bg-white")}>
                      <p className="text-xs uppercase text-slate-500">Step 1</p>
                      <p className="text-sm font-semibold">Upload Poster</p>
                    </div>
                    <div className={cn("rounded-2xl border px-3 py-2", draftStepDone ? "border-emerald-300/70 bg-emerald-50" : "border-black/10 bg-white")}>
                      <p className="text-xs uppercase text-slate-500">Step 2</p>
                      <p className="text-sm font-semibold">Review AI Draft</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white px-3 py-2">
                      <p className="text-xs uppercase text-slate-500">Step 3</p>
                      <p className="text-sm font-semibold">Publish or Queue</p>
                    </div>
                  </div>
                </div>

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
                  <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} className="hidden" />
                  <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-sky-600" />
                    <p className="text-lg font-semibold text-slate-900">Drop poster or click to browse</p>
                    <p className="text-sm text-slate-600">JPG/PNG up to your platform limit</p>
                  </div>
                </label>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_1fr]">
                  <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="mx-auto max-h-[520px] rounded-2xl object-contain" />
                    ) : (
                      <div className="grid min-h-80 place-items-center rounded-2xl border border-black/10 bg-slate-50 text-slate-500">
                        Poster preview
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-semibold">Draft Editor</h2>
                      {analysis?.brand ? <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-900">{analysis.brand}</span> : null}
                    </div>

                    <button
                      type="button"
                      onClick={analyzePoster}
                      disabled={!selectedFile || isAnalyzing}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60"
                    >
                      {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {isAnalyzing ? "Generating..." : "Generate Caption"}
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
                  </div>
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
                ) : queueRecords.length === 0 ? (
                  <p className="text-sm text-slate-600">No queued posts.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-2">Outlet</th><th className="pb-2">Target</th><th className="pb-2">Scheduled</th><th className="pb-2">Created By</th><th className="pb-2">Status</th><th className="pb-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {queueRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="py-3">{record.brand}</td>
                            <td className="py-3 uppercase">{record.target}</td>
                            <td className="py-3">{humanDate(record.scheduled_for)}</td>
                            <td className="py-3">{record.created_by}</td>
                            <td className="py-3"><StatusBadge status={record.status} /></td>
                            <td className="py-3">
                              <button type="button" onClick={() => void publishQueuedRecord(record.id)} className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-900">Publish</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                ) : historyRecords.length === 0 ? (
                  <p className="text-sm text-slate-600">No history yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="pb-2">Outlet</th><th className="pb-2">Published At</th><th className="pb-2">Status</th><th className="pb-2">IDs</th><th className="pb-2">Error</th><th className="pb-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10">
                        {historyRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="py-3">{record.brand}</td>
                            <td className="py-3">{humanDate(record.published_at || record.created_at)}</td>
                            <td className="py-3"><StatusBadge status={record.status} /></td>
                            <td className="py-3 text-xs text-slate-600">P:{record.post_id || "-"} / S:{record.story_id || "-"}</td>
                            <td className="py-3 text-xs text-rose-700">{record.error || "-"}</td>
                            <td className="py-3">
                              {record.status === "failed" ? (
                                <button type="button" onClick={() => void retryHistory(record)} className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-slate-50">Retry</button>
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
