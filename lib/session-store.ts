import fs from "fs/promises";
import path from "path";

export type DynamicSession = {
  data: any[];
  lastAccess: number;
};

export type Submission = {
  formType: string;
  payload: Record<string, any>;
  files: Record<string, { name: string; size: number; type: string }>;
  timestamp: number;
};

// Global in-memory maps to store session data
// Persist across Next.js hot-reloads by attaching to the global object.
const globalForSessions = globalThis as unknown as {
  dbSessions?: Map<string, DynamicSession>;
  submissionsStore?: Map<string, Submission>;
  defaultCollectionsSeed?: Map<string, any[]>;
};

if (!globalForSessions.dbSessions) {
  globalForSessions.dbSessions = new Map();
}
if (!globalForSessions.submissionsStore) {
  globalForSessions.submissionsStore = new Map();
}
if (!globalForSessions.defaultCollectionsSeed) {
  globalForSessions.defaultCollectionsSeed = new Map();
}

const dbSessions = globalForSessions.dbSessions;
const submissionsStore = globalForSessions.submissionsStore;
const defaultCollectionsSeed = globalForSessions.defaultCollectionsSeed;

// Helper to scan exercises and load default collection seed data dynamically
async function getDefaultCollectionData(collection: string): Promise<any[]> {
  if (defaultCollectionsSeed.has(collection)) {
    return defaultCollectionsSeed.get(collection)!;
  }

  try {
    const practiceDir = path.join(process.cwd(), "assets", "practice");
    const entries = await fs.readdir(practiceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = path.join(practiceDir, entry.name, "db-config.json");
        try {
          await fs.access(configPath);
          const configContent = await fs.readFile(configPath, "utf-8");
          const config = JSON.parse(configContent);

          if (config.collection === collection) {
            const dataPath = path.join(practiceDir, entry.name, "data.json");
            try {
              await fs.access(dataPath);
              const dataContent = await fs.readFile(dataPath, "utf-8");
              const data = JSON.parse(dataContent);
              defaultCollectionsSeed.set(collection, data);
              return data;
            } catch (e) {
              // Fallback to checking other JSON files in the folder (excluding configs)
              const folderFiles = await fs.readdir(path.join(practiceDir, entry.name));
              const dbFile = folderFiles.find(
                (file) =>
                  file.endsWith(".json") &&
                  file !== "db-config.json" &&
                  file !== "payload.json"
              );
              if (dbFile) {
                const dbFilePath = path.join(practiceDir, entry.name, dbFile);
                const dataContent = await fs.readFile(dbFilePath, "utf-8");
                const data = JSON.parse(dataContent);
                defaultCollectionsSeed.set(collection, data);
                return data;
              }
            }
          }
        } catch (e) {
          // Continue scanning if file doesn't exist or is invalid
        }
      }
    }
  } catch (error) {
    console.error(`Error loading default collection seed for ${collection}:`, error);
  }

  return [];
}

// 1. Sessions Management (Generic Database Operations)
export async function getDbDataForIp(ip: string, collection: string): Promise<any[]> {
  cleanupSessions();
  const key = `${ip}:${collection}`;
  let session = dbSessions.get(key);
  if (!session) {
    const defaults = await getDefaultCollectionData(collection);
    session = {
      // Deep clone to isolate database operations per student/session IP
      data: JSON.parse(JSON.stringify(defaults)),
      lastAccess: Date.now(),
    };
    dbSessions.set(key, session);
  } else {
    session.lastAccess = Date.now();
  }
  return session.data;
}

export async function saveDbDataForIp(
  ip: string,
  collection: string,
  data: any[]
): Promise<void> {
  cleanupSessions();
  const key = `${ip}:${collection}`;
  dbSessions.set(key, {
    data,
    lastAccess: Date.now(),
  });
}

// 2. Submission Management
export function saveSubmission(
  submissionId: string,
  submission: Omit<Submission, "timestamp">
): void {
  cleanupSessions();
  submissionsStore.set(submissionId, {
    ...submission,
    timestamp: Date.now(),
  });
}

export function getSubmission(submissionId: string): Submission | undefined {
  cleanupSessions();
  return submissionsStore.get(submissionId);
}

// 3. Automatically cleanup expired sessions and submissions
export function cleanupSessions(): void {
  const now = Date.now();

  // Clean DB sessions inactive for > 30 minutes
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  for (const [key, session] of dbSessions.entries()) {
    if (now - session.lastAccess > SESSION_TIMEOUT) {
      dbSessions.delete(key);
      console.log(`[RAM Store] Cleaned up inactive session for key: ${key}`);
    }
  }

  // Clean submissions older than 10 minutes
  const SUBMISSION_TIMEOUT = 10 * 60 * 1000;
  for (const [id, sub] of submissionsStore.entries()) {
    if (now - sub.timestamp > SUBMISSION_TIMEOUT) {
      submissionsStore.delete(id);
      console.log(`[RAM Store] Cleaned up expired submission ID: ${id}`);
    }
  }
}

// Helper to fetch IP from request headers
export function getClientIp(headers: Headers): string {
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "127.0.0.1";
}
