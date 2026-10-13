import assert from "node:assert";
import {
  THEME_COLORS,
  THEME_RADII,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_RADIUS,
  DEFAULT_THEME_MODE,
  isThemeColor,
  isThemeRadius,
  isThemeMode,
} from "./themes";

function runThemeTests() {
  // Test theme colors definition
  const colorNames = THEME_COLORS.map((c) => c.name);
  assert(colorNames.includes("zinc"), "zinc color must be defined");
  assert(colorNames.includes("blue"), "blue color must be defined");
  assert(colorNames.includes("emerald"), "emerald color must be defined");
  assert(colorNames.includes("violet"), "violet color must be defined");
  assert(colorNames.includes("rose"), "rose color must be defined");
  assert(colorNames.includes("amber"), "amber color must be defined");
  assert(colorNames.includes("cyan"), "cyan color must be defined");

  // Test isThemeColor
  assert(isThemeColor("blue"), "'blue' must be a valid theme color");
  assert(isThemeColor("emerald"), "'emerald' must be a valid theme color");
  assert(!isThemeColor("neon-pink"), "'neon-pink' must not be a valid theme color");
  assert(!isThemeColor(null), "null must not be a valid theme color");

  // Test isThemeRadius
  assert(isThemeRadius("0"), "'0' must be a valid radius");
  assert(isThemeRadius("0.625"), "'0.625' must be a valid radius");
  assert(!isThemeRadius("999"), "'999' must not be a valid radius");

  // Test isThemeMode
  assert(isThemeMode("light"), "'light' must be a valid theme mode");
  assert(isThemeMode("dark"), "'dark' must be a valid theme mode");
  assert(isThemeMode("system"), "'system' must be a valid theme mode");
  assert(!isThemeMode("random"), "'random' must not be a valid theme mode");

  // Test defaults
  assert.strictEqual(DEFAULT_THEME_COLOR, "zinc");
  assert.strictEqual(DEFAULT_THEME_RADIUS, "0.625");
  assert.strictEqual(DEFAULT_THEME_MODE, "system");

  console.log("Theme configuration unit tests passed successfully.");
}

runThemeTests();
