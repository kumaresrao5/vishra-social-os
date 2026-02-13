import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { authenticateUser } from "@/lib/team-users";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as LoginPayload;
    if (!username || !password) {
      return NextResponse.json({ detail: "Username and password are required." }, { status: 400 });
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json({ detail: "Invalid credentials." }, { status: 401 });
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: { username: user.username, role: user.role, brands: user.brands },
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Login failed." }, { status: 500 });
  }
}
