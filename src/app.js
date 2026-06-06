import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JobStore, UploadValidationError } from "./input-layer/job-store.js";
import { inspectPipelineCapabilities } from "./design-engine/reconstruction.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "input-layer", "public");

async function collectUploadFiles(request) {
  const parts = request.parts();
  const files = [];

  for await (const part of parts) {
    if (part.type !== "file") {
      continue;
    }

    const bytes = await part.toBuffer();
    files.push({
      filename: part.filename,
      mimetype: part.mimetype,
      bytes,
    });
  }

  return files;
}

export function buildApp({ jobStore = new JobStore() } = {}) {
  const app = Fastify({ logger: false });
  app.register(multipart, {
    limits: {
      files: 8,
      fileSize: 1024 * 1024 * 1024,
    },
  });

  app.get("/", async (request, reply) => {
    const html = await readFile(join(publicDir, "index.html"), "utf8");
    return reply.type("text/html; charset=utf-8").send(html);
  });

  app.get("/health", async () => ({ ok: true }));

  app.get("/api/pipeline/capabilities", async () => inspectPipelineCapabilities());

  app.post("/api/upload-video", async (request, reply) => {
    try {
      const files = await collectUploadFiles(request);
      const job = await jobStore.createJob({ files });
      return reply.code(202).send(job);
    } catch (error) {
      if (error instanceof UploadValidationError) {
        return reply.code(400).send({ error: error.message });
      }

      request.log.error(error);
      return reply.code(500).send({ error: "Upload processing failed." });
    }
  });

  app.get("/api/jobs/:jobId", async (request, reply) => {
    const job = jobStore.getJob(request.params.jobId);
    if (!job) {
      return reply.code(404).send({ error: "Job not found." });
    }

    return job;
  });

  return app;
}
