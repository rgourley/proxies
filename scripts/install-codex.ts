// Install Proxies for Codex. The script links the skill into ~/.agents/skills and writes one Codex custom agent per file in agents/.
// Usage: node scripts/install-codex.ts. Run it again after you pull, so the agents stay current.
import { readFileSync, readdirSync, lstatSync, readlinkSync, symlinkSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { PLUGIN, parse, text } from "./lib.ts";

const SKILL_SOURCE = join(PLUGIN, "skills", "proxies");
const SKILL_LINK = join(homedir(), ".agents", "skills", "proxies");
const AGENTS_DIR = join(homedir(), ".codex", "agents");

// The link must point at this repo's skill. Any other file or link at that path stops the install, so nothing is overwritten.
function linkSkill(): void {
  mkdirSync(join(homedir(), ".agents", "skills"), { recursive: true });
  const present = readdirSync(join(homedir(), ".agents", "skills")).includes("proxies");
  if (!present) {
    symlinkSync(SKILL_SOURCE, SKILL_LINK);
    return;
  }
  const isOurLink = lstatSync(SKILL_LINK).isSymbolicLink() && readlinkSync(SKILL_LINK) === SKILL_SOURCE;
  if (!isOurLink) throw new Error(`${SKILL_LINK} already exists and does not point to ${SKILL_SOURCE}. Move it, then run this script again`);
}

// A Codex custom agent is a TOML file with name, description, and developer_instructions.
// The instructions are a literal multi-line string, so the body needs no escaping unless it holds three single quotes.
function codexAgent(file: string): { name: string; toml: string } {
  const source = readFileSync(file, "utf8");
  const { fields, body } = parse(source, file);
  if (body.includes("'''")) throw new Error(`${file} contains three single quotes, which a TOML literal string cannot hold`);
  const name = text(fields, "name", file);
  const description = text(fields, "description", file).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return { name, toml: `name = "${name}"\ndescription = "${description}"\ndeveloper_instructions = '''\n${body}\n'''\n` };
}

function main(): void {
  linkSkill();
  mkdirSync(AGENTS_DIR, { recursive: true });
  const written = readdirSync(join(PLUGIN, "agents"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const agent = codexAgent(join(PLUGIN, "agents", f));
      writeFileSync(join(AGENTS_DIR, `${agent.name}.toml`), agent.toml);
      return agent.name;
    });
  console.log(`Linked ${SKILL_LINK} -> ${SKILL_SOURCE}`);
  console.log(`Wrote Codex agents to ${AGENTS_DIR}: ${written.join(", ")}`);
}

main();
