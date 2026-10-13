import assert from "node:assert";
import { hashPassword, verifyPassword, signToken, verifyToken } from "./auth";
import { DICTIONARIES } from "./i18n";

function runTest() {
  const pw = "SuperSecret123!";
  const hash = hashPassword(pw);
  assert(verifyPassword(pw, hash), "Password verification should pass");
  assert(!verifyPassword("WrongPassword", hash), "Wrong password should fail");

  const user = { id: "1", username: "admin", email: "admin@example.com", role: "admin" };
  const token = signToken(user);
  const decoded = verifyToken(token);
  assert.deepStrictEqual(decoded, user, "Decoded user must match original payload");
  assert.strictEqual(verifyToken(token + "tampered"), null, "Tampered token must fail");

  // Verify i18n key parity between 'id' and 'en'
  const idKeys = Object.keys(DICTIONARIES.id).sort();
  const enKeys = Object.keys(DICTIONARIES.en).sort();
  assert.deepStrictEqual(idKeys, enKeys, "Top-level i18n keys must match");

  for (const section of idKeys as (keyof typeof DICTIONARIES.id)[]) {
    const idSectionKeys = Object.keys(DICTIONARIES.id[section]).sort();
    const enSectionKeys = Object.keys(DICTIONARIES.en[section]).sort();
    assert.deepStrictEqual(
      idSectionKeys,
      enSectionKeys,
      `Section '${section}' keys must match between id and en`
    );
  }

  console.log("Auth and i18n parity unit checks passed.");
}

runTest();
