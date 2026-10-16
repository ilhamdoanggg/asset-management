import assert from "node:assert/strict";
import { getReportsData } from "./reports";

async function testReportsQuery() {
  const data = await getReportsData();
  assert.ok(data, "must not be null");
  assert.ok(Array.isArray(data.computers), "computers must be an array");
  assert.ok(Array.isArray(data.categoryValuations), "categoryValuations must be an array");
  assert.ok(Array.isArray(data.recentHistory), "recentHistory must be an array");
  assert.ok(typeof data.metrics.totalAssets === "number", "metrics.totalAssets must be a number");
  console.log("reports test passed:", { computers: data.computers.length });
}

testReportsQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
