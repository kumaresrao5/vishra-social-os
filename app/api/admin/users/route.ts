import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getTeamUsers, upsertUser } from "@/lib/team-users";

type UpsertUserPayload = {
  username?: string;
  password?: string;
  role?: "agency_manager" | "bar_manager";
  brands?: string[];
};

async function requireAgencyManager() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return { ok: false as const, response: NextResponse.json({ detail: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "agency_manager") {
    return { ok: false as const, response: NextResponse.json({ detail: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, session };
}

export async function GET() {
  const guard = await requireAgencyManager();
  if (!guard.ok) return guard.response;

  const users = await getTeamUsers();
  return NextResponse.json({
    users: users.map((u) => ({
      username: u.username,
      role: u.role,
      brands: u.brands,
    })),
  });
}

export async function POST(request: Request) {
  const guard = await requireAgencyManager();
  if (!guard.ok) return guard.response;

  try {
    const payload = (await request.json()) as UpsertUserPayload;
    if (!payload.username || !payload.password || !payload.role) {
      return NextResponse.json({ detail: "username, password and role are required." }, { status: 400 });
    }

    const brands = Array.isArray(payload.brands) ? payload.brands : [];
    const users = await upsertUser({
      username: payload.username,
      password: payload.password,
      role: payload.role,
      brands,
    });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        username: u.username,
        role: u.role,
        brands: u.brands,
      })),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Failed to save user.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
