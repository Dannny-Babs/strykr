import { Source } from "./sources";

export interface CollectedPage {
  sourceId: string;
  url: string;
  fetchedAt: string;
  status: "ok" | "error";
  httpStatus?: number;
  title?: string;
  textExcerpt?: string;
  error?: string;
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1]?.trim();
}

function stripToText(html: string, maxLength = 2000): string {
  const withoutScripts = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  const text = withoutScripts
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLength);
}

/**
 * Fetches one authoritative source and normalizes it into a CollectedPage.
 * Requires outbound network access to the source's domain — this will fail
 * in sandboxed environments without general internet egress (e.g. some CI
 * runners), but works from a normal deploy target like Vercel.
 */
export async function collectSource(source: Source): Promise<CollectedPage> {
  const fetchedAt = new Date().toISOString();
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "CordenaResearchBot/0.1 (+https://cordena.app)" },
    });
    if (!res.ok) {
      return { sourceId: source.id, url: source.url, fetchedAt, status: "error", httpStatus: res.status, error: `HTTP ${res.status}` };
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("pdf")) {
      return { sourceId: source.id, url: source.url, fetchedAt, status: "ok", httpStatus: res.status, title: source.label, textExcerpt: "(PDF — binary content not extracted in v1 collector)" };
    }
    const html = await res.text();
    return {
      sourceId: source.id,
      url: source.url,
      fetchedAt,
      status: "ok",
      httpStatus: res.status,
      title: extractTitle(html) ?? source.label,
      textExcerpt: stripToText(html),
    };
  } catch (err) {
    return { sourceId: source.id, url: source.url, fetchedAt, status: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function collectAll(sources: Source[]): Promise<CollectedPage[]> {
  return Promise.all(sources.map(collectSource));
}
