import assert from "node:assert/strict";
import { getMaintenanceCategories } from "./maintenance-categories";

async function testMaintenanceCategoriesQuery() {
  const categories = await getMaintenanceCategories();
  assert.ok(Array.isArray(categories), "must return an array");
  assert.ok(categories.length >= 4, "seed has at least 4 maintenance categories");
  assert.ok(categories.every((c) => typeof c.usage_count === "number"), "usage_count must be a number");
  console.log("maintenance-categories test passed:", { count: categories.length });
}

testMaintenanceCategoriesQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
