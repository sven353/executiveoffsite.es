import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";

export type StoreName = "venues" | "media";

export interface KV {
  getJSON<T>(key: string): Promise<T | null>;
  setJSON(key: string, value: unknown): Promise<void>;
  getBinary(key: string): Promise<{ data: ArrayBuffer; contentType: string } | null>;
  setBinary(key: string, data: ArrayBuffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

function useFiles() {
  const forced = process.env.STORAGE_BACKEND;
  if (forced === "files") return true;
  if (forced === "blobs") return false;
  return process.env.NODE_ENV !== "production";
}

// Production: Netlify Blobs (included in every Netlify plan, no external service).
function blobsKV(name: StoreName): KV {
  const store = () => getStore({ name, consistency: "strong" });
  return {
    async getJSON<T>(key: string) {
      const value = await store().get(key, { type: "json" });
      return (value ?? null) as T | null;
    },
    async setJSON(key, value) {
      await store().setJSON(key, value);
    },
    async getBinary(key) {
      const res = await store().getWithMetadata(key, { type: "arrayBuffer" });
      if (!res) return null;
      const contentType =
        typeof res.metadata?.contentType === "string"
          ? res.metadata.contentType
          : "application/octet-stream";
      return { data: res.data, contentType };
    },
    async setBinary(key, data, contentType) {
      await store().set(key, data, { metadata: { contentType } });
    },
    async delete(key) {
      await store().delete(key);
    },
    async list(prefix) {
      const { blobs } = await store().list({ prefix });
      return blobs.map((b) => b.key);
    },
  };
}

// Local development: plain files in ./.data so the app runs without any account.
function filesKV(name: StoreName): KV {
  const root = path.join(process.cwd(), ".data", name);

  function resolve(key: string) {
    const full = path.resolve(root, key);
    if (!full.startsWith(root + path.sep)) throw new Error("Invalid key");
    return full;
  }

  async function exists(file: string) {
    try {
      await fs.access(file);
      return true;
    } catch {
      return false;
    }
  }

  async function walk(dir: string): Promise<string[]> {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    const out: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await walk(full)));
      else if (!entry.name.endsWith(".meta.json")) out.push(full);
    }
    return out;
  }

  return {
    async getJSON<T>(key: string) {
      const file = resolve(key);
      if (!(await exists(file))) return null;
      return JSON.parse(await fs.readFile(file, "utf8")) as T;
    },
    async setJSON(key, value) {
      const file = resolve(key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(value, null, 2));
    },
    async getBinary(key) {
      const file = resolve(key);
      if (!(await exists(file))) return null;
      const buf = await fs.readFile(file);
      let contentType = "application/octet-stream";
      try {
        const meta = JSON.parse(await fs.readFile(file + ".meta.json", "utf8"));
        if (typeof meta.contentType === "string") contentType = meta.contentType;
      } catch {
        // no metadata file
      }
      const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
      return { data, contentType };
    },
    async setBinary(key, data, contentType) {
      const file = resolve(key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, Buffer.from(data));
      await fs.writeFile(file + ".meta.json", JSON.stringify({ contentType }));
    },
    async delete(key) {
      const file = resolve(key);
      await fs.rm(file, { force: true });
      await fs.rm(file + ".meta.json", { force: true });
    },
    async list(prefix = "") {
      const files = await walk(root);
      return files
        .map((f) => path.relative(root, f).split(path.sep).join("/"))
        .filter((k) => k.startsWith(prefix));
    },
  };
}

export function getKV(name: StoreName): KV {
  return useFiles() ? filesKV(name) : blobsKV(name);
}
