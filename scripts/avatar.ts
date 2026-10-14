// Draw one avatar per person in the flat cut-paper style of the Proxies illustration.
// The same org and handle always give the same avatar. An "avatar_seed" field in the person file changes it.

type Rng = () => number;

type Hair = "bob" | "bun" | "ponytail" | "long" | "short" | "curls" | "scarf" | "side" | "buzz" | "bald" | "receding" | "quiff";
type Top = "blazer" | "suit" | "turtleneck" | "vneck" | "dress";
type FacialHair = "none" | "beard" | "mustache" | "stubble";
type Glasses = "none" | "round" | "square";

export type AvatarParts = {
  facing: "left" | "right";
  hair: Hair;
  top: Top;
  facialHair: FacialHair;
  glasses: Glasses;
  frameColor: string;
  broad: boolean;
  face: string;
  hairColor: string;
  topColor: string;
  accent: string;
};

// A person file can set the style exactly with "avatar_hair", "avatar_top", "avatar_facial_hair", and "avatar_glasses".
export type AvatarInput = { seed: string; pronouns: string; hair: string | null; top: string | null; facialHair: string | null; glasses: string | null };

type Pool = { hair: readonly Hair[]; top: readonly Top[]; facialHair: number; broad: boolean };

const BACKGROUND = "#1d1b19";
const SHIRT = "#efe6d2";
const FACES = ["#e0482a", "#2e6b6e", "#8a9a98", "#b8873b", "#e8762c"] as const;
const HAIR_COLORS = ["#5a2d1e", "#6b4a3a", "#b8873b", "#8a3a22", "#3f6e70"] as const;
const TOPS = ["#e0482a", "#2e6b6e", "#b8873b", "#e8762c", "#8a9a98"] as const;
// Hair in the same color family as the face blends in, so each face color excludes those hair colors.
const CLASHES: ReadonlyMap<string, readonly string[]> = new Map([
  ["#2e6b6e", ["#3f6e70"]],
  ["#b8873b", ["#b8873b", "#6b4a3a"]],
  ["#e0482a", ["#8a3a22"]],
  ["#e8762c", ["#8a3a22", "#b8873b"]],
  ["#8a9a98", ["#3f6e70"]],
]);
const HAIRS: readonly Hair[] = ["bob", "bun", "ponytail", "long", "short", "curls", "scarf", "side", "buzz", "bald", "receding", "quiff"];
const TOP_KINDS: readonly Top[] = ["blazer", "suit", "turtleneck", "vneck", "dress"];
const FACIAL_HAIRS: readonly FacialHair[] = ["none", "beard", "mustache", "stubble"];
const GLASSES: readonly Glasses[] = ["none", "round", "square"];
const BLACK_FRAME = "#1d1b19";
// A colored frame must stand out from the face, so each colored frame skips faces in its own color family.
const COLOR_FRAMES: ReadonlyMap<string, readonly string[]> = new Map([
  ["#efe6d2", []],
  ["#2e6b6e", ["#2e6b6e", "#8a9a98"]],
  ["#e0482a", ["#e0482a", "#e8762c"]],
]);

// Pronouns choose the pool for hair and tops, how often facial hair appears, and the shoulder width.
// "they/them" and any other value use every style.
const POOLS: ReadonlyMap<string, Pool> = new Map([
  ["she/her", { hair: ["bob", "bun", "ponytail", "long", "curls", "scarf", "side"], top: ["blazer", "turtleneck", "vneck", "dress"], facialHair: 0, broad: false }],
  ["he/him", { hair: ["short", "side", "curls", "buzz", "bald", "receding", "quiff"], top: ["blazer", "suit", "turtleneck", "vneck"], facialHair: 0.55, broad: true }],
]);
const ANY: Pool = { hair: HAIRS, top: TOP_KINDS, facialHair: 0.15, broad: false };

// FNV-1a gives a stable 32-bit number from a string. Mulberry32 turns it into a sequence.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rng(seed: number): Rng {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: Rng, items: readonly T[]): T {
  return items[Math.floor(r() * items.length)];
}

function pickOther<T>(r: Rng, items: readonly T[], not: T): T {
  return pick(r, items.filter((i) => i !== not));
}

function oneOf<T extends string>(value: string | null, items: readonly T[], field: string, seed: string): T | null {
  if (value === null) return null;
  const found = items.find((i) => i === value);
  if (!found) throw new Error(`Unknown ${field} "${value}" for ${seed}. Use one of ${items.join(", ")}`);
  return found;
}

