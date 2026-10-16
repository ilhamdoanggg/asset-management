import assert from "node:assert/strict";
import { getDepreciationData } from "./depreciation";

async function testDepreciationQuery() {
  const data = await getDepreciationData();
  assert.ok(data, "must not be null");
  assert.ok(typeof data.summary.totalEntries === "number", "totalEntries must be a number");
  assert.ok(typeof data.summary.totalBookValue === "number", "totalBookValue must be a number");
  assert.ok(Array.isArray(data.entries), "entries must be an array");
  assert.ok(Array.isArray(data.disposals), "disposals must be an array");
  console.log("depreciation test passed:", { entries: data.entries.length });
}

testDepreciationQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
