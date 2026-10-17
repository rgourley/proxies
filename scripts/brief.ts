// Write one prompt file per proxy for one round of a run. A proxy reads only its prompt file and the paths it names.
// Usage: node scripts/brief.ts <run> <round> [--wordy] [--dissenter <handle>]
// <round> is a round folder name such as "01-attacks" or "02-rebuttal", or "decision" for the owner's ruling in a meeting.
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, RUNS_DIR, parse, text, list, readOrg } from "./lib.ts";
import type { Frontmatter, Org } from "./lib.ts";

// Each round name maps to the format section that holds its instructions. A round with no entry uses the whole format.
const ROUND_SECTIONS: ReadonlyMap<string, string> = new Map([
  ["attacks", "One round, in parallel"],
  ["premortem", "Premortem framing"],
  ["blind", "Round 1: blind review"],
  ["rebuttal", "Round 2: rebuttal"],
  ["decision", "Round 3: decision"],
  ["ideas", "Round 1: ideas"],
  ["build", "Round 2: build and challenge"],
  ["vote", "Round 3: vote"],
]);

// These rounds give each proxy the responses of an earlier round as transcripts.
const TRANSCRIPT_OF: ReadonlyMap<string, string> = new Map([
  ["rebuttal", "blind"],
  ["build", "ideas"],
]);

type Section = { heading: string; body: string };

type Run = { id: string; dir: string; fields: Frontmatter; metaFile: string; org: Org; format: string };

function sections(markdown: string): Section[] {
  return markdown
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split("\n");
      return { heading: heading.trim(), body: rest.join("\n").trim() };
    });
}

