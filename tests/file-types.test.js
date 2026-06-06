import test from "node:test";
import assert from "node:assert/strict";
import { classifyUpload, isSupportedUpload } from "../src/input-layer/file-types.js";

test("classifies video walkthrough formats", () => {
  assert.deepEqual(classifyUpload("walkthrough.MP4"), { extension: ".mp4", kind: "video" });
  assert.deepEqual(classifyUpload("walkthrough.mov"), { extension: ".mov", kind: "video" });
  assert.deepEqual(classifyUpload("walkthrough.avi"), { extension: ".avi", kind: "video" });
});

test("classifies Vital Camp exports", () => {
  assert.deepEqual(classifyUpload("scan.glb"), { extension: ".glb", kind: "vital-camp-model" });
  assert.deepEqual(classifyUpload("scan.obj"), { extension: ".obj", kind: "vital-camp-model" });
  assert.deepEqual(classifyUpload("floor.svg"), { extension: ".svg", kind: "vital-camp-floor-plan" });
  assert.deepEqual(classifyUpload("floor.dxf"), { extension: ".dxf", kind: "vital-camp-floor-plan" });
});

test("rejects unsupported file extensions", () => {
  assert.equal(isSupportedUpload("notes.txt"), false);
  assert.deepEqual(classifyUpload("notes.txt"), { extension: ".txt", kind: "unsupported" });
});
