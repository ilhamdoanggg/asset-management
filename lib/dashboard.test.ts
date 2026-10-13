import assert from "node:assert/strict";
import { getDashboardData } from "./dashboard";

async function testDashboardQueries() {
  const data = await getDashboardData();

  assert.ok(data, "Dashboard data must not be null or undefined");
  assert.ok(typeof data.metrics.totalAssets === "number", "totalAssets must be a number");
  assert.ok(typeof data.metrics.totalAssetValue === "number", "totalAssetValue must be a number");
  assert.ok(typeof data.metrics.assignedAssets === "number", "assignedAssets must be a number");
  assert.ok(typeof data.metrics.assignedPercentage === "number", "assignedPercentage must be a number");
  assert.ok(typeof data.metrics.activeAssets === "number", "activeAssets must be a number");
  assert.ok(typeof data.metrics.activePercentage === "number", "activePercentage must be a number");
  assert.ok(typeof data.metrics.damagedAssets === "number", "damagedAssets must be a number");
  assert.ok(typeof data.metrics.damagedPercentage === "number", "damagedPercentage must be a number");
  assert.ok(typeof data.metrics.backupAssets === "number", "backupAssets must be a number");
  assert.ok(typeof data.metrics.backupPercentage === "number", "backupPercentage must be a number");
  assert.ok(typeof data.metrics.maintenancePending === "number", "maintenancePending must be a number");
  assert.ok(typeof data.metrics.maintenanceCritical === "number", "maintenanceCritical must be a number");

  assert.ok(Array.isArray(data.categoryDistribution), "categoryDistribution must be an array");
  assert.ok(Array.isArray(data.monthlyTrends), "monthlyTrends must be an array");
  assert.ok(Array.isArray(data.maintenanceCosts), "maintenanceCosts must be an array");
  assert.ok(data.maintenanceCosts.length === 6, "maintenanceCosts must cover 6 months");
  assert.ok(Array.isArray(data.recentAssets), "recentAssets must be an array");

  // Check metrics values from seeded DB
  assert.ok(data.metrics.totalAssets >= 10, "Should have at least 10 seeded assets");
  assert.ok(data.metrics.totalAssetValue > 0, "Asset value should be greater than 0");
  assert.ok(data.recentAssets.length > 0, "Should return recent assets");

  const firstAsset = data.recentAssets[0];
  assert.ok(firstAsset.code.startsWith("AST-"), "Asset code should start with AST-");
  assert.ok(firstAsset.name.length > 0, "Asset name must not be empty");
  assert.ok(firstAsset.category.length > 0, "Category name must not be empty");

  console.log("Dashboard query unit test passed successfully:", {
    totalAssets: data.metrics.totalAssets,
    totalAssetValue: data.metrics.totalAssetValue,
    assignedAssets: data.metrics.assignedAssets,
    recentCount: data.recentAssets.length,
    categoriesCount: data.categoryDistribution.length,
  });
}

testDashboardQueries()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Dashboard test failed:", err);
    process.exit(1);
  });
