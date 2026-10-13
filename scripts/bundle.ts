// The shape of an exported org, and the function that builds one. Every file is kept as its exact markdown text.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export type BundleFile = { name: string; text: string };

export type OrgBundle = {
  format: "proxies-org";
  version: 1;
  org: string;
  orgFile: string;
  people: BundleFile[];
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

function seatOf(person: BundleFile): string {
  const match = person.text.match(/^seat:\s*(\S+)/m);
  if (!match) throw new Error(`No seat in person file ${person.name}`);
  return match[1];
}

export function orgBundle(root: string, org: string): OrgBundle {
  const dir = join(root, "orgs", org);
  const orgFile = join(dir, "org.md");
  if (!existsSync(orgFile)) throw new Error(`Org not found: ${orgFile}`);
  const people = mdFiles(join(dir, "people"));
  if (people.length === 0) throw new Error(`Org ${org} has no people in ${join(dir, "people")}`);
  const seatIds = [...new Set(people.map(seatOf))].sort();
  const seats = seatIds.map((id) => {
    const file = join(root, "seats", `${id}.md`);
    if (!existsSync(file)) throw new Error(`Seat ${id} is used by org ${org} but ${file} does not exist`);
    return { name: `${id}.md`, text: readFileSync(file, "utf8") };
  });
  return {
    format: "proxies-org",
    version: 1,
    org,
    orgFile: readFileSync(orgFile, "utf8"),
    people,
    calibration: mdFiles(join(dir, "calibration")),
    seats,
  };
}
