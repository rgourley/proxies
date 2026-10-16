// Print the SEAT, ORG, PERSON, and EXPERTISE blocks for one person, verbatim from the files.
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

// A "knows" list is a frontmatter list of knowledge ids. An absent list is empty.
function knowsOf(text: string): string[] {
  const block = text.match(/^knows:\s*\n((?:\s+-\s+.+\n?)+)/m);
  if (!block) return [];
  return block[1].split("\n").map((l) => l.replace(/^\s*-\s*/, "").trim()).filter(Boolean);
}

// Expertise is what the person knows. The person applies it and does not review it.
function expertise(ids: string[]): string {
  if (ids.length === 0) return "";
  const parts = ids.map((id) => {
    const dir = join(ROOT, "knowledge", id);
    return `## ${id}\n${read(join(dir, "index.md"))}\n\nFull sources, if a point depends on one: ${join(dir, "sources")}/`;
  });
  return `\n\nEXPERTISE\nYou know the material below. Use it as your own knowledge, and cite it when a point depends on it. It is not what you are reviewing.\n\n${parts.join("\n\n")}`;
}

function main(): void {
  const [org, handle] = process.argv.slice(2);
  if (!org || !handle) throw new Error("Usage: node scripts/identity.ts <org> <handle>");
  const personFile = join(ROOT, "orgs", org, "people", `${handle}.md`);
  const person = read(personFile);
  const seat = read(join(ROOT, "seats", `${seatOf(person, personFile)}.md`));
  const orgText = read(join(ROOT, "orgs", org, "org.md"));
  const knows = [...new Set([...knowsOf(orgText), ...knowsOf(person)])];
  console.log(`SEAT\n${seat}\n\nORG\n${orgText}\n\nPERSON\n${person}${expertise(knows)}`);
}

main();
