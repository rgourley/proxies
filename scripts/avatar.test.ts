// Checks the avatar generator against every person in the repo, plus the rules for pronouns and overrides.
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { avatarParts, avatarSvg } from "./avatar.ts";
import { readOrgs } from "./lib.ts";

const people = readOrgs().flatMap((org) => org.people);

test("the same person always gets the same avatar", () => {
  for (const p of people) {
    assert.equal(avatarSvg(p.avatar, 100, "a"), avatarSvg(p.avatar, 100, "a"), p.avatar.seed);
  }
});

test("every person in every org draws an avatar", () => {
  assert.ok(people.length > 0);
  for (const p of people) {
    const svg = avatarSvg(p.avatar, 100, "x");
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/, p.avatar.seed);
  }
});

test("pronouns choose the styles", () => {
  for (let i = 0; i < 300; i++) {
    const he = avatarParts({ seed: `he/${i}`, pronouns: "he/him", hair: null, top: null, facialHair: null, glasses: null });
    assert.ok(!["bob", "bun", "ponytail", "long", "scarf"].includes(he.hair), `he/him got ${he.hair}`);
    assert.notEqual(he.top, "dress");
    const she = avatarParts({ seed: `she/${i}`, pronouns: "she/her", hair: null, top: null, facialHair: null, glasses: null });
    assert.ok(!["buzz", "bald", "receding", "quiff"].includes(she.hair), `she/her got ${she.hair}`);
    assert.equal(she.facialHair, "none");
    assert.notEqual(she.top, "suit");
  }
});

test("overrides set the style, and an unknown value is an error", () => {
  const set = avatarParts({ seed: "o/1", pronouns: "she/her", hair: "bun", top: "turtleneck", facialHair: "none", glasses: "square" });
  assert.equal(set.hair, "bun");
  assert.equal(set.top, "turtleneck");
  assert.equal(set.glasses, "square");
  assert.throws(() => avatarParts({ seed: "o/2", pronouns: "he/him", hair: "mohawk", top: null, facialHair: null, glasses: null }), /Unknown avatar_hair "mohawk"/);
  assert.throws(() => avatarParts({ seed: "o/3", pronouns: "he/him", hair: null, top: null, facialHair: null, glasses: "monocle" }), /Unknown avatar_glasses "monocle"/);
});

test("a new seed gives a different avatar", () => {
  const a = avatarSvg({ seed: "s/1", pronouns: "they/them", hair: null, top: null, facialHair: null, glasses: null }, 100, "a");
  const b = avatarSvg({ seed: "s/2", pronouns: "they/them", hair: null, top: null, facialHair: null, glasses: null }, 100, "a");
  assert.notEqual(a, b);
});

test("each copy on a page has its own filter id and no clip reference", () => {
  const input = people[0].avatar;
  const first = avatarSvg(input, 100, "i1");
  const second = avatarSvg(input, 100, "i2");
  const id = (svg: string): string => svg.match(/filter id="([^"]+)"/)?.[1] ?? "";
  assert.notEqual(id(first), id(second));
  assert.doesNotMatch(first, /clip-path|clipPath/);
});
