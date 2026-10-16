import assert from "node:assert";
import sql from "./db";
import { hashPassword } from "./auth";
import {
  isThemeColor,
  isThemeRadius,
  isThemeMode,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_RADIUS,
  DEFAULT_THEME_MODE,
} from "./themes";

async function runUserThemeTest() {
  const testUsername = `themetest_${Date.now()}`;
  const testEmail = `${testUsername}@example.com`;
  const passwordHash = hashPassword("TestPass123!");

  try {
    // 1. Insert user with specific theme preference (e.g. emerald, 0.75, dark)
    const [created] = await sql`
      INSERT INTO users (
        username, email, password_hash, role, status,
        theme_color, theme_radius, theme_mode, last_login_at
      )
      VALUES (
        ${testUsername}, ${testEmail}, ${passwordHash}, 'user', 'active',
        'emerald', '0.75', 'dark', CURRENT_TIMESTAMP
      )
      RETURNING id, username, email, theme_color, theme_radius, theme_mode
    `;

    assert(created, "User must be created");
    assert.strictEqual(created.theme_color, "emerald");
    assert.strictEqual(created.theme_radius, "0.75");
    assert.strictEqual(created.theme_mode, "dark");

    // 2. Simulate login query: retrieve saved theme from DB
    const [fetched] = await sql`
      SELECT id, theme_color, theme_radius, theme_mode
      FROM users
      WHERE id = ${created.id}
    `;

    const userThemeColor = isThemeColor(fetched.theme_color)
      ? fetched.theme_color
      : DEFAULT_THEME_COLOR;
    const userThemeRadius = isThemeRadius(fetched.theme_radius)
      ? fetched.theme_radius
      : DEFAULT_THEME_RADIUS;
    const userThemeMode = isThemeMode(fetched.theme_mode)
      ? fetched.theme_mode
      : DEFAULT_THEME_MODE;

    assert.strictEqual(userThemeColor, "emerald");
    assert.strictEqual(userThemeRadius, "0.75");
    assert.strictEqual(userThemeMode, "dark");

    // 3. Simulate updating theme preference to 'rose', '1.0', 'light'
    await sql`
      UPDATE users
      SET
        theme_color = 'rose',
        theme_radius = '1.0',
        theme_mode = 'light',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${created.id}
    `;

    const [updated] = await sql`
      SELECT theme_color, theme_radius, theme_mode
      FROM users
      WHERE id = ${created.id}
    `;

    assert.strictEqual(updated.theme_color, "rose");
    assert.strictEqual(updated.theme_radius, "1.0");
    assert.strictEqual(updated.theme_mode, "light");

    // 4. Test fallback to defaults if corrupt/invalid values are encountered
    const fallbackColor = isThemeColor("invalid_color")
      ? "invalid_color"
      : DEFAULT_THEME_COLOR;
    const fallbackRadius = isThemeRadius("999")
      ? "999"
      : DEFAULT_THEME_RADIUS;
    const fallbackMode = isThemeMode("unknown_mode")
      ? "unknown_mode"
      : DEFAULT_THEME_MODE;

    assert.strictEqual(fallbackColor, DEFAULT_THEME_COLOR);
    assert.strictEqual(fallbackRadius, DEFAULT_THEME_RADIUS);
    assert.strictEqual(fallbackMode, DEFAULT_THEME_MODE);

    console.log("User theme DB persistence and login retrieval tests passed successfully.");
  } finally {
    // Clean up test user
    await sql`DELETE FROM users WHERE username = ${testUsername}`;
    await sql.end();
  }
}

runUserThemeTest()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
