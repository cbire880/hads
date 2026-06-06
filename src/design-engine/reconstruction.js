import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { basename, extname, join } from "node:path";

const DEFAULT_ROOMS = [
  { id: "entry", label: "Entry", areaSqFt: 80 },
  { id: "living", label: "Living Room", areaSqFt: 240 },
  { id: "kitchen", label: "Kitchen", areaSqFt: 160 },
];

export async function hasExecutable(name) {
  const pathParts = (process.env.PATH ?? "").split(":").filter(Boolean);

  for (const part of pathParts) {
    try {
      await access(join(part, name), constants.X_OK);
      return true;
    } catch {
      // keep searching PATH
    }
  }

  return false;
}

export async function inspectPipelineCapabilities() {
  const [colmapAvailable, pythonAvailable] = await Promise.all([
    hasExecutable("colmap"),
    hasExecutable("python3"),
  ]);

  return {
    colmapAvailable,
    pythonAvailable,
    mode: colmapAvailable ? "external-colmap" : "deterministic-mvp",
  };
}

export function extractFloorPlan(uploadedFiles) {
  const floorPlanFile = uploadedFiles.find((file) => file.kind === "vital-camp-floor-plan");
  const source = floorPlanFile ? basename(floorPlanFile.filename) : "generated-from-reconstruction";

  return {
    source,
    rooms: DEFAULT_ROOMS,
    bounds: { widthFt: 40, depthFt: 28 },
  };
}

export function recommendDevicePlacement(floorPlan) {
  const recommendations = [];

  for (const room of floorPlan.rooms) {
    recommendations.push({
      roomId: room.id,
      roomLabel: room.label,
      deviceType: "motion_sensor",
      priority: "standard",
      reason: `Baseline occupancy detection for ${room.label}.`,
    });

    if (/entry|living/i.test(room.label)) {
      recommendations.push({
        roomId: room.id,
        roomLabel: room.label,
        deviceType: "smart_switch",
        priority: "high",
        reason: `High-traffic lighting control for ${room.label}.`,
      });
    }
  }

  return recommendations;
}

export async function runReconstructionPipeline({ jobId, uploadedFiles }) {
  const capabilities = await inspectPipelineCapabilities();
  const modelFile = uploadedFiles.find((file) => file.kind === "vital-camp-model");
  const videoFile = uploadedFiles.find((file) => file.kind === "video");
  const sourceFile = modelFile ?? videoFile ?? uploadedFiles[0];
  const floorPlan = extractFloorPlan(uploadedFiles);

  return {
    jobId,
    status: "complete",
    pipelineMode: capabilities.mode,
    capabilities,
    model: {
      source: sourceFile ? basename(sourceFile.filename) : "none",
      format: sourceFile ? extname(sourceFile.filename).slice(1).toLowerCase() : "unknown",
      artifact: `storage/jobs/${jobId}/model-preview.json`,
    },
    floorPlan,
    recommendations: recommendDevicePlacement(floorPlan),
  };
}
