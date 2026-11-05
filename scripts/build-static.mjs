// Builds the static site for Vercel from the canonical page public/site.html.
// Output: dist-static/ (index.html = exact copy of site.html, plus its CSS/JS/assets).
import { cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";

const src = "public";
const out = "dist-static";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

copyFileSync(`${src}/site.html`, `${out}/index.html`);
copyFileSync(`${src}/site.html`, `${out}/site.html`);
for (const f of ["site.css", "site.js", "site-effects.css", "site-effects.js", "favicon.ico", "robots.txt"]) {
  if (existsSync(`${src}/${f}`)) copyFileSync(`${src}/${f}`, `${out}/${f}`);
}
cpSync(`${src}/assets`, `${out}/assets`, { recursive: true });

const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
if (hash(`${src}/site.html`) !== hash(`${out}/index.html`)) throw new Error("index.html differs from site.html");

// Fail the build if the page references a local file that is missing.
const html = readFileSync(`${src}/site.html`, "utf8");
const refs = [...html.matchAll(/(?:src|href|data-before-src|data-after-src)="([^"#:]+)"/g)].map((m) => m[1]).filter(Boolean);
const missing = refs.filter((r) => !existsSync(`${out}/${r}`));
if (missing.length) throw new Error("Missing files: " + missing.join(", "));
console.log(`Static site ready in ${out}/ (${refs.length} local references OK)`);
