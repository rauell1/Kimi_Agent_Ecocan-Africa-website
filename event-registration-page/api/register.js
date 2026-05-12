const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpgZN9jKJP9q2C1BGs2Wiw1DMmQEK7t_loG5IHxHgw-x70OcX6TNT7oNCIuJMT9Iq1sw/exec";

function asObject(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try { return JSON.parse(value); } catch (_) { return null; }
}

function validatePayload(payload) {
  const required = ["name", "email", "phone", "company", "job_title", "role", "attendance"];
  for (const key of required) {
    if (!payload[key] || !String(payload[key]).trim()) return "Missing required field: " + key;
  }
  return null;
}

function normalizeAppsScriptStatus(result) {
  if (!result || typeof result !== "object") return null;
  if (result.status === "success" || result.status === "full" || result.status === "error") return result;
  if (result.success === true) return { status: "success" };
  if (result.full === true) return { status: "full" };
  return null;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ status: "error", message: "Method not allowed." }); return; }

  const payload = asObject(req.body);
  if (!payload) { res.status(400).json({ status: "error", message: "Invalid JSON payload." }); return; }

  const validationError = validatePayload(payload);
  if (validationError) { res.status(400).json({ status: "error", message: validationError }); return; }

  const endpointUrl = process.env.APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

  try {
    const upstream = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await upstream.text();
    const cleanText = (text || "").trim().replace(/^\)\]\}'\s*/, "");
    const contentType = upstream.headers.get("content-type") || "";
    let result = null;
    try { result = cleanText ? JSON.parse(cleanText) : null; } catch (_) { result = null; }
    const normalized = normalizeAppsScriptStatus(result);

    if (!upstream.ok) {
      res.status(502).json({ status: "error", message: (result && result.message) || "Registration service returned an error." });
      return;
    }
    if (normalized && normalized.status === "error") {
      res.status(502).json({ status: "error", message: (result && result.message) || "Registration script returned an error." });
      return;
    }
    if (!normalized) {
      const isHtml = contentType.includes("text/html") || cleanText.startsWith("<!DOCTYPE") || cleanText.startsWith("<html");
      if (isHtml) { res.status(200).json({ status: "success", warning: "Apps Script returned HTML." }); return; }
      res.status(502).json({ status: "error", message: "Registration service returned an invalid response." });
      return;
    }
    res.status(200).json(normalized);
  } catch (_) {
    res.status(500).json({ status: "error", message: "Unable to reach registration service." });
  }
}
