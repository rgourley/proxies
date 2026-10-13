// Write one org, its people, its calibration logs, and the seats they use to a single JSON file.
// Usage: node scripts/export-org.ts <org> [out.json]
import { writeFileSync } from "node:fs";
import { orgBundle } from "./bundle.ts";

const ROOT = new URL("..", import.meta.url).pathname;

function main(): void {
  const [org, out] = process.argv.slice(2);
  if (!org) throw new Error("Usage: node scripts/export-org.ts <org> [out.json]");
  const target = out ?? `${org}.proxies.json`;
  const data = orgBundle(ROOT, org);
  writeFileSync(target, JSON.stringify(data, null, 2) + "\n");
  console.log(`Wrote ${target}: ${data.people.length} people, ${data.seats.length} seats, ${data.calibration.length} calibration logs`);
}

main();
