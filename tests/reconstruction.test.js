import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    ["motion_sensor", "smart_switch", "hub"],
  );
});

test("runs deterministic MVP reconstruction pipeline without external tools", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "hads-reconstruction-"));

  try {
    const result = await runReconstructionPipeline({
      jobId: "job-123",
      uploadedFiles: [{ filename: "walkthrough.mp4", kind: "video" }],
      storageDir,
      capabilityInspector: async () => ({
        mode: "deterministic-mvp",
        externalVideoAvailable: false,
        colmapAvailable: false,
        ffmpegAvailable: false,
        pythonAvailable: true,
        opencvAvailable: false,
      }),
    });

    assert.equal(result.status, "complete");
    assert.equal(result.jobId, "job-123");
    assert.equal(result.pipelineMode, "deterministic-mvp");
    assert.equal(result.model.format, "mp4");
    assert.equal(result.externalToolPlan.enabled, false);
    assert.ok(result.recommendations.length > 0);
    assert.ok(result.billOfMaterials.estimatedTotalUsd > 0);
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("reports external local tool pipeline when COLMAP and ffmpeg are available", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "hads-reconstruction-"));

  try {
    const result = await runReconstructionPipeline({
      jobId: "job-456",
      uploadedFiles: [{ filename: "walkthrough.mp4", path: "/tmp/walkthrough.mp4", kind: "video" }],
      storageDir,
      capabilityInspector: async () => ({
        mode: "external-local-tools",
        externalVideoAvailable: true,
        colmapAvailable: true,
        ffmpegAvailable: true,
        pythonAvailable: true,
        opencvAvailable: true,
      }),
    });

    assert.equal(result.pipelineMode, "external-local-tools");
    assert.equal(result.externalToolPlan.enabled, true);
    assert.deepEqual(
      result.externalToolPlan.steps.map((step) => step.tool),
      ["ffmpeg", "colmap"],
    );
    assert.equal(result.floorPlan.features.source, "local-video-reconstruction");
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});
