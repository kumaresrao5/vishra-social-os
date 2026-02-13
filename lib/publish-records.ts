import { Redis } from "@upstash/redis";

export type RecordStatus = "queued" | "published" | "failed";
export type RecordTarget = "post" | "story" | "both";

export type PublishRecord = {
  id: string;
  brand: string;
  caption: string;
  image_url: string;
  target: RecordTarget;
  status: RecordStatus;
  created_by: string;
  created_at: string;
  scheduled_for?: string;
  published_at?: string;
  post_id?: string;
  story_id?: string;
  error?: string;
};

const REDIS_RECORDS_KEY = "publish_records";
let inMemoryRecords: PublishRecord[] = [];
let redisClient: Redis | null = null;

function hasRedisConfig(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }
  return redisClient;
}

function normalizeRecord(record: PublishRecord): PublishRecord {
  return {
    ...record,
    id: String(record.id),
    brand: String(record.brand),
    caption: String(record.caption),
    image_url: String(record.image_url),
    target: record.target,
    status: record.status,
    created_by: String(record.created_by),
    created_at: String(record.created_at),
    scheduled_for: record.scheduled_for ? String(record.scheduled_for) : undefined,
    published_at: record.published_at ? String(record.published_at) : undefined,
    post_id: record.post_id ? String(record.post_id) : undefined,
    story_id: record.story_id ? String(record.story_id) : undefined,
    error: record.error ? String(record.error) : undefined,
  };
}

async function saveAll(records: PublishRecord[]): Promise<void> {
  const normalized = records.map(normalizeRecord);
  if (!hasRedisConfig()) {
    inMemoryRecords = normalized;
    return;
  }
  const redis = getRedisClient();
  await redis.set(REDIS_RECORDS_KEY, normalized);
}

export async function getAllRecords(): Promise<PublishRecord[]> {
  if (!hasRedisConfig()) {
    return inMemoryRecords;
  }
  try {
    const redis = getRedisClient();
    const records = await redis.get<PublishRecord[] | null>(REDIS_RECORDS_KEY);
    return Array.isArray(records) ? records.map(normalizeRecord) : [];
  } catch {
    return [];
  }
}

export async function addRecord(input: Omit<PublishRecord, "id" | "created_at">): Promise<PublishRecord> {
  const records = await getAllRecords();
  const record: PublishRecord = {
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  records.unshift(record);
  await saveAll(records.slice(0, 1000));
  return record;
}

export async function updateRecord(id: string, patch: Partial<PublishRecord>): Promise<PublishRecord | null> {
  const records = await getAllRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;
  records[index] = normalizeRecord({ ...records[index], ...patch, id: records[index].id });
  await saveAll(records);
  return records[index];
}

export async function getRecordById(id: string): Promise<PublishRecord | null> {
  const records = await getAllRecords();
  return records.find((r) => r.id === id) ?? null;
}
