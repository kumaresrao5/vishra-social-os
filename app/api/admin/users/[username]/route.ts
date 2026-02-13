import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { deleteUser } from "@/lib/team-users";

async function requireAgencyManager() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return { ok: false as const, response: NextResponse.json({ detail: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "agency_manager") {
    return { ok: false as const, response: NextResponse.json({ detail: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, session };
}

export async function DELETE(
  _request: Request,
  context: { params: { username: string } }
) {
  const guard = await requireAgencyManager();
  if (!guard.ok) return guard.response;

  const username = context.params.username?.trim().toLowerCase();
  if (!username) {
    return NextResponse.json({ detail: "username is required." }, { status: 400 });
  }
  if (username === guard.session.username) {
    return NextResponse.json({ detail: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    const users = await deleteUser(username);
    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        username: u.username,
        role: u.role,
        brands: u.brands,
      })),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Failed to delete user.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
