import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./auth";

async function runSettingsTests() {
  // Test password hashing and verification flow
  const rawPassword = "password123";
  const hashedPassword = hashPassword(rawPassword);
  assert.ok(verifyPassword(rawPassword, hashedPassword), "Password verification should pass");
  assert.ok(!verifyPassword("wrongpass", hashedPassword), "Wrong password should fail");

  console.log("Settings security unit tests passed successfully.");
  process.exit(0);
}

runSettingsTests().catch((err) => {
  console.error("Settings tests failed:", err);
  process.exit(1);
});
