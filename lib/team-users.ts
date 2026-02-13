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

async function redisRequest(path: string, body?: unknown): Promise<Response> {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}${path}`;
  return await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

export async function getTeamUsers(): Promise<TeamUser[]> {
  if (!hasRedisConfig()) {
    return parseEnvUsers();
  }

  try {
    const response = await redisRequest(`/get/${REDIS_USERS_KEY}`);
    const payload = (await response.json()) as { result: TeamUser[] | null };
    if (!response.ok || !payload.result) {
      const fallback = parseEnvUsers();
      if (fallback.length > 0) {
        await saveTeamUsers(fallback);
      }
      return fallback;
    }
    return payload.result.map((u) => ({
      username: u.username.trim().toLowerCase(),
      password: String(u.password),
      role: u.role,
      brands: Array.isArray(u.brands) ? u.brands.map(normalizeBrand) : [],
    }));
  } catch {
    return parseEnvUsers();
  }
}

export async function saveTeamUsers(users: TeamUser[]): Promise<void> {
  if (!hasRedisConfig()) {
    throw new Error("User storage is read-only. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.");
  }
  const sanitized = users.map((u) => ({
    username: u.username.trim().toLowerCase(),
    password: String(u.password),
    role: u.role,
    brands: Array.isArray(u.brands) ? u.brands.map(normalizeBrand) : [],
  }));
  const response = await redisRequest(`/set/${REDIS_USERS_KEY}`, sanitized);
  if (!response.ok) {
    throw new Error("Failed to save users.");
  }
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
