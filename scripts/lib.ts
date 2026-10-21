// Shared parsing and page parts for the cards page and the runs page.
import { avatarSymbol } from "./avatar.ts";
import type { AvatarInput } from "./avatar.ts";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type Decision = "owner" | "veto" | "approve" | "consult" | "inform";

export type Section = { heading: string; paragraphs: string[] };

export type Proxy = {
  handle: string;
  name: string;
  pronouns: string;
  title: string;
  seat: string;
  org: string;
  reports_to: string;
  tenure: string;
  decision: Decision;
  quote: string;
  voice: string;
  measured_on: string[];
  hard_lines: string[];
  blind_spots: string[];
  uses: string[];
  knows: string[];
  sections: Section[];
  avatar: AvatarInput;
};

export type UseCase = { id: string; label: string };

// A company org has a business, rules, culture, and decision rights. A group org is an ad hoc set of proxies with a purpose.
export type OrgType = "company" | "group";

export type Org = { id: string; type: OrgType; name: string; tagline: string; note: string; useCases: UseCase[]; knows: string[]; proxies: Proxy[] };

export type Frontmatter = Map<string, string | string[]>;

export type Parsed = { fields: Frontmatter; body: string };

// PLUGIN is the folder that holds the tool: formats, seats, and scripts.
// PROJECT is the folder where the user works. It holds the user's data: orgs, knowledge, runs, and results pages.
// The scripts run from the project folder. When the user works inside the plugin's own repo, the two folders are the same.
export const PLUGIN = new URL("..", import.meta.url).pathname;
export const PROJECT = process.cwd();
export const ORGS_DIR = join(PROJECT, "orgs");
export const RUNS_DIR = join(PROJECT, "runs");
export const KNOWLEDGE_DIR = join(PROJECT, "knowledge");

// A seat in the project folder overrides the seat with the same name in the plugin.
export function seatFile(id: string): string {
  const own = join(PROJECT, "seats", `${id}.md`);
  if (existsSync(own)) return own;
  const shipped = join(PLUGIN, "seats", `${id}.md`);
  if (existsSync(shipped)) return shipped;
  throw new Error(`Seat "${id}" is in neither ${join(PROJECT, "seats")} nor ${join(PLUGIN, "seats")}`);
}

export function formatFile(format: string): string {
  return join(PLUGIN, "formats", `${format}.md`);
}



// Seat colors come from the illustration palette: tomato, rust, mustard, teal, olive, slate, and charcoal.
// Each one is dark enough for white header text.
const SEAT_COLORS: ReadonlyMap<string, string> = new Map([
  ["product", "#2e6b6e"],
  ["compliance", "#7a2f1c"],
  ["risk", "#b83a22"],
  ["engineering", "#1f4446"],
  ["accessibility", "#8a6424"],
  ["client-experience", "#b5521f"],
  ["exec-sponsor", "#26282b"],
  ["ai-enablement", "#4d5c5a"],
  ["practitioner", "#4f6b2e"],
  ["business-lead", "#38606a"],
  ["finance", "#6b4a2a"],
  ["market-data", "#9a3a26"],
  ["producer", "#6b7a2a"],
]);
const FALLBACK_COLOR = "#6b6f76";
export const DECISION_ORDER: readonly Decision[] = ["owner", "veto", "approve", "consult", "inform"];

// The parser reads a small YAML subset: "key: value" lines and "key:" lines followed by "  - item" lines.
export function parse(source: string, file: string): Parsed {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`No frontmatter in ${file}`);
  const fields: Frontmatter = new Map();
  let listKey: string | null = null;
  for (const line of match[1].split("\n")) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      const list = fields.get(listKey);
      if (!Array.isArray(list)) throw new Error(`List item outside a list in ${file}: ${line}`);
      list.push(unquote(item[1]));
      continue;
    }
    const pair = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!pair) continue;
    const [, key, value] = pair;
    if (value === "") {
      fields.set(key, []);
      listKey = key;
    } else {
      fields.set(key, unquote(value));
      listKey = null;
    }
  }
  return { fields, body: match[2].trim() };
}

function unquote(value: string): string {
  return value.trim().replace(/^"(.*)"$/, "$1");
}

export function text(fields: Frontmatter, key: string, file: string): string {
  const value = fields.get(key);
  if (typeof value !== "string") throw new Error(`Missing text field "${key}" in ${file}`);
  return value;
}

