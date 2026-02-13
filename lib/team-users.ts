import { Redis } from "@upstash/redis";

export type UserRole = "agency_manager" | "bar_manager";

export type TeamUser = {
  username: string;
  password: string;
  role: UserRole;
  brands: string[];
};

const REDIS_USERS_KEY = "team_users";

function normalizeBrand(value: string): string {
  return value.trim().toLowerCase();
}

function parseEnvUsers(): TeamUser[] {
  const raw = process.env.TEAM_USERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TeamUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((u) => u?.username && u?.password && u?.role)
      .map((u) => ({
        username: u.username.trim().toLowerCase(),
        password: String(u.password),
        role: u.role,
        brands: Array.isArray(u.brands) ? u.brands.map(normalizeBrand) : [],
      }));
  } catch {
    return [];
  }
}

function hasRedisConfig(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

function sanitizeUsers(users: TeamUser[]): TeamUser[] {
  return users.map((u) => ({
    username: u.username.trim().toLowerCase(),
    password: String(u.password),
    role: u.role,
    brands: Array.isArray(u.brands) ? u.brands.map(normalizeBrand) : [],
  }));
}

export async function getTeamUsers(): Promise<TeamUser[]> {
  if (!hasRedisConfig()) {
    return parseEnvUsers();
  }

  try {
    const redis = getRedisClient();
    const users = await redis.get<TeamUser[] | null>(REDIS_USERS_KEY);
    if (!users) {
      const fallback = parseEnvUsers();
      if (fallback.length > 0) {
        await saveTeamUsers(fallback);
      }
      return fallback;
    }
    return sanitizeUsers(users);
  } catch {
    return parseEnvUsers();
  }
}

export async function saveTeamUsers(users: TeamUser[]): Promise<void> {
  if (!hasRedisConfig()) {
    throw new Error("User storage is read-only. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  }
  const redis = getRedisClient();
  const sanitized = sanitizeUsers(users);
  await redis.set(REDIS_USERS_KEY, sanitized);
}

export async function authenticateUser(username: string, password: string): Promise<TeamUser | null> {
  const users = await getTeamUsers();
  const normalizedUsername = username.trim().toLowerCase();
  return users.find((u) => u.username === normalizedUsername && u.password === password) ?? null;
}

export async function upsertUser(user: TeamUser): Promise<TeamUser[]> {
  const users = await getTeamUsers();
  const normalizedUsername = user.username.trim().toLowerCase();
  const next = users.filter((u) => u.username !== normalizedUsername);
  next.push({
    username: normalizedUsername,
    password: user.password,
    role: user.role,
    brands: user.brands.map(normalizeBrand),
  });
  await saveTeamUsers(next);
  return next;
}

export async function deleteUser(username: string): Promise<TeamUser[]> {
  const users = await getTeamUsers();
  const next = users.filter((u) => u.username !== username.trim().toLowerCase());
  await saveTeamUsers(next);
  return next;
}
