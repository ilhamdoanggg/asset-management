import assert from "node:assert/strict";
import { getInsurancePolicies } from "./insurances";

async function testInsurancesQuery() {
  const policies = await getInsurancePolicies();
  assert.ok(Array.isArray(policies), "must return an array");
  for (const p of policies) {
    assert.equal(typeof p.is_active, "boolean", "is_active must be a boolean");
    assert.equal(typeof p.premium, "number", "premium must be a number");
  }
  console.log("insurances test passed:", { count: policies.length });
}

testInsurancesQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