export function avatarParts(input: AvatarInput): AvatarParts {
  const r = rng(hash(input.seed));
  const pool = POOLS.get(input.pronouns.trim().toLowerCase()) ?? ANY;
  const face = pick(r, FACES);
  const topColor = pickOther(r, TOPS, face);
  const facing = r() < 0.5 ? "left" : "right";
  const hair = pick(r, pool.hair);
  const top = pick(r, pool.top);
  const facialHair = r() < pool.facialHair ? pick(r, FACIAL_HAIRS.filter((f) => f !== "none")) : "none";
  const glasses: Glasses = r() < 0.2 ? (r() < 0.5 ? "round" : "square") : "none";
  // Most frames are black. About three in ten take a color from the palette that is not the face color.
  const frameColor = r() < 0.7 ? BLACK_FRAME : pick(r, [...COLOR_FRAMES].filter(([, skip]) => !skip.includes(face)).map(([color]) => color));
  return {
    facing,
    hair: oneOf(input.hair, HAIRS, "avatar_hair", input.seed) ?? hair,
    top: oneOf(input.top, TOP_KINDS, "avatar_top", input.seed) ?? top,
    facialHair: oneOf(input.facialHair, FACIAL_HAIRS, "avatar_facial_hair", input.seed) ?? facialHair,
    glasses: oneOf(input.glasses, GLASSES, "avatar_glasses", input.seed) ?? glasses,
    frameColor,
    broad: pool.broad,
    face,
    hairColor: pick(r, HAIR_COLORS.filter((h) => !CLASHES.get(face)?.includes(h))),
    topColor,
    accent: pickOther(r, TOPS, topColor),
  };
}

// The figure is drawn facing left, with the nose on the left and the back of the head on the right.
// The skull is the curve from (40, 30) over (50, 19) to (60, 30). Every hair cap starts just outside that curve,
// so no skin shows above the hair, and ends at a hairline below it.
const SKULL = "M38.6 30.5 Q38.4 17.6 50 17.4 Q61.6 17.6 61.6 31";

// Curls sit as circles along the skull curve, from the forehead over the top to the back.
function curls(color: string): string {
  const dots = [200, 222, 245, 268, 292, 316, 340, 4, 28].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return `<circle cx="${(50 + 11.6 * Math.cos(a)).toFixed(1)}" cy="${(30 + 11.6 * Math.sin(a)).toFixed(1)}" r="4.6"/>`;
  });
  return `<g fill="${color}">${dots.join("")}<path d="${SKULL} L61.6 34 L57 31 Q50 27 41 31 Z"/></g>`;
}

function hairBehind(p: AvatarParts): string {
  switch (p.hair) {
    case "bun":
      return `<circle cx="61.5" cy="21.5" r="6" fill="${p.hairColor}"/>`;
    case "ponytail":
      return `<circle cx="62" cy="29" r="4.5" fill="${p.hairColor}"/><path d="M60.5 30 L68 33 L65.5 54 L59.5 50 Z" fill="${p.hairColor}"/>`;
    case "long":
      return `<path d="M44 17 Q63.5 16 63.6 31 L65.5 68 L53 68 L54 46 L52 32 Z" fill="${p.hairColor}"/>`;
    case "bob":
      return `<path d="M44 17 Q63.2 16 63.2 31 L63.6 50 L54.5 50 L55 42 L52 32 Z" fill="${p.hairColor}"/>`;
    default:
      return "";
  }
}

function hairFront(p: AvatarParts): string {
  const c = p.hairColor;
  switch (p.hair) {
    case "bob":
      return `<path d="${SKULL} L57 31 Q50 26.5 40.8 32 Z" fill="${c}"/>`;
    case "long":
      return `<path d="${SKULL} L57.5 30.5 Q50 25.5 40.8 30.5 Z" fill="${c}"/>`;
    case "bun":
    case "ponytail":
      return `<path d="${SKULL} L61.6 36 L58.2 35 Q52 25 40.6 31 Z" fill="${c}"/>`;
    case "short":
      return `<path d="${SKULL} L61.6 39 L58.5 38 L57.5 31 Q50 25.5 40.6 30.5 Z" fill="${c}"/>`;
    case "buzz":
      return `<path d="${SKULL} L61.6 38 L58.5 37 L57.8 30.5 Q50 24.5 40.4 29.5 Z" fill="${c}" opacity=".7"/>`;
    case "side":
      return `<path d="M38.2 32 Q37.6 17 50 16.8 Q62 17 61.8 31 L61.8 39 L58.5 38 L57.5 30.5 Q53 26 46 27 Q42 28 40.4 32.5 Z" fill="${c}"/>`;
    case "quiff":
      return `<path d="M38 29.5 Q35.5 12.5 49 12.6 Q62.4 14 61.8 31 L61.8 39 L58.5 38 L57.5 31 Q50 25 40.6 29.8 Z" fill="${c}"/>`;
    case "receding":
      return `<path d="M51 19.3 Q61.6 19.5 61.8 31 L61.8 39 L58.5 38 L57.5 30 Q56.5 22.5 51 21 Z" fill="${c}"/>`;
    case "bald":
      return `<path d="M58.4 30.5 Q61.7 31 61.7 33 L61.7 40 L58.5 39 Z" fill="${c}"/>`;
    case "curls":
      return curls(c);
    case "scarf":
      return `<path d="M37.2 33 Q36 14.5 50 14.2 Q64 14.5 64 32 L64 52 Q58 56 52 54 L53.5 46 L58 44 L57.5 31 Q51 25.5 41.5 32.5 Z" fill="${p.accent}"/>`;
  }
}

