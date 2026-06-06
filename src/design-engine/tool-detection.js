import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { delimiter, join } from "node:path";

const execFileAsync = promisify(execFile);

export async function hasExecutable(name, { env = process.env } = {}) {
  const pathParts = (env.PATH ?? "").split(delimiter).filter(Boolean);

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

export async function hasPythonModule(moduleName, { pythonExecutable = "python3" } = {}) {
  try {
    await execFileAsync(pythonExecutable, ["-c", `import ${moduleName}`], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function inspectLocalToolCapabilities({
  detector = hasExecutable,
  pythonModuleDetector = hasPythonModule,
} = {}) {
  const [colmapAvailable, ffmpegAvailable, pythonAvailable] = await Promise.all([
    detector("colmap"),
    detector("ffmpeg"),
    detector("python3"),
  ]);

  const opencvAvailable = pythonAvailable ? await pythonModuleDetector("cv2") : false;
  const externalVideoAvailable = colmapAvailable && ffmpegAvailable;

  return {
    colmapAvailable,
    ffmpegAvailable,
    pythonAvailable,
    opencvAvailable,
    externalVideoAvailable,
    mode: externalVideoAvailable ? "external-local-tools" : "deterministic-mvp",
  };
}
