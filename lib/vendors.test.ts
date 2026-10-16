import assert from "node:assert/strict";
import { getVendors } from "./vendors";

async function testVendorsQuery() {
  const vendors = await getVendors();
  assert.ok(Array.isArray(vendors), "must return an array");
  assert.equal(vendors.length, 6, "seed has 6 vendors");
  assert.ok(vendors[0].id.length > 0, "id must be a UUID string");
  assert.ok(vendors[0].name.length > 0, "name must not be empty");
  console.log("vendors test passed:", { count: vendors.length });
}

testVendorsQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
