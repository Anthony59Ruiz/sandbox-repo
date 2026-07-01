const fs = require("fs");
const path = require("path");

const dir = "content";
const dryRun = process.argv.includes("--dry-run");

// Reuse the lightweight front-matter parsing approach from validate-content.js:
// match the leading `---` block, then read individual fields with per-key regexes.
// No external YAML dependency.
function parse(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;

  const front = match[1];
  const body = normalized.slice(match[0].length).trim();

  const field = (key) => {
    const m = front.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    return m ? m[1].trim() : null;
  };

  return {
    platform: field("platform"),
    scheduled: field("scheduled"),
    status: field("status"),
    body,
  };
}

const payloads = [];

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".md")) continue;

  const text = fs.readFileSync(path.join(dir, file), "utf8");
  const parsed = parse(text);
  if (!parsed) continue;

  if (parsed.status !== "approved") continue;

  payloads.push({
    id: path.basename(file, path.extname(file)),
    platform: parsed.platform,
    scheduled: parsed.scheduled || null,
    text: parsed.body,
    mediaUrls: [],
  });
}

if (dryRun) {
  for (const payload of payloads) {
    console.log(JSON.stringify(payload, null, 2));
  }
  process.exit(0);
}

// Real publishing (network requests) is not implemented yet. Only --dry-run is
// supported for now, so guard against accidental live runs.
console.error("Live publishing is not implemented yet. Run with --dry-run.");
process.exit(1);
