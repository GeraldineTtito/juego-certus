import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOTS = ["./js", "./scripts"];
const EXTRA_FILES = ["./eslint.config.js"];

/**
 * Recurse through directories to find all files matching extensions.
 * @param {string} dir
 * @param {string[]} extensions
 * @returns {string[]}
 */
function collectFiles(dir, extensions) {
  const files = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    if (
      ["node_modules", ".git", ".scannerwork", "dist", "build"].includes(entry)
    ) {
      continue;
    }

    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(fullPath, extensions));
      continue;
    }

    if (extensions.some((ext) => fullPath.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = [
  ...ROOTS.flatMap((root) => collectFiles(root, [".js", ".mjs"])),
  ...EXTRA_FILES,
];

let hasError = false;

console.log(`Checking syntax for ${files.length} files...`);

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(`❌ Syntax error in ${file}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log("✅ All files have valid syntax.");
