import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const repoRoot = process.cwd();
const readmePath = path.join(repoRoot, "README.md");
const packageJsonPath = path.join(repoRoot, "package.json");

const AUTO_STATUS_START = "<!-- AUTO_STATUS_START -->";
const AUTO_STATUS_END = "<!-- AUTO_STATUS_END -->";
const MAJOR_LOG_START = "<!-- MAJOR_LOG_START -->";
const MAJOR_LOG_END = "<!-- MAJOR_LOG_END -->";

function getMajor(version) {
  const match = /^(\d+)/.exec(version || "");
  return match ? Number(match[1]) : 0;
}

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  return pkg.version || "0.0.0";
}

function getPreviousVersion() {
  try {
    const previousPkgRaw = execSync("git show HEAD^:package.json", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const previousPkg = JSON.parse(previousPkgRaw);
    return previousPkg.version || null;
  } catch {
    return null;
  }
}

function getShortSha() {
  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "local";
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getBlock(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Missing README markers: ${startMarker} ... ${endMarker}`);
  }
  return text.slice(start + startMarker.length, end);
}

function replaceBlock(text, startMarker, endMarker, body) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  return `${text.slice(0, start + startMarker.length)}\n${body}\n${text.slice(end)}`;
}

const readme = fs.readFileSync(readmePath, "utf8");
const currentVersion = getCurrentVersion();
const previousVersion = getPreviousVersion();
const currentMajor = getMajor(currentVersion);
const previousMajor = previousVersion ? getMajor(previousVersion) : null;
const majorBumped = previousMajor !== null && currentMajor > previousMajor;
const today = getToday();
const sha = getShortSha();

const existingStatusLines = getBlock(readme, AUTO_STATUS_START, AUTO_STATUS_END)
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);
const existingMajorLine = existingStatusLines.find((line) =>
  line.startsWith("- Last Major Upgrade:"),
);

const majorStatusLine = majorBumped
  ? `- Last Major Upgrade: \`v${currentMajor}.x\` on \`${today}\` (version \`${currentVersion}\`)`
  : existingMajorLine || `- Last Major Upgrade: \`v${currentMajor}.x\` on \`${today}\` (version \`${currentVersion}\`)`;

const nextStatusLines = [
  `- Current Version: \`${currentVersion}\``,
  majorStatusLine,
  `- Last Synced: \`${today}\``,
];

const existingLogLines = getBlock(readme, MAJOR_LOG_START, MAJOR_LOG_END)
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

let nextLogLines = [...existingLogLines];
if (majorBumped) {
  const newEntry = `- ${today}: Major upgrade from \`${previousVersion}\` to \`${currentVersion}\` (commit \`${sha}\`).`;
  const alreadyLogged = existingLogLines.some((line) => line.includes(`\`${currentVersion}\``));
  if (!alreadyLogged) {
    nextLogLines = [newEntry, ...existingLogLines];
  }
}

if (nextLogLines.length === 0) {
  nextLogLines = [`- ${today}: README auto-update baseline initialized at \`${currentVersion}\`.`];
}

let nextReadme = readme;
nextReadme = replaceBlock(nextReadme, AUTO_STATUS_START, AUTO_STATUS_END, nextStatusLines.join("\n"));
nextReadme = replaceBlock(nextReadme, MAJOR_LOG_START, MAJOR_LOG_END, nextLogLines.join("\n"));

if (nextReadme !== readme) {
  fs.writeFileSync(readmePath, nextReadme);
  console.log("README updated.");
} else {
  console.log("README unchanged.");
}

console.log(
  JSON.stringify(
    {
      currentVersion,
      previousVersion,
      majorBumped,
      updated: nextReadme !== readme,
    },
    null,
    2,
  ),
);
