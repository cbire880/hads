import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { inspectLocalToolCapabilities, hasExecutable } from "./tool-detection.js";
import { buildExternalToolPlan, detectArchitecturalFeatures } from "./video-processing.js";
import { generateBillOfMaterials, recommendDevicePlacement } from "./device-recommendations.js";

const DEFAULT_ROOMS = [
  { id: "entry", label: "Entry", areaSqFt: 80 },
  { id: "living", label: "Living Room", areaSqFt: 240 },
  { id: "kitchen", label: "Kitchen", areaSqFt: 160 },
];

export { generateBillOfMaterials, hasExecutable, recommendDevicePlacement };

export async function inspectPipelineCapabilities(options = {}) {
  return inspectLocalToolCapabilities(options);
}

export function extractFloorPlan(uploadedFiles, { capabilities } = {}) {
  const floorPlanFile = uploadedFiles.find((file) => file.kind === "vital-camp-floor-plan");
  const source = floorPlanFile ? basename(floorPlanFile.filename) : "generated-from-reconstruction";
  const features = detectArchitecturalFeatures({
    uploadedFiles,
    capabilities: capabilities ?? { externalVideoAvailable: false },
  });

  return {
    source,
    rooms: DEFAULT_ROOMS,
    bounds: { widthFt: 40, depthFt: 28 },
    features,
  };
}

export async function runReconstructionPipeline({
  jobId,
  uploadedFiles,
  storageDir = "storage/jobs",
  capabilityInspector = inspectPipelineCapabilities,
} = {}) {
  const capabilities = await capabilityInspector();
  const modelFile = uploadedFiles.find((file) => file.kind === "vital-camp-model");
  const videoFile = uploadedFiles.find((file) => file.kind === "video");
  const sourceFile = modelFile ?? videoFile ?? uploadedFiles[0];
  const externalToolPlan = buildExternalToolPlan({ uploadedFiles, capabilities });
  const floorPlan = extractFloorPlan(uploadedFiles, { capabilities });
  const recommendations = recommendDevicePlacement(floorPlan);
  const billOfMaterials = generateBillOfMaterials(recommendations);
  const modelArtifact = join(storageDir, jobId, "model-preview.json");
  const artifactPayload = {
    jobId,
    pipelineMode: capabilities.mode,
    source: sourceFile ? basename(sourceFile.filename) : "none",
    externalToolPlan,
    floorPlan,
  };

  await mkdir(dirname(modelArtifact), { recursive: true });
  await writeFile(modelArtifact, JSON.stringify(artifactPayload, null, 2));

  return {
    jobId,
    status: "complete",
    pipelineMode: capabilities.mode,
    capabilities,
    externalToolPlan,
    model: {
      source: sourceFile ? basename(sourceFile.filename) : "none",
      format: sourceFile ? extname(sourceFile.filename).slice(1).toLowerCase() : "unknown",
      artifact: modelArtifact,
    },
    floorPlan,
    recommendations,
    billOfMaterials,
  };
}
