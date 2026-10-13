// Print the SEAT, ORG, and PERSON blocks for one proxy, verbatim from the files.
// Usage: node scripts/identity.ts <org> <handle>
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

function read(path: string): string {
  if (!existsSync(path)) throw new Error(`File not found: ${path}`);
  return readFileSync(path, "utf8").trim();
}

function seatOf(person: string, file: string): string {
  const match = person.match(/^seat:\s*(\S+)/m);
  if (!match) throw new Error(`No seat in ${file}`);
  return match[1];
}

function main(): void {
  const [org, handle] = process.argv.slice(2);
  if (!org || !handle) throw new Error("Usage: node scripts/identity.ts <org> <handle>");
  const personFile = join(ROOT, "orgs", org, "people", `${handle}.md`);
  const person = read(personFile);
  const seat = read(join(ROOT, "seats", `${seatOf(person, personFile)}.md`));
  const orgText = read(join(ROOT, "orgs", org, "org.md"));
  console.log(`SEAT\n${seat}\n\nORG\n${orgText}\n\nPERSON\n${person}`);
}

main();
