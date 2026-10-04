import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export async function fetchInitialList<T>(endpoint: string, signal: AbortSignal): Promise<T[]> {
  const firstUrl = buildApiUrl(endpoint);
  const items: T[] = [];
  const visited = new Set<string>();
  let url: string | null = firstUrl;

  while (url) {
    if (visited.has(url) || visited.size >= 100) {
      throw new Error("Invalid list pagination response.");
    }
    visited.add(url);

    const response = await privateFetch(url, { signal });
    const data: unknown = await response.json();
    if (!response.ok) {
      const detail = isRecord(data) && typeof data.detail === "string"
        ? data.detail
        : "Unable to load data.";
      throw createApiError(response.status, detail);
    }

    const records = Array.isArray(data) ? data : isRecord(data)
      ? data.results ?? data.ticket ?? data.rooms ?? data.room ?? data.data
      : null;
    if (!Array.isArray(records)) {
      throw new Error("Invalid list response.");
    }
    items.push(...records as T[]);

    const next: URL | null = isRecord(data) && typeof data.next === "string"
      ? new URL(data.next, url)
      : null;
    if (next && next.origin !== new URL(firstUrl).origin) {
      throw new Error("Invalid list pagination URL.");
    }
    url = next?.href ?? null;
  }

  return items;
}
