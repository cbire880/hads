import test from "node:test";
import assert from "node:assert/strict";
import { generateBillOfMaterials, recommendDevicePlacement } from "../src/design-engine/device-recommendations.js";

test("uses detected doors and windows to expand placement recommendations", () => {
  const recommendations = recommendDevicePlacement({
    rooms: [
      { id: "entry", label: "Entry", areaSqFt: 80 },
      { id: "living", label: "Living Room", areaSqFt: 240 },
    ],
    features: {
      features: [
        { type: "door", count: 3 },
        { type: "window", count: 2 },
      ],
    },
  });

  assert.ok(recommendations.some((item) => item.deviceType === "contact_sensor"));
  assert.ok(recommendations.some((item) => item.deviceType === "indoor_camera"));
  assert.ok(recommendations.some((item) => item.deviceType === "hub"));
});

test("generates BOM with quantities and estimated totals", () => {
  const bom = generateBillOfMaterials([
    { deviceType: "motion_sensor", quantity: 2, priority: "standard" },
    { deviceType: "hub", quantity: 1, priority: "required" },
  ]);

  assert.equal(bom.currency, "USD");
  assert.deepEqual(
    bom.items.map((item) => [item.deviceType, item.quantity, item.estimatedCostUsd]),
    [
      ["motion_sensor", 2, 70],
      ["hub", 1, 120],
    ],
  );
  assert.equal(bom.estimatedTotalUsd, 190);
});
