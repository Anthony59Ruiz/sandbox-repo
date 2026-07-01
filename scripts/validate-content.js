const fs = require("fs");

const path = require("path");

const dir = "content";

const required = ["platform", "scheduled", "status"];

let failed = false;

for (const file of fs.readdirSync(dir)) {

  if (!file.endsWith(".md")) continue;

  const text = fs.readFileSync(path.join(dir, file), "utf8").replace(/\r\n/g, "\n");

  const match = text.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {

    console.error(`${file}: missing YAML front matter`);

    failed = true;

    continue;

  }

  const front = match[1];

  for (const key of required) {

    if (!new RegExp(`^${key}:`, "m").test(front)) {

      console.error(`${file}: missing required field "${key}"`);

      failed = true;

    }

  }

}

if (failed) {

  console.error("Content validation failed.");

  process.exit(1);

}

console.log("All content files valid.");