function facialHair(p: AvatarParts): string {
  switch (p.facialHair) {
    case "beard":
      return `<path d="M41 39 L52 37 L60 40 L60 45 Q55 51 47 49 L43 45 Z" fill="${p.hairColor}"/>`;
    case "stubble":
      return `<path d="M41 39 L52 37 L60 40 L60 45 Q55 51 47 49 L43 45 Z" fill="${p.hairColor}" opacity=".4"/>`;
    case "mustache":
      return `<path d="M40 39.5 L47 38.5 L47.5 41 L41 41.8 Z" fill="${p.hairColor}"/>`;
    case "none":
      return "";
  }
}

// One lens, centered at (cx, cy), with half-width w and half-height h.
function lens(shape: Glasses, cx: number, cy: number, w: number, h: number): string {
  return shape === "square"
    ? `<rect x="${cx - w}" y="${cy - h}" width="${2 * w}" height="${2 * h}" rx="${(w * 0.35).toFixed(2)}"/>`
    : `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${h}"/>`;
}

function glasses(p: AvatarParts): string {
  if (p.glasses === "none") return "";
  // The face turns slightly toward the viewer. The far lens is a smaller copy of the near lens, offset toward the nose.
  const near = p.glasses === "square" ? lens("square", 48.6, 32.3, 2.8, 2.5) : lens("round", 48.6, 32.3, 2.6, 2.9);
  const far = p.glasses === "square" ? lens("square", 41.9, 32.5, 2.25, 2.05) : lens("round", 41.9, 32.5, 2.1, 2.4);
  return `<g fill="none" stroke="${p.frameColor}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${near}${far}<path d="M44.2 32.2 Q45 31.3 45.8 32"/><path d="M51.4 31.8 L58.2 31"/></g>`;
}

function top(p: AvatarParts): string {
  const body = p.broad ? "M26 100 L31 63 Q50 57 69 63 L74 100 Z" : "M30 100 L34 64 Q50 58 66 64 L70 100 Z";
  switch (p.top) {
    case "blazer":
      return `<path d="${body}" fill="${p.topColor}"/><path d="M46 62 L50 82 L54 62 Z" fill="${SHIRT}"/>`;
    case "suit":
      return `<path d="${body}" fill="${p.topColor}"/><path d="M45 62 L50 86 L55 62 Z" fill="${SHIRT}"/><path d="M48.6 63 L51.4 63 L52.4 79 L50 82 L47.6 79 Z" fill="${p.accent}"/>`;
    case "turtleneck":
      return `<path d="${body}" fill="${p.topColor}"/><rect x="44" y="55" width="12" height="9" rx="2" fill="${p.topColor}"/>`;
    case "vneck":
      return `<path d="${body}" fill="${p.topColor}"/><path d="M45 62 L50 74 L55 62 Z" fill="${p.face}"/>`;
    case "dress":
      return `<path d="M26 100 L40 63 Q50 60 60 63 L74 100 Z" fill="${p.topColor}"/>`;
  }
}

// The drawing inside the avatar. The filter id must be unique on the page.
function drawing(input: AvatarInput, filterId: string): string {
  const p = avatarParts(input);
  const flip = p.facing === "right" ? ` transform="translate(100 0) scale(-1 1)"` : "";
  const neck = `<rect x="45" y="46" width="10" height="16" fill="${p.face}" opacity=".85"/>`;
  const head = `<path d="M40 30 Q40 20 50 19 Q60 20 60 30 L60 45 Q55 49 47 47 L44 44 L38 41 L41 37 L39 35 Z" fill="${p.face}"/>`;
  // The outer transform crops the figure to head and shoulders, so it reads at small sizes.
  return `<defs><filter id="${filterId}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="${hash(input.seed) % 997}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
<rect width="100" height="100" fill="${BACKGROUND}"/>
<g transform="translate(50 53) scale(1.4) translate(-50 -46)"><g${flip}>${hairBehind(p)}${top(p)}${neck}${head}${facialHair(p)}${hairFront(p)}${glasses(p)}</g></g>
<rect width="100" height="100" filter="url(#${filterId})"/>`;
}

// A standalone avatar, for files and previews. The instance makes its filter id unique when several share a page.
// The circle comes from CSS border-radius, so no clip id is needed.
export function avatarSvg(input: AvatarInput, size: number, instance: string): string {
  const id = `g${hash(input.seed).toString(36)}${instance}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" style="border-radius:50%;overflow:hidden" role="img" aria-hidden="true">${drawing(input, id)}</svg>`;
}

// One reusable avatar for a page. Every place that shows the person points at this symbol with <use>.
export function avatarSymbol(input: AvatarInput, id: string): string {
  return `<symbol id="${id}" viewBox="0 0 100 100">${drawing(input, `${id}-grain`)}</symbol>`;
}
