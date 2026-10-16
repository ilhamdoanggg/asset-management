import assert from "node:assert/strict";
import { getCategories } from "./categories";

async function testCategoriesQuery() {
  const categories = await getCategories();
  assert.ok(Array.isArray(categories), "must return an array");
  assert.equal(categories.length, 5, "seed has 5 categories");
  assert.ok(categories.every((c) => typeof c.asset_value === "number"), "asset_value must be a number");
  console.log("categories test passed:", { count: categories.length });
}

testCategoriesQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
