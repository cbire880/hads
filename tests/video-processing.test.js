import test from "node:test";
import assert from "node:assert/strict";
import { buildExternalToolPlan, detectArchitecturalFeatures } from "../src/design-engine/video-processing.js";

const videoFile = { filename: "walkthrough.mp4", path: "/tmp/walkthrough.mp4", kind: "video" };

test("builds ffmpeg and COLMAP plan when local tools are available", () => {
  const plan = buildExternalToolPlan({
    uploadedFiles: [videoFile],
    capabilities: { externalVideoAvailable: true },
  });

  assert.equal(plan.enabled, true);
  assert.deepEqual(
    plan.steps.map((step) => step.tool),
    ["ffmpeg", "colmap"],
  );
});

test("does not build external plan without required tools", () => {
  const plan = buildExternalToolPlan({
    uploadedFiles: [videoFile],
    capabilities: { externalVideoAvailable: false },
  });

  assert.equal(plan.enabled, false);
  assert.match(plan.reason, /COLMAP and ffmpeg/);
});

test("detects richer architectural features from Vital Camp floor plans", () => {
  const features = detectArchitecturalFeatures({
    uploadedFiles: [{ filename: "floor.svg", kind: "vital-camp-floor-plan" }],
    capabilities: { externalVideoAvailable: false },
  });

  assert.equal(features.source, "vital-camp-floor-plan");
  assert.ok(features.confidence > 0.8);
  assert.deepEqual(
    features.features.map((feature) => feature.type),
    ["wall", "door", "window"],
  );
});
