import { NextResponse } from "next/server";
import { authenticateUser, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as LoginPayload;
    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
    }

    const user = authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ detail: "Invalid credentials." }, { status: 401 });
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: { email: user.email, role: user.role, brands: user.brands },
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
