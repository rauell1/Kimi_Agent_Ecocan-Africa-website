// AI architecture generation — browser-safe fetch version
// Previously used createServerFn from @tanstack/react-start (SSR-only).
// Now implemented as a plain async function callable from the client.
import { z } from "zod";

const Input = z.object({ challenge: z.string().min(4).max(2000) });

const Schema = {
  type: "object",
  properties: {
    project_name: { type: "string" },
    summary: { type: "string" },
    hardware: { type: "array", items: { type: "string" } },
    software: { type: "array", items: { type: "string" } },
    ai_agents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
        },
        required: ["name", "role"],
        additionalProperties: false,
      },
    },
  },
  required: ["project_name", "summary", "hardware", "software", "ai_agents"],
  additionalProperties: false,
} as const;

export type Architecture = {
  project_name: string;
  summary: string;
  hardware: string[];
  software: string[];
  ai_agents: { name: string; role: string }[];
};

export async function generateArchitecture(challenge: string): Promise<Architecture> {
  const { challenge: validChallenge } = Input.parse({ challenge });

  const res = await fetch("/api/architecture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge: validChallenge }),
  });

  if (res.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted.");
  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  return res.json() as Promise<Architecture>;
}
