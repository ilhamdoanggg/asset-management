import assert from "node:assert/strict";
import { getDepartments } from "./departments";

async function testDepartmentsQuery() {
  const departments = await getDepartments();
  assert.ok(Array.isArray(departments), "must return an array");
  assert.equal(departments.length, 5, "seed has 5 departments");
  assert.ok(departments.every((d) => typeof d.member_count === "number"), "member_count must be a number");
  console.log("departments test passed:", { count: departments.length });
}

testDepartmentsQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