export function list(fields: Frontmatter, key: string, file: string): string[] {
  const value = fields.get(key);
  if (!Array.isArray(value)) throw new Error(`Missing list field "${key}" in ${file}`);
  return value;
}

// Some fields only apply to some orgs. An absent optional list is empty.
export function optionalList(fields: Frontmatter, key: string, file: string): string[] {
  const value = fields.get(key);
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`Field "${key}" must be a list in ${file}`);
  return value;
}

// Each use case is a list item in the form "id: label".
function useCase(item: string, file: string): UseCase {
  const match = item.match(/^([a-z0-9-]+):\s+(.+)$/);
  if (!match) throw new Error(`Use case must be "id: label" in ${file}: ${item}`);
  return { id: match[1], label: match[2] };
}

function decision(fields: Frontmatter, file: string): Decision {
  const value = text(fields, "decision", file);
  const found = DECISION_ORDER.find((d) => d === value);
  if (!found) throw new Error(`Unknown decision "${value}" in ${file}. Use one of ${DECISION_ORDER.join(", ")}`);
  return found;
}

// The body uses "## Heading" lines and plain paragraphs. Text before the first heading is ignored.
function sections(body: string): Section[] {
  return body
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...rest] = chunk.split("\n");
      const paragraphs = rest.join("\n").split(/\n\s*\n/).map((p) => p.trim().replace(/\s*\n\s*/g, " ")).filter(Boolean);
      return { heading: heading.trim(), paragraphs };
    });
}

function orgType(fields: Frontmatter, file: string): OrgType {
  const value = text(fields, "type", file);
  if (value !== "company" && value !== "group") throw new Error(`Unknown org type "${value}" in ${file}. Use company or group`);
  return value;
}

// Every "knows" id must name a folder in knowledge/ that has an index.md.
function checkKnowledge(ids: string[], file: string): void {
  const missing = ids.filter((k) => !existsSync(join(KNOWLEDGE_DIR, k, "index.md")));
  if (missing.length > 0) throw new Error(`${file} knows ${missing.join(", ")}, but knowledge/<id>/index.md does not exist for it`);
}

function optionalText(fields: Frontmatter, key: string): string | null {
  const value = fields.get(key);
  return typeof value === "string" ? value : null;
}

function readProxy(file: string): Proxy {
  const { fields, body } = parse(readFileSync(file, "utf8"), file);
  const org = text(fields, "org", file);
  const handle = text(fields, "handle", file);
  return {
    handle: text(fields, "handle", file),
    name: text(fields, "name", file),
    pronouns: text(fields, "pronouns", file),
    title: text(fields, "title", file),
    seat: text(fields, "seat", file),
    org: text(fields, "org", file),
    reports_to: text(fields, "reports_to", file),
    tenure: text(fields, "tenure", file),
    decision: decision(fields, file),
    quote: text(fields, "quote", file),
    voice: text(fields, "voice", file),
    measured_on: list(fields, "measured_on", file),
    hard_lines: list(fields, "hard_lines", file),
    blind_spots: list(fields, "blind_spots", file),
    uses: optionalList(fields, "uses", file),
    knows: optionalList(fields, "knows", file),
    sections: sections(body),
    avatar: {
      seed: optionalText(fields, "avatar_seed") ?? `${org}/${handle}`,
      pronouns: text(fields, "pronouns", file),
      hair: optionalText(fields, "avatar_hair"),
      top: optionalText(fields, "avatar_top"),
      facialHair: optionalText(fields, "avatar_facial_hair"),
      glasses: optionalText(fields, "avatar_glasses"),
    },
  };
}

export function readOrg(id: string): Org {
  const orgFile = join(ORGS_DIR, id, "org.md");
  const { fields, body } = parse(readFileSync(orgFile, "utf8"), orgFile);
  const proxiesDir = join(ORGS_DIR, id, "proxies");
  const proxies = existsSync(proxiesDir)
    ? readdirSync(proxiesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => readProxy(join(proxiesDir, f)))
        .sort((a, b) => DECISION_ORDER.indexOf(a.decision) - DECISION_ORDER.indexOf(b.decision) || a.name.localeCompare(b.name))
    : [];
  const note = body.split(/\n\s*\n/)[0]?.trim() ?? "";
  const useCases = optionalList(fields, "use_cases", orgFile).map((item) => useCase(item, orgFile));
  const known = new Set(useCases.map((u) => u.id));
  for (const proxy of proxies) {
    const unknown = proxy.uses.filter((u) => !known.has(u));
    if (unknown.length > 0) throw new Error(`${proxy.handle} in ${id} uses unknown use cases: ${unknown.join(", ")}. Known: ${[...known].join(", ")}`);
  }
  const knows = optionalList(fields, "knows", orgFile);
  checkKnowledge(knows, orgFile);
  for (const proxy of proxies) checkKnowledge(proxy.knows, join(proxiesDir, `${proxy.handle}.md`));
  return { id, type: orgType(fields, orgFile), name: text(fields, "name", orgFile), tagline: text(fields, "tagline", orgFile), note, useCases, knows, proxies };
}

