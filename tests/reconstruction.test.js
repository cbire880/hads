import test from "node:test";
import assert from "node:assert/strict";
import { extractFloorPlan, recommendDevicePlacement, runReconstructionPipeline } from "../src/design-engine/reconstruction.js";

test("extracts floor plan from Vital Camp floor-plan export when present", () => {
  const floorPlan = extractFloorPlan([
    { filename: "home.glb", kind: "vital-camp-model" },
    { filename: "home.svg", kind: "vital-camp-floor-plan" },
  ]);

  assert.equal(floorPlan.source, "home.svg");
  assert.ok(floorPlan.rooms.length >= 1);
});

test("recommends baseline devices for extracted rooms", () => {
  const recommendations = recommendDevicePlacement({
    rooms: [{ id: "living", label: "Living Room", areaSqFt: 200 }],
  });

  assert.deepEqual(
    recommendations.map((recommendation) => recommendation.deviceType),
    ["motion_sensor", "smart_switch"],
  );
});

test("runs deterministic MVP reconstruction pipeline without external tools", async () => {
  const result = await runReconstructionPipeline({
    jobId: "job-123",
    uploadedFiles: [{ filename: "walkthrough.mp4", kind: "video" }],
  });

  assert.equal(result.status, "complete");
  assert.equal(result.jobId, "job-123");
  assert.equal(result.model.format, "mp4");
  assert.ok(result.recommendations.length > 0);
});
