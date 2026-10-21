// Write one org, its proxies, its calibration logs, and the seats they use to a single JSON file.
// Usage: node export-org.ts <org> [out.json]. Run it from the project folder.
import { writeFileSync } from "node:fs";
import { orgBundle } from "./bundle.ts";

function main(): void {
  const [org, out] = process.argv.slice(2);
  if (!org) throw new Error("Usage: node scripts/export-org.ts <org> [out.json]");
  const target = out ?? `${org}.proxies.json`;
  const data = orgBundle(org);
  writeFileSync(target, JSON.stringify(data, null, 2) + "\n");
  console.log(`Wrote ${target}: ${data.proxies.length} proxies, ${data.seats.length} seats, ${data.calibration.length} calibration logs`);
}

main();
