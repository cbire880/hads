# Home Automation Design Service (HADS)

**HADS** is an AI-powered service layer that transforms home layouts or video walkthroughs into a fully automated **Home Assistant**-based home automation system. The system automates:
- **Bill of Materials (BOM)** generation for hardware.
- **Device layout and placement** planning.
- **Provisioning** of the Home Assistant system.
- **Dashboard setup** for user control and monitoring.
- **Local provider contracting** for touch labor (installation, wiring, etc.).

---

## Features
### Input Layer
- **Interactive Floor Plan Editor**: Draw or upload home layouts.
- **Video Walkthrough Processing**: Upload MP4, MOV, or AVI walkthroughs and track processing progress.
- **Vital Camp Export Support**: Upload `.glb`, `.obj`, `.svg`, and `.dxf` exports for reconstruction/floor-plan ingestion.
- **User Preferences**: Budget, device brands, and automation goals.

### Design Engine
- **AI-Powered Layout Generator**: Convert layouts into device placement plans.
- **BOM Generator**: Automatically generate a list of required hardware.
- **Provider Matching**: Contract local providers for installation and touch labor.

### Provisioning Layer
- **Home Assistant Integration**: Auto-configure Home Assistant with the generated layout and BOM.
- **Device Provisioning**: Automate the setup of devices (Zigbee, Z-Wave, Wi-Fi).
- **Dashboard Setup**: Generate user-friendly dashboards for control and monitoring.

### Output Layer
- **Installation Guide**: Step-by-step instructions for local providers.
- **User Dashboard**: Pre-configured Home Assistant dashboard.
- **Maintenance Plan**: Automated alerts for device failures or updates.

---

## Getting Started
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/cbire880/hads.git
   cd hads
   ```
2. **Set Up the Environment**:
   ```bash
   npm install
   ```
3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
4. **Open the Upload UI**:
   ```text
   http://localhost:3000/
   ```

## Phase 1.5/1.75 MVP

The **Phase 1.5/1.75 MVP** adds video and Vital Camp export support to HADS, enabling:

- **Video Walkthrough Processing**: Upload MP4/MOV/AVI videos for reconstruction.
- **Vital Camp Export Support**: Upload `.glb`, `.obj`, `.svg`, and `.dxf` exports for floor-plan/reconstruction ingestion.
- **Deterministic Reconstruction Pipeline**: Fallback mode for environments without COLMAP/OpenCV.
- **Baseline Device Recommendations**: Automated suggestions for motion sensors, smart switches, and more.

### API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/` | GET | Video/Vital Camp upload page. |
| `/health` | GET | Liveness check. |
| `/api/upload-video` | POST | Multipart upload for MP4/MOV/AVI videos and `.glb`/`.obj`/`.svg`/`.dxf` Vital Camp exports. |
| `/api/jobs/:jobId` | GET | Processing status, progress, extracted floor-plan preview, and baseline device recommendations. |
| `/api/pipeline/capabilities` | GET | Reports whether external tools such as COLMAP are available; falls back to deterministic MVP mode.

The current MVP intentionally uses a deterministic reconstruction stub when COLMAP/OpenCV are not installed, so CI and local development can validate the upload/status/recommendation contract without native computer-vision dependencies.

### Tutorial: Vital Camp Export to HADS

1. **Export from Vital Camp**: Save your layout as `.glb`, `.obj`, `.svg`, or `.dxf`.
2. **Upload to HADS**: Use the `/api/upload-video` endpoint or the web UI.
3. **Review Recommendations**: Check `/api/jobs/:jobId` for device placement suggestions and floor-plan previews.
4. **Proceed to Phase 2**: Use the output for BOM generation and provider contracting.

---

## Documentation
- [Architecture](docs/architecture.md)
- [Specification](docs/spec.md)
- [Deployment Roadmap](docs/deployment.md)
- [User Guide](docs/user-guide.md)

---

## License
This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.