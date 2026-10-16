import assert from "node:assert/strict";
import { getMaintenances } from "./maintenance";

async function testMaintenanceQuery() {
  const rows = await getMaintenances();
  assert.ok(Array.isArray(rows), "must return an array");
  assert.equal(rows.length, 4, "seed has 4 maintenance records");
  assert.ok(rows.every((r) => typeof r.cost === "number"), "cost must be a number");
  console.log("maintenance test passed:", { count: rows.length });
}

testMaintenanceQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
