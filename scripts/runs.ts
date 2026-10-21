// Build the runs page from every runs/<run>/meta.md and the proxy output files in that run.
// Each proxy name links to that proxy's card on the cards page and shows a short preview on hover.
// The script writes runs.html for local use and runs.artifact.html for the Artifact publisher.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { COPY_SCRIPT, DECISION_LABEL, FAVICON, LOGO, avatarSprite, PROXY_SCRIPT, FONTS, KNOWLEDGE_DIR, PROJECT, RUNS_DIR, TOKENS, cardId, decisionPill, esc, face, list, localDocument, parse, readOrgs, seatColor, seatPill, sidebar, text } from "./lib.ts";
import type { Frontmatter, Org, Proxy } from "./lib.ts";
import { orgBundle } from "./bundle.ts";
import { card, CARD_CSS } from "./card.ts";

type Verdict = "block" | "rework" | "ship-with-changes" | "ship";

type Output = { proxy: Proxy; markdown: string; verdict: Verdict | null; critical: number; high: number };

const VERDICT_ORDER: readonly Verdict[] = ["block", "rework", "ship-with-changes", "ship"];
const VERDICT_LABEL: ReadonlyMap<Verdict, string> = new Map([
  ["block", "Block"],
  ["rework", "Rework"],
  ["ship-with-changes", "Ship with changes"],
  ["ship", "Ship"],
]);

// Each response starts with "**Verdict**: <word>." An output without that line has no verdict, and the page shows none.
function verdictOf(markdown: string): Verdict | null {
  const match = markdown.match(/\*\*Verdict\*\*:\s*([A-Za-z ]+?)\./);
  if (!match) return null;
  const id = match[1].trim().toLowerCase().replace(/\s+/g, "-");
  return VERDICT_ORDER.find((v) => v === id) ?? null;
}

function severityCount(markdown: string, level: string): number {
  return (markdown.match(new RegExp(`\\*\\*Severity:?\\*\\*:?\\s*${level}`, "gi")) ?? []).length;
}

function readOutput(proxy: Proxy, markdown: string): Output {
  return { proxy, markdown, verdict: verdictOf(markdown), critical: severityCount(markdown, "critical"), high: severityCount(markdown, "high") };
}

function verdictRank(o: Output): number {
  return o.verdict ? VERDICT_ORDER.indexOf(o.verdict) : VERDICT_ORDER.length;
}

type Source = { title: string; url: string };

// Context is one knowledge collection that every proxy in the run reads before the review.
type Context = { id: string; name: string; sources: Source[] };

type Round = { id: string; label: string; note: string; outputs: Output[] };

type Run = {
  id: string;
  org: Org;
  format: string;
  date: string;
  title: string;
  nav: string;
  sequence: number;
  artifact: string;
  artifactSource: string;
  source: { url: string; label: string } | null;
  context: Context | null;
  attendees: Proxy[];
  summaries: { label: string; markdown: string }[];
  ownerDecision: { proxy: Proxy; markdown: string } | null;
  rounds: Round[];
};

const OUT_LOCAL = join(PROJECT, "runs.html");
const OUT_ARTIFACT = join(PROJECT, "runs.artifact.html");

// The facilitator writes the summary of every run. It shows first.
const SUMMARY_FILE = "summary.md";

// The decision owner writes the decision at the end of a meeting, in the first proxy. The page names the owner above it.
const OWNER_DECISION_FILE = "decision.md";

// The owner is the "owner" handle in meta.md. A run without that field uses the attendee whose decision level is owner.
function ownerOf(fields: Frontmatter, attendees: Proxy[], org: Org, metaFile: string): Proxy | null {
  const handle = fields.get("owner");
  if (typeof handle === "string") return findProxy(org, handle, metaFile);
  return attendees.find((p) => p.decision === "owner") ?? null;
}

function readOwnerDecision(dir: string, owner: Proxy | null, metaFile: string): { proxy: Proxy; markdown: string } | null {
  const file = join(dir, OWNER_DECISION_FILE);
  if (!existsSync(file)) return null;
  if (!owner) throw new Error(`${OWNER_DECISION_FILE} exists but no decision owner is set. Add "owner" to ${metaFile}`);
  return { proxy: owner, markdown: readFileSync(file, "utf8") };
}

// Each round folder gets a plain name and one line that explains what the proxies did in that round.
const ROUND_NAMES: ReadonlyMap<string, { label: string; note: string }> = new Map([
  ["blind", { label: "First take", note: "Each proxy reviewed it alone, before they read anyone else." }],
  ["rebuttal", { label: "Response to the room", note: "Each proxy read every first take, then said who they agree with, who they push back on, and whether they changed their mind." }],
  ["attacks", { label: "Ways it breaks", note: "Each proxy tried to break it from their own seat." }],
  ["premortem", { label: "How it failed", note: "Each proxy imagined it had failed six months after launch, and told how from their own seat." }],
  ["prep", { label: "Questions to expect", note: "Each proxy's top questions for the real meeting, and the answers that satisfy them." }],
  ["followup", { label: "Did the revision answer them", note: "Each proxy checked their earlier objections against the new version." }],
  ["compare", { label: "Which version they pick", note: "Each proxy saw both versions in a random order and picked one." }],
  ["ideas", { label: "Ideas", note: "Each proxy proposed ideas alone, before they read anyone else's." }],
  ["build", { label: "Build and challenge", note: "Each proxy read every idea, built on two, challenged one, and added any new idea the room sparked." }],
  ["vote", { label: "Vote", note: "Each proxy ranked the ideas they would take forward." }],
]);

function roundName(folder: string): { label: string; note: string } {
  const key = folder.replace(/^\d+-/, "");
  return ROUND_NAMES.get(key) ?? { label: key.replace(/-/g, " "), note: "" };
}

function findProxy(org: Org, handle: string, where: string): Proxy {
  const proxy = org.proxies.find((p) => p.handle === handle);
  if (!proxy) throw new Error(`Unknown handle "${handle}" for org ${org.id} in ${where}`);
  return proxy;
}

// The run shows the file it reviewed. A missing file is an error, so a run never shows without its input.
function readArtifact(dir: string, path: string): string {
  const file = join(dir, path);
  if (!existsSync(file)) throw new Error(`Run artifact not found: ${file}`);
  return readFileSync(file, "utf8");
}

// A run can name where its artifact came from, such as a Notion page. Both fields are optional, but a url needs a label.
function sourceOf(fields: Map<string, string | string[]>, file: string): { url: string; label: string } | null {
  const url = fields.get("source");
  if (url === undefined) return null;
  const label = fields.get("source_label");
  if (typeof url !== "string" || typeof label !== "string") throw new Error(`"source" needs a "source_label" in ${file}`);
  return { url, label };
}

