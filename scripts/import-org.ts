// Unpack an exported org into orgs/<org>/ and add any seats this repo does not have.
// Usage: node scripts/import-org.ts <file.json | -> [--as <new-org-id>]
// With "-", the script reads the JSON from standard input, for example: pbpaste | node scripts/import-org.ts -
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import type { OrgBundle, BundleFile } from "./bundle.ts";
import { ORGS_DIR, PROJECT, PLUGIN } from "./lib.ts";
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*\.md$/;
const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isFile(value: Json): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return typeof value.name === "string" && SAFE_NAME.test(value.name) && typeof value.text === "string";
}

function parse(path: string): OrgBundle {
  const raw: { [key: string]: Json } = JSON.parse(readFileSync(path === "-" ? 0 : path, "utf8"));
  // Version 1 files name the proxies list "people". Version 2 files name it "proxies".
  if (raw.format !== "proxies-org" || (raw.version !== 1 && raw.version !== 2)) throw new Error(`${path} is not a proxies-org v1 or v2 file (format=${String(raw.format)}, version=${String(raw.version)})`);
  if (raw.version === 1) {
    raw.proxies = raw.people;
    delete raw.people;
    raw.version = 2;
  }
  const lists = ["proxies", "calibration", "seats"] as const;
  if (typeof raw.org !== "string" || !SAFE_ID.test(raw.org)) throw new Error(`${path} has an invalid org id: ${String(raw.org)}`);
  if (typeof raw.orgFile !== "string") throw new Error(`${path} has no org.md text`);
  for (const key of lists) {
    const list = raw[key];
    if (!Array.isArray(list) || !list.every(isFile)) throw new Error(`${path} has an invalid "${key}" list. Each entry needs a lowercase .md name and text`);
  }
  return raw as OrgBundle;
}

// The org id appears in org.md and in every proxy file as "org: <id>".
function renameOrg(text: string, from: string, to: string): string {
  return text.replace(new RegExp(`^org:\\s*${from}\\s*$`, "m"), `org: ${to}`);
}

function main(): void {
  const args = process.argv.slice(2);
  const file = args[0];
  const asIndex = args.indexOf("--as");
  if (!file) throw new Error("Usage: node scripts/import-org.ts <file.json | -> [--as <new-org-id>]");
  const data = parse(file);
  const id = asIndex >= 0 ? args[asIndex + 1] : data.org;
  if (!id || !SAFE_ID.test(id)) throw new Error(`Invalid org id for --as: ${String(id)}`);

  const dir = join(ORGS_DIR, id);
  if (existsSync(dir)) throw new Error(`orgs/${id} already exists. Use --as <new-org-id> to import under another id`);

  // A seat conflicts when the project or the plugin already has a different seat with the same name.
  const existing = (name: string): string | null => [join(PROJECT, "seats", name), join(PLUGIN, "seats", name)].find((f) => existsSync(f)) ?? null;
  const conflicts = data.seats.filter((s) => {
    const local = existing(s.name);
    return local !== null && readFileSync(local, "utf8") !== s.text;
  });
  if (conflicts.length > 0) {
    throw new Error(`These seats differ from this repo's copies: ${conflicts.map((s) => s.name).join(", ")}. Reconcile seats/ before importing ${file === "-" ? "this org" : basename(file)}`);
  }

  mkdirSync(join(dir, "proxies"), { recursive: true });
  writeFileSync(join(dir, "org.md"), renameOrg(data.orgFile, data.org, id));
  for (const p of data.proxies) writeFileSync(join(dir, "proxies", p.name), renameOrg(p.text, data.org, id));
  if (data.calibration.length > 0) {
    mkdirSync(join(dir, "calibration"), { recursive: true });
    for (const c of data.calibration) writeFileSync(join(dir, "calibration", c.name), c.text);
  }
  const added = data.seats.filter((s) => existing(s.name) === null);
  if (added.length > 0) mkdirSync(join(PROJECT, "seats"), { recursive: true });
  for (const s of added) writeFileSync(join(PROJECT, "seats", s.name), s.text);

  console.log(`Imported orgs/${id}: ${data.proxies.length} proxies, ${added.length} new seats`);
}

main();