export function readOrgs(): Org[] {
  return readdirSync(ORGS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readOrg(d.name));
}

export function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Every proxy shows as a generated avatar. Each page draws an avatar once, in avatarSprite, and every place
// that shows the proxy points at it with <use>. The SVG scales to the size of its container.
function avatarId(proxy: Proxy): string {
  return `av-${proxy.org}-${proxy.handle}`;
}

export function face(proxy: Proxy): string {
  return `<svg viewBox="0 0 100 100" style="border-radius:50%;overflow:hidden" aria-hidden="true"><use href="#${avatarId(proxy)}"/></svg>`;
}

// The sprite holds one symbol per proxy. It is hidden with a zero size, not display none, so its filters still work.
export function avatarSprite(proxies: Proxy[]): string {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${proxies.map((p) => avatarSymbol(p.avatar, avatarId(p))).join("")}</svg>`;
}

export function seatLabel(seat: string): string {
  return seat.replace(/-/g, " ");
}

export function seatColor(seat: string): string {
  return SEAT_COLORS.get(seat) ?? FALLBACK_COLOR;
}

export function cardId(proxy: Proxy): string {
  return `${proxy.org}-${proxy.handle}`;
}

export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;800&family=Geist+Mono:wght@400;500&family=IBM+Plex+Serif:ital,wght@1,400&family=Young+Serif&display=swap">`;

// The logo is the wordmark in Young Serif with a red dot. The text takes the page's ink color, so it reads in both themes.
export const LOGO = `<svg class="logo" viewBox="0 0 300 90" role="img" aria-label="Proxies"><text x="4" y="70" font-family="'Young Serif', Georgia, serif" font-size="68" letter-spacing="-1" fill="currentColor">Proxies</text><circle cx="268" cy="27" r="7" fill="#ee4b2b"/></svg>`;

// Labels name the proxy's standing in the org, not anything they did in a run.
export const DECISION_LABEL: ReadonlyMap<Decision, string> = new Map([
  ["owner", "Decision owner"],
  ["veto", "Veto holder"],
  ["approve", "Approver"],
  ["consult", "Consulted"],
  ["inform", "Informed"],
]);

// A decision role shows as a status pill: a dot, a text label, and a tint from the role's color.
export function decisionPill(decision: Decision): string {
  return `<span class="pill d-${decision}"><span class="pill-dot" aria-hidden="true"></span>${DECISION_LABEL.get(decision) ?? decision}</span>`;
}

export function seatPill(seat: string): string {
  return `<span class="seat-pill" style="--seat:${seatColor(seat)}"><span class="pill-dot" aria-hidden="true"></span>${esc(seatLabel(seat))}</span>`;
}

export function copyButton(value: string): string {
  return `<span class="copy"><code>${esc(value)}</code><button type="button" class="copy-btn" data-copy="${esc(value)}">Copy</button></span>`;
}

// Theme tokens follow the api-dashboard persona: near-white or near-black surfaces, hairline borders, one blue accent.
export const TOKENS = `
:root {
  --bg: #fdfdfd; --card: #ffffff; --panel: #f2f2f4; --hover: #ebebed;
  --ink: #141416; --ink-2: #505058; --muted: #85858f; --rule: rgba(0,0,0,.09); --rule-2: rgba(0,0,0,.14);
  --accent: #008ffa; --positive: #167a40; --negative: #c81e28; --warning: #a86b00; --caution: #e3b008; --info: #3b6fd8;
  --chip: var(--panel); --hard: var(--negative);
  --font-display: "Geist", ui-sans-serif, system-ui, sans-serif; --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-quote: "IBM Plex Serif", Georgia, serif; --font-mono: "Geist Mono", ui-monospace, "SF Mono", monospace;
  --shadow: 0 1px 2px rgba(0,0,0,.04);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #0a0a0b; --card: #111112; --panel: #1b1b1d; --hover: #262629; --ink: #efeff0; --ink-2: #aaaaaf; --muted: #737378; --rule: rgba(255,255,255,.08); --rule-2: rgba(255,255,255,.14); --accent: #2ea3ff; --positive: #38a169; --negative: #e2495a; --warning: #d99e23; --caution: #f2c94c; --info: #6d9cf5; --shadow: none; color-scheme: dark; }
}
:root[data-theme="dark"] { --bg: #0a0a0b; --card: #111112; --panel: #1b1b1d; --hover: #262629; --ink: #efeff0; --ink-2: #aaaaaf; --muted: #737378; --rule: rgba(255,255,255,.08); --rule-2: rgba(255,255,255,.14); --accent: #2ea3ff; --positive: #38a169; --negative: #e2495a; --warning: #d99e23; --caution: #f2c94c; --info: #6d9cf5; --shadow: none; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.55 var(--font-body); -webkit-font-smoothing: antialiased; }
a { color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent); border-radius: 4px; }
code { font: 12.5px var(--font-mono); background: var(--panel); padding: 2px 6px; border-radius: 4px; overflow-wrap: anywhere; }

/* Shell: a sticky sidebar beside the main column on wide screens. The sidebar stacks above the content on narrow screens. */
.shell { display: grid; grid-template-columns: minmax(0, 1fr) 288px; min-height: 100%; }
.side { position: sticky; top: env(safe-area-inset-top, 0px); align-self: start; height: 100vh; overflow-y: auto; order: 2; border-left: 1px solid var(--rule); padding-block: 24px; padding-inline: 16px; display: grid; align-content: start; gap: 20px; }
.brand { display: flex; align-items: center; gap: 10px; font: 600 15px var(--font-display); }
.tabs { display: inline-flex; justify-self: start; gap: 2px; padding: 2px; background: var(--panel); border-radius: 7px; }
.top.top-bar { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px 24px; }
.top-bar .top-text { flex: 1 1 420px; min-width: 0; display: grid; gap: 6px; }
.tabs button { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border: 0; background: transparent; cursor: pointer; border-radius: 5px; font: 500 12.5px var(--font-body); color: var(--ink-2); }
.tabs button[aria-selected="true"] { background: var(--card); color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.side > *, .nav-groups > * { min-width: 0; }
.side { overflow-x: hidden; }
.nav-group { display: grid; gap: 2px; min-width: 0; }
.nav-group a, .nav-group button.nav-proxy { min-width: 0; }
.nav-label { margin: 0 0 4px; padding-inline: 8px; font: 500 11px var(--font-body); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.nav-group a, .nav-group button.nav-proxy { display: flex; align-items: center; gap: 8px; min-height: 32px; padding: 4px 8px; border-radius: 6px; text-decoration: none; color: var(--ink-2); font-size: 14px; border-left: 2px solid transparent; }
.nav-group a:hover, .nav-group button.nav-proxy:hover { background: var(--hover); color: var(--ink); }
.nav-group .nav-meta { margin-left: auto; font: 11.5px var(--font-mono); color: var(--muted); }
.content { min-width: 0; padding-inline: 32px; padding-block: 32px 96px; }
.side-toggle { margin-left: auto; width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--rule-2); border-radius: 6px; background: var(--card); cursor: pointer; }
.side-toggle:hover { background: var(--hover); }
.side-toggle { color: var(--ink-2); }
.theme-toggle { margin-left: auto; width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--rule-2); border-radius: 6px; background: var(--card); color: var(--ink-2); cursor: pointer; }
.theme-toggle:hover { background: var(--hover); }
.theme-toggle + .side-toggle { margin-left: 0; }
.shell.collapsed .theme-toggle { display: none; }
.shell.collapsed .side-toggle { margin-left: auto; }
.brand-icon { display: grid; place-items: center; color: var(--ink-2); }
.brand-name { font: 600 15px/1 var(--font-display); }
.masthead { padding-bottom: 28px; }
.logo { display: block; height: 34px; width: auto; color: var(--ink); }
.icon { flex: none; }
.shell.collapsed { grid-template-columns: minmax(0, 1fr) 60px; }
.shell.collapsed .side { padding-inline: 12px; }
.shell.collapsed .brand-name, .shell.collapsed .nav-groups:not([hidden]), .shell.collapsed .nav-groups, .shell.collapsed .brand-icon, .shell.collapsed .tabs { display: none; }
.shell.collapsed .side-toggle .icon { transform: scaleX(-1); }
.content-inner { max-width: 1120px; margin: 0 auto; }
@media (max-width: 900px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .side { position: static; height: auto; order: -1; border-left: 0; border-bottom: 1px solid var(--rule); }
  .nav-groups { display: none; }
  .content { padding-inline: 16px; }
}

.page-title { margin: 0; font: 600 28px/1.2 var(--font-display); letter-spacing: -0.015em; }
.page-lede { margin: 6px 0 0; color: var(--ink-2); max-width: 70ch; }
.section-label { margin: 0; font: 500 11px var(--font-body); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }

.pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 4px; font: 500 11.5px var(--font-body); border: 1px solid; white-space: nowrap; --c: var(--muted); color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent); border-color: color-mix(in srgb, var(--c) 30%, transparent); }
.pill-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.d-owner { --c: var(--accent); }
.d-veto { --c: var(--negative); }
.d-approve { --c: var(--warning); }
.d-consult { --c: var(--info); }
.d-inform { --c: var(--muted); }
.seat-pill { display: inline-flex; align-items: center; gap: 6px; font: 500 12px var(--font-body); color: var(--ink-2); text-transform: capitalize; }
.seat-pill .pill-dot { background: var(--seat); }
.copy { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; }
.copy code { min-width: 0; }
.copy-btn { font: 500 12px var(--font-body); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--rule-2); background: var(--card); color: var(--ink-2); cursor: pointer; }
.copy-btn:hover { background: var(--hover); color: var(--ink); }
`;

// Copy buttons write their data-copy value to the clipboard. If the browser refuses, the script selects the text instead.
export const COPY_SCRIPT = `<script>
// The theme toggle switches between light and dark. With no saved choice, the page follows the system setting.
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const dark = () => root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const label = () => {
    if (!toggle) return;
    const text = dark() ? "Switch to light theme" : "Switch to dark theme";
    toggle.setAttribute("aria-label", text);
    toggle.title = text;
  };
  try { const saved = localStorage.getItem("proxies-theme"); if (saved === "light" || saved === "dark") root.dataset.theme = saved; } catch (e) {}
  label();
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const next = dark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("proxies-theme", next); } catch (e) {}
    label();
  });
})();
// The sidebar toggle collapses the sidebar to a narrow rail. The choice is kept per viewer when storage works.
(() => {
  const shell = document.querySelector(".shell");
  const toggle = document.querySelector(".side-toggle");
  if (!shell || !toggle) return;
  const set = (collapsed) => {
    shell.classList.toggle("collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    toggle.title = toggle.getAttribute("aria-label");
  };
  try { set(localStorage.getItem("proxies-side") === "collapsed"); } catch (e) { set(false); }
  toggle.addEventListener("click", () => {
    const collapsed = !shell.classList.contains("collapsed");
    set(collapsed);
    try { localStorage.setItem("proxies-side", collapsed ? "collapsed" : "open"); } catch (e) {}
  });
})();
document.addEventListener("click", (event) => {
  const button = event.target.closest(".copy-btn");
  if (!button) return;
  const done = () => { button.textContent = "Copied"; setTimeout(() => { button.textContent = "Copy"; }, 1400); };
  const select = () => { const code = button.previousElementSibling; const range = document.createRange(); range.selectNodeContents(code); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); button.textContent = "Press Cmd+C"; };
  if (navigator.clipboard) navigator.clipboard.writeText(button.dataset.copy).then(done, select); else select();
});
</script>`;

// Line icons drawn inline, in the Lucide style. Each value holds the inner SVG elements for a 24 by 24 view box.
const ICONS = {
  brand: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
  runs: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  proxies: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
  theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
} as const;

export function icon(name: keyof typeof ICONS, size: number): string {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

// The sidebar has two lists: runs and proxies. The Proxies and Runs tabs switch which list shows. Runs is the default.
// The tab icon is the wordmark's first letter. It uses fixed colors, because a data URI cannot read the page's tokens.
export const FAVICON = `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#111112"/><text x="16" y="23" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="21" font-weight="700" fill="#fff">P</text></svg>')}">`;

export function sidebar(runsList: string, proxiesList: string): string {
  return `<aside class="side">
  <div class="brand"><span class="brand-name">Library</span><button type="button" class="theme-toggle" aria-label="Switch theme" title="Switch theme">${icon("theme", 15)}</button><button type="button" class="side-toggle" aria-expanded="true" aria-label="Collapse sidebar" title="Collapse sidebar">${icon("panel", 16)}</button></div>
  <div class="tabs" role="tablist" aria-label="Sidebar lists">
    <button type="button" role="tab" id="tab-runs" aria-controls="panel-runs" aria-selected="true" data-panel="runs">${icon("runs", 13)}Runs</button>
    <button type="button" role="tab" id="tab-proxies" aria-controls="panel-proxies" aria-selected="false" data-panel="proxies">${icon("proxies", 13)}Proxies</button>
  </div>
  <div class="nav-groups" id="panel-runs" role="tabpanel" aria-labelledby="tab-runs">${runsList}</div>
  <div class="nav-groups" id="panel-proxies" role="tabpanel" aria-labelledby="tab-proxies" hidden>${proxiesList}</div>
</aside>`;
}

// The local file needs its own document skeleton. The Artifact publisher adds one to the fragment.
export function localDocument(body: string): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
${body}
</body>
</html>
`;
}

// The proxy modal. The page keeps every card in a template. A click on any [data-proxy] element opens that card.
export const PROXY_SCRIPT = `<script>
(() => {
  const dialog = document.getElementById("proxy-dialog");
  const body = dialog.querySelector(".dialog-body");
  // The arrow keys move through the proxies around the card that was clicked:
  // the run's attendee row, the org's list in the sidebar, or every proxy on the page.
  let proxies = [];
  let current = -1;
  const unique = (ids) => [...new Set(ids)];
  const proxiesNear = (trigger, id) => {
    const run = trigger.closest(".run");
    const group = trigger.closest(".org-group, .org-proxies");
    const scope = run ? run.querySelector(".attendees") : group;
    const ids = scope ? unique([...scope.querySelectorAll("[data-proxy]")].map((el) => el.dataset.proxy)) : [];
    if (ids.includes(id)) return ids;
    return [...document.querySelectorAll("template[id^='tpl-']")].map((t) => t.id.slice(4)).filter((x) => !x.startsWith("org-"));
  };
  const show = (id) => {
    const template = document.getElementById("tpl-" + id);
    if (!template) return false;
    body.replaceChildren(template.content.cloneNode(true));
    if (!dialog.open) dialog.showModal();
    return true;
  };
  const open = (id, trigger) => {
    proxies = id.startsWith("org-") ? [] : proxiesNear(trigger, id);
    current = proxies.indexOf(id);
    show(id);
  };
  document.addEventListener("keydown", (event) => {
    if (!dialog.open || current < 0 || proxies.length < 2) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    current = (current + (event.key === "ArrowRight" ? 1 : -1) + proxies.length) % proxies.length;
    show(proxies[current]);
  });
  // A card opened with the mouse clears focus when it closes, so the name's hover card does not stay open.
  // A card opened with the keyboard keeps focus on the name, so keyboard users do not lose their place.
  let openedWithPointer = false;
  dialog.addEventListener("close", () => {
    proxies = [];
    current = -1;
    if (openedWithPointer && document.activeElement && document.activeElement.closest(".ref")) document.activeElement.blur();
  });
  document.addEventListener("click", (event) => {
    const shot = event.target.closest("[data-image]");
    if (shot) {
      const view = document.createElement("figure");
      view.className = "image-view";
      const img = document.createElement("img");
      img.src = shot.dataset.image;
      img.alt = shot.dataset.caption || "";
      const caption = document.createElement("p");
      caption.textContent = shot.dataset.caption || "";
      view.append(img, caption);
      body.replaceChildren(view);
      proxies = [];
      current = -1;
      dialog.showModal();
      return;
    }
    const trigger = event.target.closest("[data-proxy]");
    if (trigger) { event.preventDefault(); openedWithPointer = event.detail > 0; open(trigger.dataset.proxy, trigger); return; }
    if (event.target === dialog || event.target.closest(".dialog-close")) dialog.close();
  });
  document.querySelectorAll(".tabs [data-panel]").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tabs [data-panel]").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      document.querySelectorAll(".side .nav-groups").forEach((panel) => { panel.hidden = panel.id !== "panel-" + tab.dataset.panel; });
    });
  });
})();
</script>`;