// A knowledge collection has an index and a sources folder. Each source starts with "# Title" and a "Source: <url>" line.
function readContext(id: string): Context {
  const dir = join(KNOWLEDGE_DIR, id);
  const indexFile = join(dir, "index.md");
  if (!existsSync(indexFile)) throw new Error(`Knowledge collection not found: ${indexFile}`);
  const { fields } = parse(readFileSync(indexFile, "utf8"), indexFile);
  const sourceDir = join(dir, "sources");
  const sources = existsSync(sourceDir)
    ? readdirSync(sourceDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map((f) => {
          const textBody = readFileSync(join(sourceDir, f), "utf8");
          const title = textBody.match(/^# (.+)$/m)?.[1]?.trim() ?? f;
          const url = textBody.match(/^Source:\s*(\S+)/m)?.[1] ?? "";
          return { title, url };
        })
    : [];
  return { id, name: text(fields, "name", indexFile), sources };
}

function readRun(id: string, orgs: Org[]): Run {
  const dir = join(RUNS_DIR, id);
  const metaFile = join(dir, "meta.md");
  const { fields } = parse(readFileSync(metaFile, "utf8"), metaFile);
  const orgId = text(fields, "org", metaFile);
  const org = orgs.find((o) => o.id === orgId);
  if (!org) throw new Error(`Run ${id} names unknown org "${orgId}"`);
  const summaries = existsSync(join(dir, SUMMARY_FILE)) ? [{ label: "Summary", markdown: readFileSync(join(dir, SUMMARY_FILE), "utf8") }] : [];
  const attendees = list(fields, "attendees", metaFile).map((h) => findProxy(org, h, metaFile));
  const rounds = readdirSync(dir)
    .filter((f) => /^\d+-/.test(f) && statSync(join(dir, f)).isDirectory())
    .sort()
    .map((folder) => ({
      id: folder,
      ...roundName(folder),
      outputs: readdirSync(join(dir, folder))
        .filter((f) => f.endsWith(".md"))
        .map((f) => readOutput(findProxy(org, f.replace(/\.md$/, ""), `${id}/${folder}`), readFileSync(join(dir, folder, f), "utf8")))
        .sort((a, b) => verdictRank(a) - verdictRank(b) || b.critical - a.critical || b.high - a.high || a.proxy.name.localeCompare(b.proxy.name)),
    }));
  return {
    id,
    org,
    format: text(fields, "format", metaFile),
    date: text(fields, "date", metaFile),
    title: text(fields, "title", metaFile),
    nav: typeof fields.get("nav") === "string" ? String(fields.get("nav")) : text(fields, "title", metaFile).replace(/^[^:]+:\s*/, ""),
    sequence: Number(text(fields, "sequence", metaFile)),
    artifact: text(fields, "artifact", metaFile),
    artifactSource: readArtifact(dir, text(fields, "artifact", metaFile)),
    source: sourceOf(fields, metaFile),
    context: typeof fields.get("context") === "string" ? readContext(String(fields.get("context"))) : null,
    attendees,
    summaries,
    ownerDecision: readOwnerDecision(dir, ownerOf(fields, attendees, org, metaFile), metaFile),
    rounds,
  };
}

function preview(proxy: Proxy): string {
  return `<span class="pop" role="tooltip">
    <span class="pop-body">
      <span class="pop-row">${seatPill(proxy.seat)}${decisionPill(proxy.decision)}</span>
      <span class="pop-head"><span class="pop-avatar" aria-hidden="true">${face(proxy)}</span><span class="pop-who"><span class="pop-name">${esc(proxy.name)}</span><span class="pop-title">${esc(proxy.title)}</span></span></span>
      <span class="pop-quote">${esc(proxy.quote)}</span>
      <span class="pop-label">Hard lines</span>
      ${proxy.hard_lines.map((h) => `<span class="pop-line">${esc(h)}</span>`).join("")}
      <span class="pop-open">Click to open the card</span>
    </span>
  </span>`;
}

function mention(proxy: Proxy, label: string): string {
  return `<span class="ref" style="--seat:${seatColor(proxy.seat)}"><a href="#${esc(cardId(proxy))}" data-proxy="${esc(cardId(proxy))}">${label}</a>${preview(proxy)}</span>`;
}

// The renderer handles the markdown that proxies and the facilitator write:
// headings, paragraphs, flat lists, pipe tables, bold, italics, and inline code.
function inline(source: string, org: Org): string {
  const formatted = esc(source)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");
  return linkNames(tagSeverity(formatted), org);
}

// A severity word becomes a colored tag in two places: a table cell that holds only the word, and the text after a "Severity" label.
const SEVERITY = /^(Critical|High|Medium|Low)$/i;

function severityTag(word: string): string {
  const w = esc(word);
  return `<span class="sev-tag sev-${w.toLowerCase()}">${w}</span>`;
}

function tagSeverity(html: string): string {
  return html.replace(/(<strong>Severity:?<\/strong>:?\s*)(Critical|High|Medium|Low)\b/gi, (_m: string, label: string, word: string) => `${label}${severityTag(word)}`);
}

function linkNames(html: string, org: Org): string {
  if (org.proxies.length === 0) return html;
  const byName = new Map(org.proxies.map((p) => [p.name, p]));
  const pattern = new RegExp(`\\b(${org.proxies.map((p) => p.name).join("|")})\\b`, "g");
  return html.replace(pattern, (name: string) => {
    const proxy = byName.get(name);
    return proxy ? mention(proxy, name) : name;
  });
}

function table(rows: string[], org: Org): string {
  const cells = (row: string): string[] => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const [head, , ...body] = rows;
  return `<div class="table-wrap"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c, org)}</th>`).join("")}</tr></thead><tbody>${body
    .map((r) => `<tr>${cells(r).map((c) => `<td>${SEVERITY.test(c) && c.split(" ").length === 1 ? severityTag(c) : inline(c, org)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function markdown(source: string, org: Org): string {
  // A heading line is always its own block, even with no blank line after it.
  const blocks = source.replace(/^(#{1,4} .*)$/gm, "\n$1\n").trim().split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const fence = block.match(/^```(\w*)\n([\s\S]*?)\n```$/);
      if (fence) return fence[1] === "mermaid" ? `<pre class="mermaid">${esc(fence[2])}</pre>` : `<pre class="code"><code>${esc(fence[2])}</code></pre>`;
      const lines = block.split("\n");
      const heading = block.match(/^(#{1,4})\s+(.*)$/);
      if (heading && lines.length === 1) {
        const level = Math.min(heading[1].length + 2, 6);
        return `<h${level}>${inline(heading[2], org)}</h${level}>`;
      }
      if (lines.length > 1 && lines.every((l) => l.trim().startsWith("|")) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[1])) return table(lines, org);
      if (lines.every((l) => /^\s*(?:[-*]|\d+\.)\s+/.test(l) || /^\s{2,}\S/.test(l))) {
        const ordered = /^\s*\d+\./.test(lines[0]);
        const items = block.split(/\n(?=\s*(?:[-*]|\d+\.)\s+)/).map((item) => item.replace(/^\s*(?:[-*]|\d+\.)\s+/, "").replace(/\s*\n\s*/g, " "));
        const tag = ordered ? "ol" : "ul";
        return `<${tag}>${items.map((i) => `<li>${inline(i, org)}</li>`).join("")}</${tag}>`;
      }
      return `<p>${inline(block.replace(/\s*\n\s*/g, " "), org)}</p>`;
    })
    .join("\n");
}

// Proxy output starts with "# Name, Title". The proxy header replaces that line.
function stripTitleLine(source: string): string {
  return source.replace(/^# .*\n+/, "");
}

// The avatar dot shows the proxy's verdict from the last round they answered: red for Block, amber for Rework, blue for Ship with changes, green for Ship.
function avatar(proxy: Proxy, verdict: Verdict | null): string {
  const label = verdict ? `${proxy.name}: ${VERDICT_LABEL.get(verdict)}` : proxy.name;
  const dot = verdict ? `<span class="status-dot v-${verdict}" aria-hidden="true"></span>` : "";
  return `<span class="ref avatar-ref" style="--seat:${seatColor(proxy.seat)}"><a class="avatar" href="#${esc(cardId(proxy))}" data-proxy="${esc(cardId(proxy))}" aria-label="${esc(label)}">${face(proxy)}${dot}</a>${preview(proxy)}</span>`;
}

function latestVerdicts(run: Run): Map<string, Verdict | null> {
  const verdicts = new Map<string, Verdict | null>();
  for (const round of run.rounds) for (const o of round.outputs) verdicts.set(o.proxy.handle, o.verdict);
  return verdicts;
}

function output(item: Output, org: Org): string {
  const p = item.proxy;
  const verdict = verdictWord(item.verdict);
  return `<details class="output" style="--seat:${seatColor(p.seat)}">
    <summary>
      <span class="status-icon ${item.verdict ? `v-${item.verdict}` : ""}" title="${esc(verdict)}" aria-label="${esc(verdict)}"></span>
      <span class="mono" aria-hidden="true">${face(p)}</span>
      <span class="out-who">${mention(p, esc(p.name))}<span class="out-title">${esc(p.title)}</span></span>
      <span class="out-stats">${item.critical > 0 ? `<span class="sev sev-critical">${item.critical} critical</span>` : ""}${item.high > 0 ? `<span class="sev sev-high">${item.high} high</span>` : ""}</span>
      <span class="verdict-text ${item.verdict ? `v-${item.verdict}` : ""}">${esc(verdict)}</span>
    </summary>
    <div class="md">${markdown(stripTitleLine(item.markdown), org)}</div>
  </details>`;
}

function tallyPills(round: Round): string {
  const counts = VERDICT_ORDER.map((v) => [v, round.outputs.filter((o) => o.verdict === v).length] as const).filter(([, n]) => n > 0);
  return counts.map(([v, n]) => `<span class="verdict v-${v}"><span class="pill-dot" aria-hidden="true"></span>${n} ${VERDICT_LABEL.get(v)}</span>`).join("");
}

function tally(round: Round): string {
  const pills = tallyPills(round);
  return pills ? `<p class="verdict-tally">${pills}</p>` : "";
}

// A thread is one proxy's responses across every round of a run, in round order.
type Thread = { proxy: Proxy; steps: { round: Round; output: Output }[] };

function threads(run: Run): Thread[] {
  const byHandle = new Map<string, Thread>();
  for (const round of run.rounds) {
    for (const o of round.outputs) {
      const prior = byHandle.get(o.proxy.handle);
      byHandle.set(o.proxy.handle, { proxy: o.proxy, steps: [...(prior?.steps ?? []), { round, output: o }] });
    }
  }
  const latest = (t: Thread): Output => t.steps[t.steps.length - 1].output;
  return [...byHandle.values()].sort((a, b) => verdictRank(latest(a)) - verdictRank(latest(b)) || a.proxy.name.localeCompare(b.proxy.name));
}

// A workshop response has no verdict, so the row shows no verdict text.
function verdictWord(verdict: Verdict | null): string {
  return verdict ? VERDICT_LABEL.get(verdict) ?? "" : "";
}

// The row shows the verdict in each round, so a reader sees who changed position without opening it.
function thread(t: Thread, org: Org): string {
  const p = t.proxy;
  const latest = t.steps[t.steps.length - 1].output.verdict;
  const changed = new Set(t.steps.map((s) => s.output.verdict)).size > 1;
  const path = t.steps.every((s) => s.output.verdict === null) ? "" : t.steps
    .map((s) => `<span class="verdict-text ${s.output.verdict ? `v-${s.output.verdict}` : ""}" title="${esc(s.round.label)}">${esc(verdictWord(s.output.verdict))}</span>`)
    .join(`<span class="arrow" aria-hidden="true">→</span>`);
  return `<details class="output thread" style="--seat:${seatColor(p.seat)}">
    <summary>
      <span class="status-icon ${latest ? `v-${latest}` : ""}" aria-hidden="true"></span>
      <span class="mono" aria-hidden="true">${face(p)}</span>
      <span class="out-who">${mention(p, esc(p.name))}<span class="out-title">${esc(p.title)}</span></span>
      ${changed ? `<span class="moved">Changed</span>` : ""}
      <span class="thread-path">${path}</span>
    </summary>
    ${t.steps.map((s) => `<div class="step"><p class="step-label">${esc(s.round.label)}</p>${s.round.note ? `<p class="step-note">${esc(s.round.note)}</p>` : ""}<div class="md">${markdown(stripTitleLine(s.output.markdown), org)}</div></div>`).join("\n")}
  </details>`;
}

function ownerDecisionBlock(d: { proxy: Proxy; markdown: string }, org: Org): string {
  const p = d.proxy;
  return `<article class="summary owner-decision" style="--seat:${seatColor(p.seat)}">
    <p class="owner-by"><span class="mono" aria-hidden="true">${face(p)}</span><span>Decision, written by ${mention(p, esc(p.name))}, ${esc(p.title)}</span></p>
    <div class="md">${markdown(stripTitleLine(d.markdown), org)}</div>
  </article>`;
}

function threadSection(run: Run): string {
  const proxies = threads(run);
  const order = run.rounds.map((r) => r.label).join(", then ");
  return `<section class="round"><h3 class="round-label">Each proxy's view<span>${proxies.length} proxies</span></h3>
  <p class="round-note">${esc(order)}. Open a proxy to read their rounds in order.</p>
  ${run.rounds.map((r) => `<p class="verdict-tally"><span class="tally-label">${esc(r.label)}</span>${tallyPills(r)}</p>`).join("\n")}
  <div class="list">${proxies.map((t) => thread(t, run.org)).join("\n")}</div></section>`;
}

// The overview chip names the reviewed doc and its source. Hover or focus shows the doc's first note and its diagram.
function overview(run: Run): string {
  const title = run.artifactSource.match(/^# (.+)$/m)?.[1] ?? run.artifact.split("/").pop() ?? run.artifact;
  const diagram = run.artifactSource.match(/```mermaid\n([\s\S]*?)\n```/)?.[1] ?? (run.artifact.endsWith(".mmd") ? run.artifactSource : "");
  const note = run.artifactSource.replace(/^# .*\n+/, "").split(/\n\s*\n/)[0]?.trim() ?? "";
  const source = run.source ? `<a class="ov-source" href="${esc(run.source.url)}" target="_blank" rel="noopener">${esc(run.source.label)} ↗</a>` : "";
  return `<span class="overview" tabindex="0">
    <span class="ov-label">Reviewed</span><span class="ov-title">${esc(title)}</span>${source}
    <span class="ov-pop" role="tooltip">
      <span class="ov-pop-title">${esc(title)}</span>
      ${note && !note.startsWith("```") ? `<span class="ov-pop-note">${esc(note)}</span>` : ""}
      ${diagram ? `<pre class="mermaid">${esc(diagram.trim())}</pre>` : ""}
    </span>
  </span>`;
}

// The context chip lists the sources of the run's context. Hover or focus shows each source as a link.
function contextChip(run: Run): string {
  if (!run.context) return "";
  const links = run.context.sources.map((s) => (s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>` : `<span>${esc(s.title)}</span>`)).join("");
  return `<span class="overview context" tabindex="0">
    <span class="ov-label">Context</span><span class="ov-title">${run.context.sources.length} docs</span>
    <span class="ov-pop" role="tooltip"><span class="ov-pop-title">${esc(run.context.name)}</span><span class="ov-pop-note">Every proxy in this run read these before reviewing.</span><span class="ctx-links">${links}</span></span>
  </span>`;
}

function attendeeRow(run: Run): string {
  const verdicts = latestVerdicts(run);
  const rank = (p: Proxy): number => {
    const v = verdicts.get(p.handle);
    return v ? VERDICT_ORDER.indexOf(v) : VERDICT_ORDER.length;
  };
  return [...run.attendees].sort((a, b) => rank(a) - rank(b)).map((p) => avatar(p, verdicts.get(p.handle) ?? null)).join("");
}

type Screen = { file: string; step: string; note: string };

type ScreenGroup = { label: string; screens: Screen[] };

// An artifact that lists "Screenshot: <path>.png" lines is a screen-by-screen prototype. The page shows those screens as a strip per use case.
// Each path is relative to the run's input folder. The local page and the published artifact use the same paths.
function inputDir(run: Run): string {
  return `runs/${run.id}/input/`;
}

function screenGroups(source: string): ScreenGroup[] {
  const groups: ScreenGroup[] = [];
  for (const block of source.split(/^## /m).slice(1)) {
    const [label, ...rest] = block.split("\n");
    const screens = rest.join("\n").split(/^### /m).slice(1).flatMap((step) => {
      const file = step.match(/^Screenshot:\s*(\S+\.png)/m)?.[1];
      if (!file) return [];
      return [{ file, step: step.split("\n")[0].trim(), note: step.match(/^What happens:\s*(.*)$/m)?.[1] ?? "" }];
    });
    if (screens.length > 0) groups.push({ label: label.trim(), screens });
  }
  return groups;
}

function gallery(run: Run): string {
  const imgBase = inputDir(run);
  const groups = screenGroups(run.artifactSource);
  if (groups.length === 0) return "";
  const total = groups.reduce((n, g) => n + g.screens.length, 0);
  return `<details class="gallery"><summary><span class="section-label">Screens they reviewed</span><span class="gallery-count">${total} screens</span></summary>
  ${groups
    .map((g) => `<div class="gallery-group"><p class="gallery-label">${esc(g.label)}</p><div class="gallery-strip">${g.screens
      .map((sc) => `<button type="button" class="thumb" data-image="${esc(imgBase + sc.file)}" data-caption="${esc(`${g.label}, ${sc.step}. ${sc.note}`)}"><img src="${esc(imgBase + sc.file)}" alt="${esc(`${g.label}, ${sc.step}`)}" loading="lazy" width="240" height="150"><span>${esc(sc.step)}</span></button>`)
      .join("")}</div></div>`)
    .join("")}
</details>`;
}

// A run is in progress until the facilitator writes its summary or the owner writes the decision.
function inProgress(run: Run): boolean {
  return run.summaries.length === 0 && run.ownerDecision === null;
}

function progressBanner(run: Run): string {
  const round = run.rounds[run.rounds.length - 1];
  const answered = round ? round.outputs.length : 0;
  const stage = round ? ` in ${round.label.toLowerCase()}` : "";
  return `<p class="in-progress" role="status"><span class="spinner" aria-hidden="true"></span>In progress. ${answered} of ${run.attendees.length} proxies have answered${esc(stage)}. The summary appears here when the run finishes.</p>`;
}

function runSection(run: Run): string {
  return `<section class="run" id="${esc(run.id)}">
  <header class="run-head">
    <p class="eyebrow"><span class="format">${esc(run.format)}</span><span>${esc(run.date)}</span><span class="sep" aria-hidden="true"></span><a href="#" class="org-link" data-proxy="org-${esc(run.org.id)}">${esc(run.org.name)}</a></p>
    <h1 class="page-title">${esc(run.title)}</h1>
    <div class="run-meta">
      ${overview(run)}
      ${contextChip(run)}
      <div class="attendees">${attendeeRow(run)}</div>
    </div>
  </header>
  ${gallery(run)}
  ${inProgress(run) ? progressBanner(run) : ""}
  <div class="run-main">
  ${run.summaries.map((s) => `<article class="summary"><p class="file">${esc(s.label)}</p><div class="md">${markdown(s.markdown, run.org)}</div></article>`).join("\n")}
  ${run.ownerDecision ? ownerDecisionBlock(run.ownerDecision, run.org) : ""}
  ${run.rounds.length > 1 ? threadSection(run) : run.rounds
    .map((r) => `<section class="round"><h3 class="round-label">${esc(r.label)}<span>${r.outputs.length} ${r.outputs.length === 1 ? "response" : "responses"}</span></h3>${r.note ? `<p class="round-note">${esc(r.note)}</p>` : ""}${tally(r)}<div class="list">${r.outputs.map((o) => output(o, run.org)).join("\n")}</div></section>`)
    .join("\n")}
  </div>
</section>`;
}

const STYLE = `${TOKENS}
.top { display: grid; gap: 6px; }
.run { scroll-margin-top: 16px; }
.run[hidden] { display: none; }
.run-head .page-title { font-size: 26px; text-wrap: balance; }
.run-main { min-width: 0; max-width: 960px; }
pre.code { background: var(--panel); border-radius: 6px; padding: 12px; overflow-x: auto; font: 12.5px/1.5 var(--font-mono); }
.in-progress { display: flex; align-items: center; gap: 10px; margin: 20px 0 0; padding: 12px 14px; border: 1px solid var(--rule-2); border-radius: 8px; background: var(--panel); font-size: 14px; color: var(--ink-2); }
.spinner { flex: none; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--rule-2); border-top-color: var(--accent); animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
.run-head { display: grid; gap: 10px; padding-bottom: 20px; border-bottom: 1px solid var(--rule); }
.eyebrow { margin: 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font: 12.5px var(--font-mono); color: var(--muted); }
.format { font: 500 11.5px var(--font-body); padding: 2px 8px; border-radius: 4px; color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent); text-transform: capitalize; }
.sep { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }
.run-head h1 { margin: 0; font: 600 22px/1.3 var(--font-display); letter-spacing: -0.01em; text-wrap: balance; }
.attendees { display: flex; flex-wrap: wrap; gap: 3px; }
.run-meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 20px; }
.overview { position: relative; display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 5px 10px; border: 1px solid var(--rule-2); border-radius: 8px; background: var(--card); font-size: 13.5px; cursor: default; max-width: 100%; }
.ov-label { font: 500 11px var(--font-body); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.ov-title { font-weight: 500; }
.ov-source { color: var(--accent); text-decoration: none; font-size: 13px; }
.ov-source:hover { text-decoration: underline; }
.ov-pop { visibility: hidden; opacity: 0; position: absolute; z-index: 20; top: calc(100% + 8px); left: 0; width: min(520px, 86vw); max-height: 70vh; overflow: auto; padding: 14px; display: grid; gap: 10px; background: var(--card); border: 1px solid var(--rule-2); border-radius: 10px; box-shadow: 0 16px 40px rgba(0,0,0,.18); transition: opacity .12s; }
.overview:hover .ov-pop, .overview:focus-within .ov-pop { visibility: visible; opacity: 1; }
.ov-pop-title { font: 600 15px var(--font-display); }
.ctx-links { display: grid; gap: 4px; }
.ctx-links a { color: var(--accent); text-decoration: none; font-size: 13.5px; }
.ctx-links a:hover { text-decoration: underline; }
.run-meta .overview + .overview { margin-left: 0; }
.ov-pop-note { color: var(--ink-2); font-size: 13.5px; }
.ov-pop pre.mermaid { margin: 0; background: var(--panel); border-radius: 6px; padding: 10px; font: 11.5px/1.45 var(--font-mono); white-space: pre-wrap; text-align: center; }
.avatar { position: relative; display: block; width: 30px; height: 30px; border-radius: 50%; text-decoration: none; }
.avatar svg, .mono svg, .nav-avatar svg { display: block; width: 100%; height: 100%; }
.summary { margin-top: 20px; padding: 4px 0 8px; }
.summary .md { font-size: 15px; line-height: 1.65; }
.summary .md h3 { margin-top: 28px; font: 600 18px/1.3 var(--font-display); letter-spacing: -0.01em; }
.summary .md h3:first-child { margin-top: 0; }
.file { margin: 0 0 12px; font: 600 12px var(--font-body); color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
.owner-decision { margin-top: 28px; padding: 16px 20px 12px; border: 1px solid var(--rule-2); border-left: 3px solid var(--seat); border-radius: 8px; background: var(--card); }
.owner-by { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font: 500 13.5px var(--font-body); color: var(--ink-2); }
.round { margin-top: 32px; display: grid; gap: 10px; }
.round-label { margin: 0; font: 600 13px var(--font-body); color: var(--ink); display: flex; gap: 8px; align-items: baseline; }
.round-label span { font: 12.5px var(--font-body); color: var(--muted); text-transform: none; }
.round-note { margin: -4px 0 0; font-size: 13.5px; color: var(--ink-2); }
.tally-label { flex: none; min-width: 168px; font: 500 12.5px var(--font-body); color: var(--ink-2); align-self: center; }
.thread-path { flex: none; display: flex; align-items: center; gap: 6px; }
.thread-path .verdict-text { width: auto; }
.thread-path .arrow { color: var(--muted); font-size: 12px; }
.moved { flex: none; font: 500 11.5px var(--font-body); padding: 1px 7px; border-radius: 4px; color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
.thread .step { padding: 4px 12px 8px 70px; max-width: 80ch; }
.thread .step + .step { border-top: 1px dashed var(--rule); }
.step-label { margin: 14px 0 2px; font: 600 13px var(--font-body); color: var(--ink); }
.step-note { margin: 0 0 6px; font-size: 12.5px; color: var(--muted); }
.thread .step .md { padding: 0; }
@media (max-width: 640px) { .thread .step { padding-left: 12px; } .tally-label { min-width: 0; width: 100%; } .out-title { display: none; } }
.list { border-top: 1px solid var(--rule); }
.output { border-bottom: 1px solid var(--rule); }
.output summary { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 6px 8px; cursor: pointer; list-style: none; border-radius: 6px; }
.output summary::-webkit-details-marker { display: none; }
.output summary:hover { background: var(--hover); }
.output summary::after { content: ""; flex: none; width: 6px; height: 6px; border-right: 1.5px solid var(--muted); border-bottom: 1.5px solid var(--muted); transform: rotate(-45deg); margin: 0 4px; transition: transform .12s; }
.output[open] summary::after { transform: rotate(45deg); }
.status-icon { flex: none; width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--c, var(--muted)); --c: var(--muted); background: radial-gradient(circle, var(--c) 0 3px, transparent 3.5px); }
.status-icon.v-block { background: var(--c); box-shadow: inset 0 0 0 2px var(--bg); }
.mono { flex: none; display: block; width: 26px; height: 26px; border-radius: 50%; }
.out-who { display: flex; align-items: baseline; gap: 8px; min-width: 0; flex: 1; overflow: hidden; }
.out-who > .ref { font-weight: 500; font-size: 14px; flex: none; }
.out-who > .ref > a { text-decoration: none; }
.out-who > .ref > a:hover { text-decoration: underline; }
.out-title { color: var(--muted); font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.out-stats { flex: none; display: flex; gap: 8px; font: 12px var(--font-mono); color: var(--muted); }
.verdict-text { flex: none; width: 128px; font: 500 13px var(--font-body); color: var(--c, var(--muted)); }
.output .md { padding: 8px 12px 20px 70px; max-width: 80ch; }
.sev-tag { display: inline-block; padding: 1px 7px; border-radius: 4px; font: 500 12px var(--font-body); white-space: nowrap; --c: var(--muted); color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent); border: 1px solid color-mix(in srgb, var(--c) 30%, transparent); }
.sev-tag.sev-critical { --c: var(--negative); }
.sev-tag.sev-high { --c: var(--warning); }
.sev-tag.sev-medium { --c: var(--info); }
.sev-tag.sev-low { --c: var(--muted); }
.sev-critical { color: var(--negative); }
.sev-high { color: var(--warning); }
.verdict { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 4px; font: 500 12px var(--font-body); white-space: nowrap; --c: var(--muted); color: var(--c); background: color-mix(in srgb, var(--c) 10%, transparent); }
.v-block { --c: var(--negative); }
.v-rework { --c: var(--warning); }
.v-ship-with-changes { --c: var(--info); }
.v-ship { --c: var(--positive); }
.status-dot.v-rework, .status-icon.v-rework { --c: var(--caution); }
.verdict-tally { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; }
.status-dot { position: absolute; right: -4px; bottom: -4px; width: 12px; height: 12px; border-radius: 50%; background: var(--c); border: 2px solid var(--bg); }
@media (max-width: 700px) { .out-title, .out-stats { display: none; } .verdict-text { width: auto; } .output .md { padding-left: 12px; } }
.md { min-width: 0; font-size: 14.5px; }
.md > :first-child { margin-top: 0; }
.md > :last-child { margin-bottom: 0; }
.md h3, .md h4, .md h5, .md h6 { margin: 20px 0 8px; font: 600 15.5px/1.35 var(--font-display); }
.md p, .md ul, .md ol { margin: 0 0 12px; max-width: 72ch; }
.md ul, .md ol { padding-left: 20px; }
.md li { margin-bottom: 6px; }
.md li::marker { color: var(--muted); }
.table-wrap { overflow-x: auto; margin: 0 0 12px; }
table { border-collapse: collapse; font-size: 13.5px; }
th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--rule); vertical-align: top; }
th { font: 500 11px var(--font-body); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.ref { position: relative; display: inline-block; }
.ref > a { text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--seat) 70%, transparent); text-decoration-thickness: 1.5px; text-underline-offset: 3px; }
.ref > a:hover { color: var(--accent); }
.avatar-ref > a { text-decoration: none; }
.pop { display: none; position: fixed; z-index: 1000; top: 0; left: 0; width: min(320px, 80vw); background: var(--card); border: 1px solid var(--rule-2); border-radius: 10px; box-shadow: 0 12px 32px rgba(0,0,0,.16); font: 400 13.5px/1.45 var(--font-body); color: var(--ink); text-align: left; text-transform: none; letter-spacing: 0; }
/* Keyboard focus keeps the card open. Mouse focus does not, so the card clears after a dialog returns focus to the name. */
.ref:hover .pop, .ref:has(:focus-visible) .pop { display: block; }
.pop-body { display: grid; gap: 4px; padding: 14px; }
.pop-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }
.pop-head { display: flex; align-items: center; gap: 10px; }
.pop-avatar { flex: none; width: 40px; height: 40px; border-radius: 50%; }
.pop-avatar svg { display: block; width: 100%; height: 100%; }
.pop-who { display: grid; gap: 2px; min-width: 0; }
.pop-name { font: 600 16px var(--font-display); }
.pop-title { color: var(--ink-2); }
.pop-quote { font-weight: 500; border-left: 2px solid var(--seat); padding-left: 10px; margin: 8px 0; }
.pop-label { font: 500 10.5px var(--font-body); letter-spacing: .06em; text-transform: uppercase; color: var(--negative); margin-top: 2px; }
.pop-line { padding-left: 12px; position: relative; color: var(--ink-2); }
.pop-line::before { content: ""; position: absolute; left: 0; top: .6em; width: 5px; height: 5px; border-radius: 1px; background: var(--negative); }
.gallery { margin-top: 20px; border: 1px solid var(--rule); border-radius: 10px; background: var(--card); }
.gallery > summary { display: flex; align-items: baseline; gap: 10px; padding: 12px 16px; cursor: pointer; list-style: none; }
.gallery > summary::-webkit-details-marker { display: none; }
.gallery-count { font: 12px var(--font-mono); color: var(--muted); }
.gallery-group { padding: 0 16px 14px; }
.gallery-label { margin: 0 0 8px; font: 500 13px var(--font-body); color: var(--ink-2); }
.gallery-strip { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
.thumb { flex: none; display: grid; gap: 4px; padding: 0; border: 0; background: none; cursor: zoom-in; text-align: left; font: 12px var(--font-mono); color: var(--muted); }
.thumb img { width: 200px; height: auto; border-radius: 6px; border: 1px solid var(--rule-2); display: block; }
.thumb:hover img { border-color: var(--accent); }
.image-view { background: var(--card); border-radius: 12px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,.3); }
.image-view img { display: block; width: 100%; height: auto; }
.image-view p { margin: 0; padding: 10px 14px; font-size: 13.5px; color: var(--ink-2); }
.pop-open { margin-top: 8px; font: 12px var(--font-mono); color: var(--accent); }
.nav-text { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#panel-runs a[aria-current="true"] { color: var(--ink); font-weight: 500; }
.org-pick-row { display: flex; gap: 6px; margin-bottom: 10px; }
#org-pick { flex: 1; min-width: 0; font: 500 13px var(--font-body); padding: 5px 8px; border: 1px solid var(--rule-2); border-radius: 6px; background: var(--card); color: var(--ink); }
.org-about { font: 500 12.5px var(--font-body); padding: 5px 10px; border: 1px solid var(--rule-2); border-radius: 6px; background: var(--card); color: var(--ink-2); cursor: pointer; }
.org-about:hover { background: var(--hover); }
.export-box { width: 100%; height: 120px; margin-bottom: 10px; font: 11px/1.4 var(--font-mono); }
.org-link { color: inherit; text-decoration: underline; text-decoration-color: var(--rule-2); text-underline-offset: 3px; }
.org-card { background: var(--card); border-radius: 12px; padding: 24px 26px; display: grid; gap: 10px; box-shadow: 0 24px 60px rgba(0,0,0,.3); }
.org-card h2 { margin: 0; font: 600 24px/1.2 var(--font-display); }
.org-tagline { margin: 0; color: var(--ink-2); }
.org-note { margin: 0; font-size: 13.5px; color: var(--ink-2); background: var(--panel); border-radius: 8px; padding: 10px 12px; }
.org-card h4 { margin: 10px 0 0; }
.org-uses { margin: 0; padding-left: 18px; display: grid; gap: 4px; font-size: 14px; }
.org-proxies { list-style: none; margin: 0; padding: 0; display: grid; }
.org-proxies button { width: 100%; display: flex; align-items: center; gap: 10px; padding: 7px 6px; border: 0; border-bottom: 1px solid var(--rule); background: transparent; font: inherit; font-size: 14px; color: var(--ink); text-align: left; cursor: pointer; }
.org-proxies button:hover { background: var(--hover); }
.op-name { font-weight: 500; flex: none; }
.op-title { color: var(--muted); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-avatar { flex: none; display: block; width: 22px; height: 22px; border-radius: 50%; }
.nav-group button.nav-proxy { width: 100%; border-top: 0; border-right: 0; border-bottom: 0; background: transparent; font: inherit; font-size: 14px; text-align: left; cursor: pointer; }
dialog#proxy-dialog { width: min(980px, calc(100vw - 32px)); max-height: calc(100vh - 88px); margin: 64px auto 24px; padding: 0; border: 0; border-radius: 14px; background: transparent; overflow: visible; }
dialog#proxy-dialog::backdrop { background: rgba(10, 10, 12, .55); backdrop-filter: blur(2px); }
.dialog-body { max-height: calc(100vh - 88px); overflow-y: auto; border-radius: 12px; }
.dialog-body .card { box-shadow: 0 24px 60px rgba(0,0,0,.3); padding-bottom: 24px; }
.dialog-body .card-cols { grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 32px; }
.dialog-body .card-id { padding-right: 32px; border-right: 1px solid var(--rule); }
@media (max-width: 760px) { .dialog-body .card-cols { grid-template-columns: minmax(0, 1fr); } .dialog-body .card-id { padding-right: 0; border-right: 0; } }
.dialog-close { position: absolute; top: -40px; right: 0; font: 500 13px var(--font-body); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,.4); background: rgba(0,0,0,.35); color: #fff; cursor: pointer; }
`;

function navGroup(runs: Run[]): string {
  return `<div class="nav-group"><p class="nav-label">Runs</p>${runs
    .map((r) => `<a href="#${esc(r.id)}" title="${esc(r.title)}"><span class="nav-text">${esc(r.nav)}</span><span class="nav-meta">${esc(r.format)}</span></a>`)
    .join("")}</div>`;
}

// The Proxies panel shows one org at a time. The picker switches the org, and "About" opens the org overview.
function proxiesNav(orgs: Org[]): string {
  const picker = `<div class="org-pick-row"><select id="org-pick" aria-label="Org">${orgs.map((o) => `<option value="${esc(o.id)}">${esc(o.name)}</option>`).join("")}</select><button type="button" class="org-about" data-proxy="org-${esc(orgs[0]?.id ?? "")}">About</button><button type="button" class="org-about org-export" title="Copy this org as JSON. Paste it into Claude Code with /proxies import">Export</button></div>`;
  return picker + orgs
    .map((org, i) => `<div class="nav-group org-group" data-org="${esc(org.id)}"${i === 0 ? "" : " hidden"}><p class="nav-label">${org.proxies.length} proxies</p>${org.proxies
      .map((p) => `<button type="button" class="nav-proxy" data-proxy="${esc(cardId(p))}"><span class="nav-avatar" aria-hidden="true">${face(p)}</span>${esc(p.name)}<span class="nav-meta">${esc(DECISION_LABEL.get(p.decision) ?? p.decision)}</span></button>`)
      .join("")}</div>`)
    .join("");
}

function orgCard(org: Org): string {
  return `<article class="org-card">
  <p class="section-label">Org · <code>${esc(org.id)}</code></p>
  <h2>${esc(org.name)}</h2>
  <p class="org-tagline">${esc(org.tagline)}</p>
  ${org.note ? `<p class="org-note">${esc(org.note)}</p>` : ""}
  ${org.useCases.length ? `<h4>Use cases</h4><ul class="org-uses">${org.useCases.map((u) => `<li><code>${esc(u.id)}</code> ${esc(u.label)}</li>`).join("")}</ul>` : ""}
  <h4>Proxies</h4>
  <ul class="org-proxies">${org.proxies.map((p) => `<li><button type="button" data-proxy="${esc(cardId(p))}"><span class="nav-avatar" aria-hidden="true">${face(p)}</span><span class="op-name">${esc(p.name)}</span><span class="op-title">${esc(p.title)}</span><span class="nav-meta">${esc(DECISION_LABEL.get(p.decision) ?? p.decision)}</span></button></li>`).join("")}</ul>
</article>`;
}

function templates(orgs: Org[]): string {
  const proxies = orgs.flatMap((org) => org.proxies.map((p) => `<template id="tpl-${esc(cardId(p))}">${card(p, org.useCases)}</template>`));
  const orgCards = orgs.map((org) => `<template id="tpl-org-${esc(org.id)}">${orgCard(org)}</template>`);
  return [...proxies, ...orgCards].join("\n");
}

// The org picker shows one org's proxies in the sidebar and points the About button at that org.
const ORG_SCRIPT = `<script>
(() => {
  const pick = document.getElementById("org-pick");
  const about = document.querySelector(".org-about");
  if (!pick) return;
  pick.addEventListener("change", () => {
    document.querySelectorAll(".org-group").forEach((g) => { g.hidden = g.dataset.org !== pick.value; });
    about.dataset.proxy = "org-" + pick.value;
  });
  // Export copies the selected org's bundle. The clipboard can refuse, so the fallback selects the JSON for a manual copy.
  const exportBtn = document.querySelector(".org-export");
  exportBtn.addEventListener("click", () => {
    const data = document.querySelector('.org-bundle[data-org="' + pick.value + '"]');
    if (!data) return;
    const done = (label) => { exportBtn.textContent = label; setTimeout(() => { exportBtn.textContent = "Export"; }, 1600); };
    navigator.clipboard.writeText(data.textContent).then(() => done("Copied"), () => {
      const box = document.createElement("textarea");
      box.value = data.textContent; box.className = "export-box"; box.readOnly = true;
      exportBtn.closest(".org-pick-row").after(box); box.select(); done("Select and copy");
    });
  });
})();
</script>`;

// One run shows at a time. The page hash names the run, and the newest run shows when the hash names none.
// The hover card uses fixed positioning, so no row that clips its overflow can hide it.
// It opens below the name, or above when the window has no room below, and stays inside the window.
const POP_SCRIPT = `<script>
(() => {
  const place = (ref) => {
    const pop = ref.querySelector(":scope > .pop");
    if (!pop) return;
    const anchor = ref.getBoundingClientRect();
    const gap = 6, margin = 8;
    const width = pop.offsetWidth, height = pop.offsetHeight;
    const below = anchor.bottom + gap;
    const above = anchor.top - gap - height;
    const top = below + height <= innerHeight - margin ? below : above >= margin ? above : Math.max(margin, innerHeight - height - margin);
    const left = Math.min(Math.max(margin, anchor.left), innerWidth - width - margin);
    pop.style.top = top + "px";
    pop.style.left = left + "px";
  };
  const onEnter = (event) => {
    const ref = event.target.closest && event.target.closest(".ref");
    if (ref) requestAnimationFrame(() => place(ref));
  };
  document.addEventListener("mouseover", onEnter);
  document.addEventListener("focusin", onEnter);
})();
</script>`;

const RUN_SCRIPT = `<script>
(() => {
  const runs = [...document.querySelectorAll(".run")];
  const links = [...document.querySelectorAll("#panel-runs a")];
  const show = () => {
    const id = location.hash.slice(1);
    const current = runs.find((r) => r.id === id) ?? runs[0];
    if (!current) return;
    runs.forEach((r) => { r.hidden = r !== current; });
    links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + current.id)));
    document.title = current.querySelector(".page-title").textContent + " · Review board";
  };
  window.addEventListener("hashchange", show);
  show();
})();
</script>`;

// Each org's export bundle sits in the page as JSON. "<" is escaped so the text cannot close the script tag.
function bundleScript(org: Org): string {
  const json = JSON.stringify(orgBundle(org.id)).replace(/</g, "\\u003c");
  return `<script type="application/json" class="org-bundle" data-org="${esc(org.id)}">${json}</script>`;
}

function fragment(runs: Run[], orgs: Org[]): string {
  return `<title>Review board</title>
${FAVICON}
${FONTS}
<style>${STYLE}${CARD_CSS}</style>
${avatarSprite(orgs.flatMap((o) => o.proxies))}
<div class="shell" id="top">
  ${sidebar(navGroup(runs), proxiesNav(orgs))}
  <main class="content"><div class="content-inner">
    <header class="masthead">${LOGO}</header>
    ${runs.map((r) => runSection(r)).join("\n")}
  </div></main>
</div>
<dialog id="proxy-dialog" aria-label="Proxy card">
  <button type="button" class="dialog-close" aria-label="Close">Close</button>
  <div class="dialog-body"></div>
</dialog>
${templates(orgs)}
${orgs.map(bundleScript).join("\n")}
${COPY_SCRIPT}
${PROXY_SCRIPT}
${RUN_SCRIPT}
${POP_SCRIPT}
${ORG_SCRIPT}`;
}

const SHARE_DIR = join(PROJECT, "share");

// The share file holds one run and the cards of its attendees only. It has no sidebar and no org export.
function shareFragment(run: Run): string {
  const org: Org = { ...run.org, proxies: run.org.proxies.filter((p) => run.attendees.some((a) => a.handle === p.handle)) };
  return `<title>${esc(run.title)}</title>
${FAVICON}
${FONTS}
<style>${STYLE}${CARD_CSS}${SHARE_CSS}</style>
${avatarSprite(org.proxies)}
<main class="content share"><div class="content-inner">
  <header class="masthead">${LOGO}</header>
  ${runSection(run)}
</div></main>
<dialog id="proxy-dialog" aria-label="Proxy card">
  <button type="button" class="dialog-close" aria-label="Close">Close</button>
  <div class="dialog-body"></div>
</dialog>
${templates([org])}
${PROXY_SCRIPT}
${RUN_SCRIPT}
${POP_SCRIPT}`;
}

const SHARE_CSS = `
.share { padding-inline: 24px; }
@media print {
  .share { padding: 0; }
  .masthead, .dialog-close, .copy-btn, .output summary::after, .gallery summary::after { display: none; }
  tr, .output summary, .step-label { break-inside: avoid; }
  h3, h4, .round-label, .output summary { break-after: avoid; }
  .gallery-strip { flex-wrap: wrap; overflow: visible; }
  .run-head .overview, .run-head .context { break-inside: avoid; }
  a { color: inherit; text-decoration: none; }
}`;

// Each screenshot path becomes a data URI, so the file works on its own in Notion, email, or a PDF.
function inlineScreens(html: string): string {
  // The full-size view reads the thumbnail's data, so each screenshot is stored once.
  return html
    .replace(/data-image="runs\/[^"]+\.png"/g, 'data-image="thumb"')
    .replace(/src="(runs\/[^"]+\.png)"/g, (_m, path: string) => {
      const file = join(PROJECT, path);
      if (!existsSync(file)) throw new Error(`Screenshot not found: ${path}`);
      return `src="data:image/png;base64,${readFileSync(file).toString("base64")}"`;
    })
    .replace("</body>", `<script>document.querySelectorAll('[data-image="thumb"]').forEach((b) => { b.dataset.image = b.querySelector("img").src; });</script>\n</body>`);
}

// The PDF needs every toggle open, because a printed page cannot expand one.
function openAll(html: string): string {
  return html.replace(/<details(?![^>]*\bopen\b)/g, "<details open");
}

function share(id: string, orgs: Org[]): void {
  if (!existsSync(join(RUNS_DIR, id, "meta.md"))) throw new Error(`No run named ${id} in runs/`);
  const run = readRun(id, orgs);
  if (inProgress(run)) throw new Error(`Run ${id} is still in progress. Write its summary before you share it.`);
  if (!existsSync(SHARE_DIR)) mkdirSync(SHARE_DIR);
  const html = inlineScreens(localDocument(shareFragment(run)));
  writeFileSync(join(SHARE_DIR, `${id}.html`), html);
  writeFileSync(join(SHARE_DIR, `${id}.print.html`), openAll(html));
  console.log(`Wrote share/${id}.html and share/${id}.print.html`);
}

// With "--org <id>", the page shows only that org and its runs, and the files take the org id as a suffix.
// With "--run <id>", the script writes one shareable file for that run and nothing else.
function main(): void {
  const args = process.argv.slice(2);
  const only = args.includes("--org") ? args[args.indexOf("--org") + 1] : null;
  const allOrgs = readOrgs();
  if (args.includes("--run")) {
    const id = args[args.indexOf("--run") + 1];
    if (!id) throw new Error("Usage: node scripts/runs.ts --run <run-folder>");
    share(id, allOrgs);
    return;
  }
  if (only !== null && !allOrgs.some((o) => o.id === only)) throw new Error(`--org ${String(only)} matches no folder in orgs/`);
  const orgs = only === null ? allOrgs : allOrgs.filter((o) => o.id === only);
  const runs = readdirSync(RUNS_DIR)
    .filter((d) => existsSync(join(RUNS_DIR, d, "meta.md")))
    .map((d) => readRun(d, allOrgs))
    .filter((r) => only === null || r.org.id === only)
    .sort((a, b) => b.date.localeCompare(a.date) || b.sequence - a.sequence);
  const local = only === null ? OUT_LOCAL : OUT_LOCAL.replace(/\.html$/, `.${only}.html`);
  const artifact = only === null ? OUT_ARTIFACT : OUT_ARTIFACT.replace(/\.artifact\.html$/, `.${only}.artifact.html`);
  // While a run is in progress, the local page reloads itself so new answers appear without a manual refresh.
  const page = localDocument(fragment(runs, orgs));
  writeFileSync(local, runs.some(inProgress) ? page.replace("<head>", `<head><meta http-equiv="refresh" content="15">`) : page);
  writeFileSync(artifact, fragment(runs, orgs));
  console.log(`Wrote ${basename(local)} and ${basename(artifact)}: ${runs.length} runs`);
}

main();
