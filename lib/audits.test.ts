import assert from "node:assert/strict";
import { getAudits, getAuditItems } from "./audits";

async function testAuditsQuery() {
  const audits = await getAudits();
  assert.ok(Array.isArray(audits), "must return an array");
  if (audits.length > 0) {
    const items = await getAuditItems(audits[0].id);
    assert.ok(Array.isArray(items), "items must be an array");
  }
  const empty = await getAuditItems("00000000-0000-0000-0000-000000000000");
  assert.ok(Array.isArray(empty), "unknown audit must return empty array");
  console.log("audits test passed:", { count: audits.length });
}

testAuditsQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
