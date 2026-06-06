export const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".avi"]);
export const VITAL_CAMP_MODEL_EXTENSIONS = new Set([".glb", ".obj"]);
export const VITAL_CAMP_FLOOR_PLAN_EXTENSIONS = new Set([".svg", ".dxf"]);
export const VITAL_CAMP_EXTENSIONS = new Set([
  ...VITAL_CAMP_MODEL_EXTENSIONS,
  ...VITAL_CAMP_FLOOR_PLAN_EXTENSIONS,
]);
export const SUPPORTED_UPLOAD_EXTENSIONS = new Set([
  ...VIDEO_EXTENSIONS,
  ...VITAL_CAMP_EXTENSIONS,
]);

export function extensionFor(filename) {
  const match = /\.[^.]+$/.exec(filename.toLowerCase());
  return match ? match[0] : "";
}

export function classifyUpload(filename) {
  const extension = extensionFor(filename);

  if (VIDEO_EXTENSIONS.has(extension)) {
    return { extension, kind: "video" };
  }

  if (VITAL_CAMP_MODEL_EXTENSIONS.has(extension)) {
    return { extension, kind: "vital-camp-model" };
  }

  if (VITAL_CAMP_FLOOR_PLAN_EXTENSIONS.has(extension)) {
    return { extension, kind: "vital-camp-floor-plan" };
  }

  return { extension, kind: "unsupported" };
}

export function isSupportedUpload(filename) {
  return SUPPORTED_UPLOAD_EXTENSIONS.has(extensionFor(filename));
}
