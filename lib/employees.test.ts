import assert from "node:assert/strict";
import { getEmployees } from "./employees";

async function testEmployeesQuery() {
  const employees = await getEmployees();
  assert.ok(Array.isArray(employees), "must return an array");
  assert.equal(employees.length, 6, "seed has 6 employees");
  assert.ok(employees[0].nip.length > 0, "nip must not be empty");
  assert.ok(employees.every((e) => typeof e.asset_count === "number"), "asset_count must be a number");
  console.log("employees test passed:", { count: employees.length });
}

testEmployeesQuery()
  .then(() => process.exit(0))
  .catch((err) => {
  console.error(err);
  process.exit(1);
});
