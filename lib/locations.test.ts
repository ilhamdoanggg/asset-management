import assert from "node:assert/strict";
import { getLocations } from "./locations";

async function testLocationsQuery() {
  const locations = await getLocations();
  assert.ok(Array.isArray(locations), "must return an array");
  assert.equal(locations.length, 5, "seed has 5 locations");
  assert.ok(locations.every((l) => typeof l.asset_count === "number"), "asset_count must be a number");
  console.log("locations test passed:", { count: locations.length });
}

testLocationsQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
