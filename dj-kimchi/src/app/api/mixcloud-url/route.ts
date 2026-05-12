import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

/* ------------------------------------------------------------------ */
/*  In-memory cache: track URL → { streamUrl, expiresAt }            */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  streamUrl: string;
  duration: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours — sig tokens are long-lived

/* ------------------------------------------------------------------ */
/*  Resolve yt-dlp binary path                                        */
/* ------------------------------------------------------------------ */

function getYtDlpPath(): string {
  // Installed via pip to user local bin
  const userBin = path.join(process.env.HOME || "/root", ".local", "bin", "yt-dlp");
  return userBin;
}

/* ------------------------------------------------------------------ */
/*  GET /api/mixcloud-url?url=<mixcloud_page_url>                     */
/*  Returns { streamUrl, duration }                                    */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing `url` parameter" }, { status: 400 });
  }

  // Validate it's a Mixcloud URL
  if (!url.includes("mixcloud.com/")) {
    return NextResponse.json({ error: "URL must be from mixcloud.com" }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({
      streamUrl: cached.streamUrl,
      duration: cached.duration,
      cached: true,
    });
  }

  try {
    const ytDlpPath = getYtDlpPath();

    // Extract the direct HTTP stream URL + duration
    const { stdout: streamUrl } = await execFileAsync(ytDlpPath, [
      "-f", "http",
      "--get-url",
      "--no-warnings",
      url,
    ], { timeout: 15000 });

    const { stdout: infoJson } = await execFileAsync(ytDlpPath, [
      "--dump-json",
      "--no-warnings",
      url,
    ], { timeout: 15000 });

    const info = JSON.parse(infoJson);
    const duration = info.duration || 0;

    const cleanUrl = streamUrl.trim();

    if (!cleanUrl) {
      return NextResponse.json({ error: "Could not extract stream URL" }, { status: 500 });
    }

    // Cache it
    cache.set(url, {
      streamUrl: cleanUrl,
      duration,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    console.log(`[MixcloudAPI] Extracted stream URL for: ${url}`);

    return NextResponse.json({ streamUrl: cleanUrl, duration, cached: false });
  } catch (err) {
    console.error("[MixcloudAPI] yt-dlp failed:", err);
    return NextResponse.json(
      { error: "Failed to extract Mixcloud stream URL" },
      { status: 500 },
    );
  }
}
