import assert from "node:assert/strict";
import { getSoftwareLicenses } from "./licenses";

async function testLicensesQuery() {
  const licenses = await getSoftwareLicenses();
  assert.ok(Array.isArray(licenses), "must return an array");
  for (const l of licenses) {
    assert.ok(l.seats_used <= l.seats_total, "seats_used must not exceed seats_total");
    assert.equal(typeof l.is_expired, "boolean", "is_expired must be a boolean");
  }
  console.log("licenses test passed:", { count: licenses.length });
}

testLicensesQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
