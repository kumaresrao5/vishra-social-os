"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, LogOut, Rocket, Sparkles } from "lucide-react";

type AnalysisResponse = {
  brand: string;
  caption: string;
  hashtags: string[];
  is_urgent: boolean;
  image_url: string;
  filename: string;
};

type PublishTarget = "post" | "story";

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

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

function ScaleXLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "mb-2"}>
      <p className={`${compact ? "text-lg" : "text-2xl"} font-black tracking-tight text-white`}>SCALE X</p>
      {!compact ? <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Since 2023</p> : null}
    </div>
  );
}

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTarget, setPublishTarget] = useState<PublishTarget>("post");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"agency_manager" | "bar_manager">("bar_manager");
  const [newBrands, setNewBrands] = useState("");

  const hashtagsLine = useMemo(() => (analysis ? analysis.hashtags.join(" ") : ""), [analysis]);

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
    if (!user || user.role !== "agency_manager") return;
    const loadUsers = async () => {
      setIsUsersLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail ?? "Failed loading users.");
        setManagedUsers(data.users ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed loading users.");
      } finally {
        setIsUsersLoading(false);
      }
    };
    void loadUsers();
  }, [user]);

  function resetFeedback() {
    setError("");
    setMessage("");
  }

  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
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
      setMessage("Logged in successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error during login.");
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
    setMessage("");
    setError("");
    setManagedUsers([]);
  }

  async function createUser() {
    if (!newUsername.trim() || !newPassword.trim()) {
      setError("New user requires username and password.");
      return;
    }
    setError("");
    const brands =
      newRole === "agency_manager"
        ? ["*"]
        : newBrands
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean);
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
      setMessage("User saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user.");
    }
  }

  async function deleteManagedUser(username: string) {
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${encodeURIComponent(username)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Failed to delete user.");
      setManagedUsers(data.users ?? []);
      setMessage(`Deleted user: ${username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    }
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
        body: JSON.stringify({
          image_url: analysis.image_url,
          caption,
          brand: analysis.brand,
          target: publishTarget,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Publish failed.");
      if (publishTarget === "post") {
        setMessage(`Post published successfully. Instagram Post ID: ${data.instagram_post_id}`);
      } else {
        setMessage(`Story published successfully. Instagram Story ID: ${data.instagram_story_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error during publishing.");
    } finally {
      setIsPublishing(false);
    }
  }

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
        <p className="inline-flex items-center gap-2 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
        <form
          onSubmit={onLoginSubmit}
          className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <ScaleXLogo compact />
          <p className="mb-1 mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">Internal Social OS</p>
          <h1 className="mb-4 text-2xl font-bold">Team Login</h1>
          <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
          <button
            type="submit"
            disabled={isLoginLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {isLoginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoginLoading ? "Signing in..." : "Sign In"}
          </button>
          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-r from-cyan-600 via-sky-700 to-indigo-900 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <ScaleXLogo compact />
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950/40 px-3 py-2 text-xs font-semibold"
            >
              <LogOut className="h-4 w-4" />
              {user.username} ({user.role})
            </button>
          </div>

          <h1 className="text-3xl font-bold leading-tight md:text-5xl">Scale X Internal Publishing Console</h1>
          <p className="mt-3 max-w-2xl text-sm text-cyan-100 md:text-base">
            Upload posters, generate caption drafts, and publish to Instagram with role-based control across outlets.
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

            <div className="mt-4 inline-flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setPublishTarget("post")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  publishTarget === "post" ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setPublishTarget("story")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  publishTarget === "story" ? "bg-cyan-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Story
              </button>
            </div>

            <button
              type="button"
              onClick={publishNow}
              disabled={isPublishing}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
              {isPublishing
                ? `Publishing ${publishTarget === "post" ? "Post" : "Story"}...`
                : `Publish ${publishTarget === "post" ? "Post" : "Story"}`}
            </button>
          </article>
        )}

        {message && (
          <p className="rounded-lg border border-emerald-700 bg-emerald-900/30 p-3 text-sm text-emerald-300">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg border border-rose-700 bg-rose-900/30 p-3 text-sm text-rose-300">{error}</p>
        )}

        {user.role === "agency_manager" && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">Admin Panel</h3>
            <p className="mt-1 text-sm text-slate-400">Create users and assign outlet permissions.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                type="text"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="text"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "agency_manager" | "bar_manager")}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="bar_manager">bar_manager</option>
                <option value="agency_manager">agency_manager</option>
              </select>
              <input
                type="text"
                placeholder="Brands (comma separated), e.g. barley & hops"
                value={newBrands}
                onChange={(e) => setNewBrands(e.target.value)}
                disabled={newRole === "agency_manager"}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-60"
              />
            </div>

            <button
              type="button"
              onClick={createUser}
              className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Save User
            </button>

            <div className="mt-6 space-y-2">
              {isUsersLoading ? <p className="text-sm text-slate-400">Loading users...</p> : null}
              {managedUsers.map((managedUser) => (
                <div
                  key={managedUser.username}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">{managedUser.username}</p>
                    <p className="text-slate-400">
                      {managedUser.role} | brands: {managedUser.brands.join(", ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteManagedUser(managedUser.username)}
                    disabled={managedUser.username === user.username}
                    className="rounded-md border border-rose-700 px-3 py-1 text-rose-300 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
