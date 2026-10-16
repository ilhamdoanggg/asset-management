import assert from "node:assert/strict";
import { getAssets, getAsset, getAssetHistory } from "./assets";

async function testAssetsQuery() {
  const assets = await getAssets();
  assert.ok(Array.isArray(assets), "must return an array");
  assert.equal(assets.length, 10, "seed has 10 assets");

  const one = await getAsset(assets[0].id);
  assert.ok(one, "getAsset must return the asset");
  assert.equal(one?.asset_code, assets[0].asset_code, "codes must match");

  const missing = await getAsset("00000000-0000-0000-0000-000000000000");
  assert.equal(missing, null, "unknown id must return null");

  const history = await getAssetHistory(assets[0].id);
  assert.ok(Array.isArray(history), "history must be an array");
  console.log("assets test passed:", { count: assets.length });
}

testAssetsQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
