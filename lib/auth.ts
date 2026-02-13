import { jwtVerify, SignJWT } from "jose";

export type UserRole = "agency_manager" | "bar_manager";

export type TeamUser = {
  username: string;
  password: string;
  role: UserRole;
  brands: string[];
};

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

function normalizeBrand(value: string): string {
  return value.trim().toLowerCase();
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export function getTeamUsers(): TeamUser[] {
  const raw = process.env.TEAM_USERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TeamUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u) => u?.username && u?.password && u?.role)
      .map((u) => ({
        username: u.username.trim().toLowerCase(),
        password: u.password,
        role: u.role,
        brands: Array.isArray(u.brands) ? u.brands.map(normalizeBrand) : [],
      }));
  } catch {
    return [];
  }
}

export function authenticateUser(username: string, password: string): SessionUser | null {
  const users = getTeamUsers();
  const found = users.find((u) => u.username === username.trim().toLowerCase() && u.password === password);
  if (!found) return null;
  return { username: found.username, role: found.role, brands: found.brands };
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
  const normalized = normalizeBrand(brand);
  if (user.brands.includes("*")) return true;
  return user.brands.some((allowed) => normalized.includes(allowed) || allowed.includes(normalized));
}
