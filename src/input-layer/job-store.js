import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { classifyUpload, isSupportedUpload } from "./file-types.js";
import { runReconstructionPipeline } from "../design-engine/reconstruction.js";

export class UploadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export class JobStore {
  constructor({ storageDir = "storage/jobs" } = {}) {
    this.storageDir = storageDir;
    this.jobs = new Map();
  }

  async createJob({ files }) {
    if (!files?.length) {
      throw new UploadValidationError("At least one video or Vital Camp export is required.");
    }

    const unsupported = files.filter((file) => !isSupportedUpload(file.filename));
    if (unsupported.length > 0) {
      throw new UploadValidationError(
        `Unsupported file type: ${unsupported.map((file) => file.filename).join(", ")}`,
      );
    }

    const jobId = randomUUID();
    const jobDir = join(this.storageDir, jobId);
    await mkdir(jobDir, { recursive: true });

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      mimetype: file.mimetype,
      bytes: file.bytes.length,
      path: join(jobDir, file.filename),
      ...classifyUpload(file.filename),
    }));

    await Promise.all(
      files.map((file, index) => writeFile(uploadedFiles[index].path, file.bytes)),
    );

    const job = {
      id: jobId,
      status: "queued",
      progress: 0,
      uploadedFiles,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    await this.processJob(jobId);
    return this.getJob(jobId);
  }

  getJob(jobId) {
    return this.jobs.get(jobId) ?? null;
  }

  async processJob(jobId) {
    const job = this.getJob(jobId);
    if (!job) {
      return null;
    }

    this.updateJob(jobId, { status: "processing", progress: 35 });

    try {
      const result = await runReconstructionPipeline({
        jobId,
        uploadedFiles: job.uploadedFiles,
        storageDir: this.storageDir,
      });
      this.updateJob(jobId, { status: "complete", progress: 100, result });
    } catch (error) {
      this.updateJob(jobId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return this.getJob(jobId);
  }

  updateJob(jobId, patch) {
    const job = this.getJob(jobId);
    if (!job) {
      return null;
    }

    const updated = {
      ...job,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.jobs.set(jobId, updated);
    return updated;
  }
}
