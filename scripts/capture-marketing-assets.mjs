import fs from "node:fs/promises";
import path from "node:path";

const APP_ORIGIN = process.env.SX_APP_ORIGIN || "https://ai.scalex.my";
const USERNAME = process.env.SX_DEMO_USERNAME || "admin";
const PASSWORD = process.env.SX_DEMO_PASSWORD || "admin";

function pickCookie(setCookieHeader, name) {
  if (!setCookieHeader) return null;
  const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const line of headers) {
    const match = String(line).match(new RegExp(`${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const { chromium } = await import("playwright");

  const loginResp = await fetch(`${APP_ORIGIN}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!loginResp.ok) {
    throw new Error(`Login failed: ${loginResp.status}`);
  }

  const setCookie = loginResp.headers.get("set-cookie");
  const sessionValue = pickCookie(setCookie, "sx_session");
  if (!sessionValue) {
    throw new Error("Could not read sx_session cookie from login response.");
  }

  const screensDir = path.resolve("public/marketing/screens");
  const videoTmpDir = path.resolve("public/marketing/_video_tmp");
  await ensureDir(screensDir);
  await ensureDir(videoTmpDir);

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoTmpDir, size: { width: 1440, height: 900 } },
  });

  await context.addCookies([
    {
      name: "sx_session",
      value: sessionValue,
      domain: "ai.scalex.my",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();
  await page.goto(`${APP_ORIGIN}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // Create (composer)
  await page.screenshot({ path: path.join(screensDir, "app-create.png"), fullPage: false });

  // Queue
  await page.getByRole("button", { name: "Queue" }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(screensDir, "app-queue.png"), fullPage: false });

  // History
  await page.getByRole("button", { name: "History" }).click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(screensDir, "app-history.png"), fullPage: false });

  // Admin (Users) - might not exist for non-agency accounts
  const usersNav = page.getByRole("button", { name: "Users" });
  if (await usersNav.count()) {
    await usersNav.click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(screensDir, "app-admin.png"), fullPage: false });
  }

  // A short walkthrough
  await page.getByRole("button", { name: "Create Post" }).click();
  await page.waitForTimeout(900);

  await context.close();
  await browser.close();

  // Move recorded video to stable path.
  const files = await fs.readdir(videoTmpDir);
  const webm = files.find((f) => f.endsWith(".webm"));
  if (!webm) {
    throw new Error("Playwright did not produce a .webm video.");
  }
  const from = path.join(videoTmpDir, webm);
  const to = path.resolve("public/marketing/demo.webm");
  await fs.rename(from, to);

  // Clean tmp dir (best effort)
  for (const f of files) {
    if (f !== webm) {
      await fs.rm(path.join(videoTmpDir, f), { recursive: true, force: true });
    }
  }
  await fs.rm(videoTmpDir, { recursive: true, force: true });

  console.log("Captured marketing assets:");
  console.log("- public/marketing/screens/app-create.png");
  console.log("- public/marketing/screens/app-queue.png");
  console.log("- public/marketing/screens/app-history.png");
  console.log("- public/marketing/screens/app-admin.png");
  console.log("- public/marketing/demo.webm");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
