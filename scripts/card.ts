// One proxy card. The runs page shows a card in a modal when a viewer clicks a proxy.
import { cardId, copyButton, decisionPill, esc, face, seatColor } from "./lib.ts";
import type { Proxy, Section, UseCase } from "./lib.ts";

function listBlock(label: string, kind: string, items: string[]): string {
  return `<section class="block ${kind}"><h4>${label}</h4><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></section>`;
}

function proseBlock(section: Section): string {
  return `<section class="prose"><h4>${esc(section.heading)}</h4>${section.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</section>`;
}

function useTags(proxy: Proxy, useCases: UseCase[]): string {
  if (proxy.uses.length === 0) return "";
  const all = proxy.uses.length === useCases.length && useCases.length > 1;
  const tags = all ? ["all use cases"] : proxy.uses;
  return `<ul class="uses" aria-label="Use cases">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
}

export function card(proxy: Proxy, useCases: UseCase[]): string {
  return `<article class="card" id="${esc(cardId(proxy))}" data-uses="${esc(proxy.uses.join(" "))}" style="--seat:${seatColor(proxy.seat)}">
  <div class="band"><span class="band-seat">${esc(proxy.seat.replace(/-/g, " "))}</span>${decisionPill(proxy.decision)}</div>
  <div class="card-cols">
  <div class="card-id">
  <header class="card-head">
    <div class="card-avatar" aria-hidden="true">${face(proxy)}</div>
    <div class="who">
      <h3>${esc(proxy.name)} <span class="pronouns">${esc(proxy.pronouns)}</span></h3>
      <p class="title">${esc(proxy.title)}</p>
    </div>
  </header>
  <div class="meta-row">
    <span>Reports to ${esc(proxy.reports_to)}</span>
    <span class="sep" aria-hidden="true"></span>
    <span>${esc(proxy.tenure)}</span>
  </div>
  ${useTags(proxy, useCases)}
  <blockquote>${esc(proxy.quote)}</blockquote>
  <footer class="card-foot">
    <p class="voice"><span class="section-label">Voice</span> ${esc(proxy.voice)}</p>
    ${copyButton(`/proxies ask ${proxy.handle}`)}
  </footer>
  </div>
  <div class="card-detail">
  <div class="blocks">
    ${listBlock("Measured on", "measured", proxy.measured_on)}
    ${listBlock("Hard lines", "hard", proxy.hard_lines)}
    ${listBlock("Blind spots", "blind", proxy.blind_spots)}
  </div>
  ${proxy.sections.map(proseBlock).join("\n  ")}
  </div>
  </div>
</article>`;
}


export const CARD_CSS = `
.card { display: flex; flex-direction: column; gap: 16px; padding: 0 22px 20px; background: var(--card); border: 1px solid var(--rule-2); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; scroll-margin-top: 16px; }
.card[hidden] { display: none; }
.card:target { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent); }
.band { display: flex; justify-content: space-between; align-items: center; margin: 0 -22px; padding: 10px 22px; background: var(--seat); color: #fff; }
.band-seat { font: 500 11.5px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; }
.band .pill { --c: #fff; color: #fff; background: rgba(255,255,255,.16); border-color: rgba(255,255,255,.45); }
.band .pill.d-owner { background: #fff; color: var(--seat); border-color: #fff; }
.band .pill.d-veto { background: rgba(0,0,0,.28); border-color: transparent; }
.card-head { display: flex; align-items: center; gap: 14px; }
.card-avatar { flex: none; width: 96px; height: 96px; border-radius: 50%; display: block; }
.card-avatar svg { display: block; width: 100%; height: 100%; }
.who { flex: 1; min-width: 0; }
.who h3 { margin: 0; font: 600 24px/1.15 var(--font-display); letter-spacing: -0.02em; }
.pronouns { font: 12px var(--font-mono); color: var(--muted); margin-left: 4px; letter-spacing: 0; }
.title { margin: 3px 0 0; color: var(--ink-2); font-size: 14.5px; font-weight: 500; }
.meta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font-size: 13px; color: var(--ink-2); }
.sep { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }
.uses { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.uses li { font: 12px var(--font-mono); padding: 2px 7px; border-radius: 4px; background: color-mix(in srgb, var(--seat) 10%, var(--card)); color: var(--ink-2); border: 1px solid color-mix(in srgb, var(--seat) 28%, transparent); }
blockquote { margin: 0; padding: 2px 0 2px 14px; border-left: 3px solid var(--seat); font: italic 19px/1.4 var(--font-quote); color: var(--ink); text-wrap: balance; }
.blocks { display: grid; gap: 12px; }
h4 { margin: 0 0 6px; font: 500 11px var(--font-body); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.block ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; }
.block li { position: relative; padding-left: 16px; font-size: 14px; }
.block li::before { content: ""; position: absolute; left: 2px; top: .62em; width: 6px; height: 6px; border-radius: 50%; background: var(--seat); }
.hard { padding: 12px 14px; border-radius: 8px; background: color-mix(in srgb, var(--negative) 8%, var(--card)); border: 1px solid color-mix(in srgb, var(--negative) 22%, transparent); }
.hard h4 { color: var(--negative); }
.hard li::before { border-radius: 1px; background: var(--negative); }
.blind li { color: var(--ink-2); }
.blind li::before { background: transparent; border: 1.5px solid var(--muted); }
.prose { padding-top: 14px; border-top: 1px solid var(--rule); }
.prose p { margin: 0 0 8px; font-size: 14px; color: var(--ink-2); max-width: 68ch; }
.prose p:last-child { margin-bottom: 0; }
.card-cols { display: grid; gap: 16px; }
.card-id, .card-detail { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.card-foot { margin-top: auto; display: grid; gap: 10px; padding-top: 14px; border-top: 1px dashed var(--rule-2); }
.voice { margin: 0; font-size: 13px; color: var(--ink-2); }
.voice .section-label { margin-right: 6px; }
`;
