// The shape of an exported org, and the function that builds one. Every file is kept as its exact markdown text.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ORGS_DIR, seatFile } from "./lib.ts";

export type BundleFile = { name: string; text: string };

export type OrgBundle = {
  format: "proxies-org";
  version: 2;
  org: string;
  orgFile: string;
  proxies: BundleFile[];
  calibration: BundleFile[];
  seats: BundleFile[];
};

function mdFiles(dir: string): BundleFile[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({ name: f, text: readFileSync(join(dir, f), "utf8") }));
}

function seatOf(proxy: BundleFile): string {
  const match = proxy.text.match(/^seat:\s*(\S+)/m);
  if (!match) throw new Error(`No seat in proxy file ${proxy.name}`);
  return match[1];
}

export function orgBundle(org: string): OrgBundle {
  const dir = join(ORGS_DIR, org);
  const orgFile = join(dir, "org.md");
  if (!existsSync(orgFile)) throw new Error(`Org not found: ${orgFile}`);
  const proxies = mdFiles(join(dir, "proxies"));
  if (proxies.length === 0) throw new Error(`Org ${org} has no proxies in ${join(dir, "proxies")}`);
  const seatIds = [...new Set(proxies.map(seatOf))].sort();
  const seats = seatIds.map((id) => ({ name: `${id}.md`, text: readFileSync(seatFile(id), "utf8") }));
  return {
    format: "proxies-org",
    version: 2,
    org,
    orgFile: readFileSync(orgFile, "utf8"),
    proxies,
    calibration: mdFiles(join(dir, "calibration")),
    seats,
  };
}
