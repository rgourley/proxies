// Check every run folder for problems before the results page shows it. Errors stop the check. Warnings do not.
// Usage: node scripts/check.ts [run...]
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { KNOWLEDGE_DIR, RUNS_DIR, formatFile, parse, readOrgs } from "./lib.ts";
import type { Org } from "./lib.ts";

type Problem = { level: "error" | "warning"; run: string; message: string };

// These formats have no verdict line in their responses.
const NO_VERDICT = new Set(["workshop", "ask", "talk"]);

const REQUIRED = ["org", "format", "date", "sequence", "title", "artifact", "attendees"] as const;

// A quote of this many characters or more in a summary must appear word for word in a response or the artifact.
const QUOTE_MIN = 25;

function checkRun(id: string, orgs: Org[]): Problem[] {
  const problems: Problem[] = [];
  const add = (level: Problem["level"], message: string): void => { problems.push({ level, run: id, message }); };
  const dir = join(RUNS_DIR, id);
  const metaFile = join(dir, "meta.md");
  const { fields } = parse(readFileSync(metaFile, "utf8"), metaFile);
  for (const field of REQUIRED) if (!fields.has(field)) add("error", `meta.md has no "${field}"`);
  const org = orgs.find((o) => o.id === fields.get("org"));
  if (!org) { add("error", `meta.md names unknown org "${String(fields.get("org"))}"`); return problems; }
  const format = String(fields.get("format") ?? "");
  if (!existsSync(formatFile(format))) add("error", `No format file for "${format}"`);
  const attendees = Array.isArray(fields.get("attendees")) ? (fields.get("attendees") as string[]) : [];
  const handles = new Set(org.proxies.map((p) => p.handle));
  for (const h of attendees) if (!handles.has(h)) add("error", `Attendee "${h}" is not a proxy in ${org.id}`);
  const context = fields.get("context");
  if (typeof context === "string" && !existsSync(join(KNOWLEDGE_DIR, context, "index.md"))) add("error", `Context "${context}" has no knowledge/${context}/index.md`);
  if (format === "meeting" && typeof fields.get("owner") !== "string") add("error", `A meeting needs "owner" in meta.md`);

  // The artifact, and every screenshot it names.
  const artifactPath = String(fields.get("artifact") ?? "");
  const artifactFile = join(dir, artifactPath);
  const artifact = existsSync(artifactFile) ? readFileSync(artifactFile, "utf8") : "";
  if (!artifact) add("error", `Artifact not found: ${artifactPath}`);
  const shots = [...artifact.matchAll(/^Screenshot:\s*(\S+\.png)/gm)].map((m) => m[1]);
  for (const s of shots) if (!existsSync(join(dir, "input", s))) add("error", `Screenshot named in the artifact is missing: input/${s}`);
  if (shots.length > 0 && !existsSync(join(dir, "input", "screens.md"))) add("warning", `Has ${shots.length} screenshots but no input/screens.md, so proxies read the images`);

  // Every response: a known handle, a title line, and a verdict line where the format needs one.
  const rounds = readdirSync(dir).filter((f) => /^\d+-/.test(f) && statSync(join(dir, f)).isDirectory()).sort();
  const responses: string[] = [];
  for (const round of rounds) {
    for (const f of readdirSync(join(dir, round)).filter((x) => x.endsWith(".md"))) {
      const handle = f.replace(/\.md$/, "");
      const body = readFileSync(join(dir, round, f), "utf8");
      responses.push(body);
      if (!handles.has(handle)) add("error", `${round}/${f} is not named after a proxy in ${org.id}`);
      if (!body.startsWith("# ")) add("warning", `${round}/${f} does not start with a "# Name, Title" line`);
      if (!NO_VERDICT.has(format) && !/^\*\*Verdict\*\*:\s*(Block|Rework|Ship with changes|Ship)\b/m.test(body)) add("error", `${round}/${f} has no valid verdict line`);
    }
    const missing = attendees.filter((h) => !existsSync(join(dir, round, `${h}.md`)));
    if (missing.length > 0) add("warning", `${round} has no response from ${missing.join(", ")}`);
  }

  // The summary, and every long quote in it.
  const summaryFile = join(dir, "summary.md");
  if (!existsSync(summaryFile)) {
    add("warning", "No summary.md yet, so the page shows the run as in progress");
  } else {
    // Quotes are compared without case, so a quote that starts mid-sentence still matches.
    const sources = [...responses, artifact, existsSync(join(dir, "decision.md")) ? readFileSync(join(dir, "decision.md"), "utf8") : ""].join("\n").replace(/\s+/g, " ").toLowerCase();
    const summary = readFileSync(summaryFile, "utf8");
    const quotes = [...summary.matchAll(/"([^"\n]+)"/g)].map((m) => m[1]).filter((q) => q.length >= QUOTE_MIN);
    for (const q of quotes) if (!sources.includes(q.replace(/\s+/g, " ").toLowerCase())) add("warning", `summary.md quotes text that no response contains: "${q.slice(0, 70)}${q.length > 70 ? "…" : ""}"`);
    const named = org.proxies.filter((p) => new RegExp(`\\b${p.name}\\b`).test(summary) && !attendees.includes(p.handle));
    for (const p of named) add("warning", `summary.md names ${p.name}, who did not attend this run`);
  }
  return problems;
}

function main(): void {
  const only = process.argv.slice(2);
  const orgs = readOrgs();
  const ids = (only.length > 0 ? only : readdirSync(RUNS_DIR)).filter((d) => existsSync(join(RUNS_DIR, d, "meta.md"))).sort();
  const problems = ids.flatMap((id) => checkRun(id, orgs));
  for (const p of problems) console.log(`${p.level === "error" ? "ERROR  " : "warning"}  ${p.run}: ${p.message}`);
  const errors = problems.filter((p) => p.level === "error").length;
  console.log(`Checked ${ids.length} runs: ${errors} errors, ${problems.length - errors} warnings`);
  if (errors > 0) process.exit(1);
}

main();
