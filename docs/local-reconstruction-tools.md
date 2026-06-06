# Local Reconstruction Tools Setup

HADS Phase 2 is local-first. The upload/reconstruction pipeline detects local tools and falls back to the deterministic MVP when they are unavailable.

## Supported Local Tools

| Tool | Purpose | Required for external video mode |
| --- | --- | --- |
| `ffmpeg` | Extract frames from walkthrough videos. | Yes |
| `colmap` | Build sparse 3D reconstruction from extracted frames. | Yes |
| `python3` + OpenCV | Future image-processing hooks for feature extraction. | Optional in current MVP adapter |

## Ubuntu/Debian Setup

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg colmap python3 python3-opencv
```

## macOS Setup

```bash
brew install ffmpeg colmap opencv python
```

## Verify Tool Detection

Start HADS:

```bash
npm run dev
```

Then inspect capabilities:

```bash
curl http://localhost:3000/api/pipeline/capabilities
```

Expected external-tool mode when `ffmpeg` and `colmap` are on `PATH`:

```json
{
  "colmapAvailable": true,
  "ffmpegAvailable": true,
  "pythonAvailable": true,
  "opencvAvailable": true,
  "externalVideoAvailable": true,
  "mode": "external-local-tools"
}
```

If one of the required tools is missing, HADS returns `mode: "deterministic-mvp"` and still completes uploads using the fallback pipeline.

## Pipeline Behavior

1. User uploads a video walkthrough or Vital Camp exports.
2. HADS stores the upload under `storage/jobs/<jobId>/`.
3. When local tools are available, HADS returns an external-tool execution plan for frame extraction and COLMAP reconstruction.
4. HADS extracts or estimates architectural features (`wall`, `door`, `window`).
5. HADS generates device recommendations and a BOM.

The current Phase 2 implementation intentionally keeps external command execution behind a plan/adapter boundary. This keeps CI reliable and prevents local machines without COLMAP/OpenCV from failing the pipeline.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `mode` is `deterministic-mvp` | Confirm `ffmpeg` and `colmap` are installed and available on `PATH`. |
| Upload completes but reconstruction is fallback | Check `/api/pipeline/capabilities` and the job `externalToolPlan.reason`. |
| CI fails on tool availability | CI should not require native tools; tests inject capability detectors for external/fallback paths. |
