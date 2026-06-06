import test from "node:test";
import assert from "node:assert/strict";
import { inspectLocalToolCapabilities } from "../src/design-engine/tool-detection.js";

test("reports external local tool mode when COLMAP and ffmpeg are available", async () => {
  const capabilities = await inspectLocalToolCapabilities({
    detector: async (name) => ["colmap", "ffmpeg", "python3"].includes(name),
    pythonModuleDetector: async (name) => name === "cv2",
  });

  assert.equal(capabilities.colmapAvailable, true);
  assert.equal(capabilities.ffmpegAvailable, true);
  assert.equal(capabilities.externalVideoAvailable, true);
  assert.equal(capabilities.mode, "external-local-tools");
});

test("falls back to deterministic MVP when external tools are unavailable", async () => {
  const capabilities = await inspectLocalToolCapabilities({
    detector: async () => false,
    pythonModuleDetector: async () => true,
  });

  assert.equal(capabilities.externalVideoAvailable, false);
  assert.equal(capabilities.mode, "deterministic-mvp");
});
