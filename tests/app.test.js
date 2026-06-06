import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildApp } from "../src/app.js";
import { JobStore } from "../src/input-layer/job-store.js";

async function withApp(testFn) {
  const storageDir = await mkdtemp(join(tmpdir(), "hads-test-"));
  const app = buildApp({ jobStore: new JobStore({ storageDir }) });
  try {
    await app.ready();
    await testFn(app);
  } finally {
    await app.close();
    await rm(storageDir, { recursive: true, force: true });
  }
}

test("serves upload interface", async () => {
  await withApp(async (app) => {
    const response = await app.inject({ method: "GET", url: "/" });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /HADS Video \+ Vital Camp Upload/);
  });
});

test("reports local pipeline capabilities", async () => {
  await withApp(async (app) => {
    const response = await app.inject({ method: "GET", url: "/api/pipeline/capabilities" });
    const capabilities = JSON.parse(response.body);

    assert.equal(response.statusCode, 200);
    assert.ok(["deterministic-mvp", "external-local-tools"].includes(capabilities.mode));
    assert.equal(typeof capabilities.externalVideoAvailable, "boolean");
  });
});

test("accepts Vital Camp exports and exposes completed job status", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/upload-video",
      headers: {
        "content-type": "multipart/form-data; boundary=boundary",
      },
      payload: [
        "--boundary",
        'Content-Disposition: form-data; name="files"; filename="home.glb"',
        "Content-Type: model/gltf-binary",
        "",
        "fake glb",
        "--boundary",
        'Content-Disposition: form-data; name="files"; filename="home.svg"',
        "Content-Type: image/svg+xml",
        "",
        "<svg></svg>",
        "--boundary--",
        "",
      ].join("\r\n"),
    });

    assert.equal(response.statusCode, 202);
    const job = JSON.parse(response.body);
    assert.equal(job.status, "complete");
    assert.equal(job.progress, 100);
    assert.equal(job.uploadedFiles.length, 2);
    assert.equal(job.result.floorPlan.source, "home.svg");
    assert.ok(job.result.billOfMaterials.estimatedTotalUsd > 0);

    const statusResponse = await app.inject({ method: "GET", url: `/api/jobs/${job.id}` });
    assert.equal(statusResponse.statusCode, 200);
    assert.equal(JSON.parse(statusResponse.body).id, job.id);
  });
});

test("rejects unsupported upload extensions", async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/upload-video",
      headers: {
        "content-type": "multipart/form-data; boundary=boundary",
      },
      payload: [
        "--boundary",
        'Content-Disposition: form-data; name="files"; filename="notes.txt"',
        "Content-Type: text/plain",
        "",
        "not supported",
        "--boundary--",
        "",
      ].join("\r\n"),
    });

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /Unsupported file type/);
  });
});
