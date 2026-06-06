import { basename, extname, join } from "node:path";

export function buildFrameExtractionPlan(videoFile, { frameRate = 1, maxFrames = 120 } = {}) {
  const baseName = basename(videoFile.filename, extname(videoFile.filename));

  return {
    tool: "ffmpeg",
    input: videoFile.path,
    outputPattern: join("frames", `${baseName}-%04d.jpg`),
    frameRate,
    maxFrames,
    commandPreview: [
      "ffmpeg",
      "-i",
      videoFile.path,
      "-vf",
      `fps=${frameRate}`,
      join("frames", `${baseName}-%04d.jpg`),
    ],
  };
}

export function buildColmapPlan(videoFile) {
  return {
    tool: "colmap",
    workspace: "colmap-workspace",
    steps: [
      "feature_extractor",
      "exhaustive_matcher",
      "mapper",
      "model_converter",
    ],
    input: videoFile.path,
    outputModel: "model/model.ply",
  };
}

export function detectArchitecturalFeatures({ uploadedFiles, capabilities }) {
  const hasVitalFloorPlan = uploadedFiles.some((file) => file.kind === "vital-camp-floor-plan");
  const hasVideo = uploadedFiles.some((file) => file.kind === "video");

  if (hasVitalFloorPlan) {
    return {
      source: "vital-camp-floor-plan",
      confidence: 0.9,
      features: [
        { type: "wall", label: "Imported perimeter walls", count: 8 },
        { type: "door", label: "Imported door openings", count: 3 },
        { type: "window", label: "Imported window openings", count: 4 },
      ],
    };
  }

  if (hasVideo && capabilities.externalVideoAvailable) {
    return {
      source: "local-video-reconstruction",
      confidence: 0.65,
      features: [
        { type: "wall", label: "Detected wall planes", count: 6 },
        { type: "door", label: "Detected passage openings", count: 2 },
        { type: "window", label: "Detected high-contrast window regions", count: 2 },
      ],
    };
  }

  return {
    source: "deterministic-mvp",
    confidence: 0.35,
    features: [
      { type: "wall", label: "Estimated room boundaries", count: 6 },
      { type: "door", label: "Estimated transitions", count: 2 },
      { type: "window", label: "Unknown windows", count: 0 },
    ],
  };
}

export function buildExternalToolPlan({ uploadedFiles, capabilities }) {
  const videoFile = uploadedFiles.find((file) => file.kind === "video");

  if (!videoFile || !capabilities.externalVideoAvailable) {
    return {
      enabled: false,
      reason: videoFile ? "COLMAP and ffmpeg are required for local video reconstruction." : "No video upload present.",
      steps: [],
    };
  }

  return {
    enabled: true,
    reason: "Local ffmpeg/COLMAP toolchain is available.",
    steps: [buildFrameExtractionPlan(videoFile), buildColmapPlan(videoFile)],
  };
}