// The FORMAT block holds the round's section, then the Verdict and Language sections. Other rounds' sections and the Facilitator section are left out.
function formatBlock(format: string, round: string, wordy: boolean): string {
  const file = join(ROOT, "formats", `${format}.md`);
  if (!existsSync(file)) throw new Error(`No format file: ${file}`);
  const source = readFileSync(file, "utf8");
  const all = sections(source);
  const shared = all.filter((s) => s.heading === "Verdict" || s.heading === "Language");
  const wanted = ROUND_SECTIONS.get(round);
  let parts: Section[];
  if (wanted) {
    const own = all.find((s) => s.heading.startsWith(wanted));
    if (!own) throw new Error(`formats/${format}.md has no section that starts with "${wanted}" for round "${round}"`);
    parts = [own, ...shared];
  } else {
    const intro = source.split(/^## /m)[0].replace(/^# .*\n/, "").trim();
    parts = [{ heading: "Instructions", body: intro }, ...all.filter((s) => s.heading !== "Facilitator")];
  }
  const block = parts.map((s) => `## ${s.heading}\n${s.body}`).join("\n\n");
  return wordy ? block.replace(/Aim for about[^.]*\.\s*/g, "") : block;
}

function readRun(id: string): Run {
  const dir = join(RUNS_DIR, id);
  const metaFile = join(dir, "meta.md");
  if (!existsSync(metaFile)) throw new Error(`No run named ${id} in runs/`);
  const { fields } = parse(readFileSync(metaFile, "utf8"), metaFile);
  const org = readOrg(text(fields, "org", metaFile));
  return { id, dir, fields, metaFile, org, format: text(fields, "format", metaFile) };
}

function nameLine(org: Org, handle: string): string {
  const p = org.proxies.find((x) => x.handle === handle);
  if (!p) throw new Error(`Unknown handle "${handle}" in org ${org.id}`);
  return `${p.name} (${p.pronouns}), ${p.title}`;
}

function contextBlock(run: Run): string {
  const id = run.fields.get("context");
  if (typeof id !== "string") return "";
  const dir = join(ROOT, "knowledge", id);
  if (!existsSync(join(dir, "index.md"))) throw new Error(`Context "${id}" in ${run.metaFile} has no knowledge/${id}/index.md`);
  return `CONTEXT\n${join(dir, "index.md")}\n${join(dir, "sources")}/\n\n`;
}

// The artifact block names the artifact, the screen description when there is one, and the screenshot folder.
function artifactBlock(run: Run, images: boolean): string {
  const artifact = join(run.dir, text(run.fields, "artifact", run.metaFile));
  if (!existsSync(artifact)) throw new Error(`Artifact not found: ${artifact}`);
  const screens = join(run.dir, "input", "screens");
  const description = join(run.dir, "input", "screens.md");
  const lines = [artifact];
  if (existsSync(screens)) {
    if (!images && !existsSync(description)) throw new Error(`${run.id} has screenshots but no input/screens.md. Run the describer first, or pass --images`);
    if (!images) lines.push(`Screen description (read this instead of the screenshots): ${description}`);
    lines.push(images ? `Screenshots: the "screens/" paths in the artifact map to ${screens}/` : `Screenshots, only when a point depends on how a screen looks: ${screens}/`);
  }
  return `ARTIFACT\n${lines.join("\n")}\n${text(run.fields, "question", run.metaFile)}\n\n`;
}

// With --wordy, the owner in the decision round gets every round 1 response in full, not only the verdict lines.
function transcriptsBlock(run: Run, round: string, handle: string, wordy: boolean): string {
  const roundNumber = (r: string): string => readdirSync(run.dir).find((f) => f.endsWith(`-${r}`)) ?? "";
  const earlier = TRANSCRIPT_OF.get(round);
  if (earlier) {
    const folder = roundNumber(earlier);
    if (!folder) throw new Error(`Round "${round}" needs the "${earlier}" round, but ${run.id} has no *-${earlier} folder`);
    const files = readdirSync(join(run.dir, folder)).filter((f) => f.endsWith(".md")).sort();
    const lines = files.map((f) => {
      const h = f.replace(/\.md$/, "");
      return `- ${nameLine(run.org, h)}${h === handle ? " (you)" : ""} said: ${join(run.dir, folder, f)}`;
    });
    return `TRANSCRIPTS\nRead every response below.\n${lines.join("\n")}\n\n`;
  }
  if (round === "decision") {
    const blind = roundNumber("blind");
    const rebuttal = roundNumber("rebuttal");
    if (!blind || !rebuttal) throw new Error(`The decision round needs blind and rebuttal rounds in ${run.id}`);
    const others = readdirSync(join(run.dir, blind)).filter((f) => f.endsWith(".md") && f !== `${handle}.md`).sort();
    const verdicts = others.map((f) => {
      if (wordy) return `- ${nameLine(run.org, f.replace(/\.md$/, ""))}, round 1: ${join(run.dir, blind, f)}`;
      const line = readFileSync(join(run.dir, blind, f), "utf8").match(/^\*\*Verdict\*\*:.*$/m)?.[0] ?? "(no verdict line)";
      return `- ${nameLine(run.org, f.replace(/\.md$/, ""))}, round 1: ${line}`;
    });
    const rebuttals = readdirSync(join(run.dir, rebuttal)).filter((f) => f.endsWith(".md")).sort()
      .map((f) => `- ${nameLine(run.org, f.replace(/\.md$/, ""))}, round 2: ${join(run.dir, rebuttal, f)}`);
    return `TRANSCRIPTS\nYour own round 1 response: ${join(run.dir, blind, `${handle}.md`)}\n${verdicts.join("\n")}\nRead every round 2 response:\n${rebuttals.join("\n")}\n\n`;
  }
  if (round === "vote") {
    const ideas = join(run.dir, "ideas.md");
    if (!existsSync(ideas)) throw new Error(`The vote round needs the facilitator's idea list at ${ideas}`);
    return `TRANSCRIPTS\nThe ideas to rank: ${ideas}\n\n`;
  }
  if (run.format === "followup") {
    const prev = join(run.dir, "previous.txt");
    if (!existsSync(prev)) throw new Error(`A followup run needs previous.txt in ${run.id}`);
    const prevDir = join(ROOT, readFileSync(prev, "utf8").trim());
    const own = readdirSync(prevDir).filter((f) => /^\d+-/.test(f)).sort().map((f) => join(prevDir, f, `${handle}.md`)).filter(existsSync);
    return `TRANSCRIPTS\n## You said earlier:\n${own.join("\n")}\n\n`;
  }
  return "";
}

// A meeting's decision round runs only the owner. Every other round runs every attendee.
function attendeesFor(run: Run, round: string): string[] {
  if (round === "decision") return [text(run.fields, "owner", run.metaFile)];
  return list(run.fields, "attendees", run.metaFile);
}

function outputPath(run: Run, roundFolder: string, handle: string): string {
  return roundFolder === "decision" ? join(run.dir, "decision.md") : join(run.dir, roundFolder, `${handle}.md`);
}

function main(): void {
  const args = process.argv.slice(2);
  const [id, roundArg] = args;
  if (!id || !roundArg) throw new Error("Usage: node scripts/brief.ts <run> <round> [--wordy] [--dissenter <handle>] [--images]");
  const wordy = args.includes("--wordy");
  const images = args.includes("--images");
  const dissenter = args.includes("--dissenter") ? args[args.indexOf("--dissenter") + 1] : null;
  const run = readRun(id);
  const round = roundArg.replace(/^\d+-/, "");
  if (round !== "decision") mkdirSync(join(run.dir, roundArg), { recursive: true });
  const promptDir = join(run.dir, "prompts", roundArg);
  mkdirSync(promptDir, { recursive: true });
  const handles = attendeesFor(run, round);
  for (const handle of handles) {
    let identity = execFileSync("node", [join(ROOT, "scripts", "identity.ts"), run.org.id, handle], { encoding: "utf8" }).trim();
    if (dissenter === handle) {
      identity = identity.replace(/\nPROXY\n---\n/, "\nPROXY\nYou are the designated dissenter. Hold your position unless someone directly answers your block condition.\n---\n");
    }
    const prompt = [
      identity,
      `\n\nFORMAT\n${formatBlock(run.format, round, wordy)}\n\n`,
      contextBlock(run),
      artifactBlock(run, images),
      transcriptsBlock(run, round, handle, wordy),
      `OUTPUT\nWrite your full response to ${outputPath(run, roundArg, handle)} with the Write tool. Start it with the line "# ${nameLine(run.org, handle).replace(/ \([^)]*\)/, "")}". Then reply with only your verdict line, or "Done" if the format has no verdict.\n`,
    ].join("");
    writeFileSync(join(promptDir, `${handle}.md`), prompt);
  }
  console.log(`Wrote ${handles.length} prompts to runs/${id}/prompts/${roundArg}/`);
  for (const handle of handles) console.log(`${handle}: ${join(promptDir, `${handle}.md`)}`);
}

main();
