import { jwtVerify, SignJWT } from "jose";

export type UserRole = "agency_manager" | "bar_manager";

export type SessionUser = {
  username: string;
  role: UserRole;
  brands: string[];
};

export const SESSION_COOKIE = "sx_session";

type SessionPayload = {
  username: string;
  role: UserRole;
  brands: string[];
  exp: number;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    username: user.username,
    role: user.role,
    brands: user.brands,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const casted = payload as unknown as SessionPayload;
    if (!casted.username || !casted.role || !Array.isArray(casted.brands)) return null;
    return {
      username: String(casted.username),
      role: casted.role,
      brands: casted.brands.map((b) => String(b).toLowerCase()),
    };
  } catch {
    return null;
  }
}

export function canPublishBrand(user: SessionUser, brand: string): boolean {
  if (user.role === "agency_manager") return true;
  const normalized = brand.trim().toLowerCase();
  if (user.brands.includes("*")) return true;
  return user.brands.some((allowed) => normalized.includes(allowed) || allowed.includes(normalized));
}
