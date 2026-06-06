# Home Automation Design Service (HADS) Specification

## 1. Overview
**HADS** is an AI-powered service layer that transforms home layouts, video walkthroughs, or **3D scans (e.g., Vital Camp)** into a fully automated **Home Assistant**-based home automation system. The system automates:
- **Bill of Materials (BOM)** generation.
- **Device layout and placement** planning.
- **Provisioning** of the Home Assistant system.
- **Dashboard setup** for user control and monitoring.
- **Local provider contracting** for touch labor.

---

## 2. Input Layer
### 2.1 Web Interface
#### **Features**
- **Interactive Floor Plan Editor**:
  - Draw walls, rooms, doors, and windows.
  - Support for manual uploads (CAD files, images, **3D models**).
  - Room labeling (e.g., kitchen, bedroom).
- **Video Walkthrough Processing (Phase 2)**:
  - Upload video recordings (MP4, MOV, AVI) for reconstruction.
  - Support for **Vital Camp exports** (`.glb`, `.obj`, `.svg`, `.dxf`).
  - Progress tracker for video processing.
  - Local-first external tool integration for `ffmpeg`, `colmap`, and Python/OpenCV environments.
  - Graceful deterministic fallback when external tools are unavailable.
  - Preview of the generated floor plan, detected architectural features, device recommendations, and BOM.
- **User Preferences**:
  - Budget, device brands, automation goals.
  - Toggle for advanced features (e.g., security, energy monitoring).

#### **Technologies**
- Frontend: React + Konva (for interactive drawing).
- Video Processing: OpenCV, COLMAP, or Kiri Engine.
- Backend: Node.js + Python (for video processing).

#### **API Endpoints**
| Endpoint               | Method | Description                                  |
|------------------------|--------|----------------------------------------------|
| `/api/upload`          | POST   | Upload floor plans, preferences, or **3D models**.           |
| `/api/upload-video`    | POST   | Upload and process MP4/MOV/AVI video walkthroughs or **Vital Camp exports** (`.glb`, `.obj`, `.svg`, `.dxf`).       |
| `/health`              | GET    | Liveness check. |
| `/api/pipeline/capabilities` | GET | Report external reconstruction tool availability and MVP fallback mode. |
| `/api/jobs/:jobId`     | GET    | Return processing status, progress, floor-plan preview, detected features, device recommendations, and BOM. |
| `/api/validate-layout` | POST   | Validate the generated floor plan or **3D model**.           |

---

## 3. Design Engine
### 3.1 AI Layout Generator
#### **Features**
- **3D Reconstruction (Phase 2)**: Convert video walkthroughs or **Vital Camp scans** into 3D models using local external tools when available.
- **Floor Plan Extraction (Phase 2)**: Generate 2D floor plans from 3D models or **Vital Camp exports** (`.svg`, `.dxf`).
- **Architectural Feature Detection**: Identify walls, doors, and windows from Vital Camp exports, local reconstruction outputs, or deterministic fallback estimates.
- **Device Placement**: Recommend optimal locations for devices (e.g., sensors, cameras, switches) based on room and feature context.
- **Room Analysis**: Identify room types (e.g., kitchen, bedroom) and recommend automation features.

#### **Technologies**
- Computer Vision: OpenCV, COLMAP, **Vital Camp SDK**. 
- AI/ML: Custom models for device placement.

### 3.2 BOM Generator
#### **Features**
- **Hardware Database**: List of supported devices (Zigbee, Z-Wave, Wi-Fi).
- **Cost Estimation**: Calculate total cost based on the BOM.
- **Vendor Integration**: Support for multiple vendors (e.g., Philips Hue, Lutron).

#### **Technologies**
- Database: PostgreSQL or Firebase.
- Backend: Python (for BOM generation).

### 3.3 Provider Matching
#### **Features**
- **Local Provider Database**: List of contractors (electricians, integrators).
- **Matching Algorithm**: Match providers based on location, services, and availability.
- **Contracting**: Automate provider onboarding and task assignment.

#### **Technologies**
- API Integrations: TaskRabbit, Angi, or custom provider database.
- Backend: Node.js (for provider matching).

---

## 4. Provisioning Layer
### 4.1 Home Assistant Integration
#### **Features**
- **Auto-Configuration**: Generate YAML files for Home Assistant.
- **Add-On Support**: Zigbee2MQTT, ESPHome, etc.
- **Device Pairing**: Automate device setup (Zigbee, Z-Wave, Wi-Fi).

#### **Technologies**
- Home Assistant API.
- Python (for YAML generation).

### 4.2 Dashboard Setup
#### **Features**
- **Pre-Configured Dashboards**: Generate dashboards for Home Assistant.
- **Customizable Themes**: Support for light/dark themes.
- **Mobile Support**: Responsive design for mobile and desktop.

#### **Technologies**
- Home Assistant Lovelace UI.
- React (for dashboard customization).

---

## 5. Output Layer
### 5.1 Installation Guide
#### **Features**
- **Step-by-Step Instructions**: For local providers.
- **Wiring Diagrams**: Visual guides for device installation.
- **Device Placement Maps**: Maps for device locations.

#### **Technologies**
- PDF Generation: Puppeteer or WeasyPrint.
- Diagrams: Mermaid.js or Graphviz.

### 5.2 User Dashboard
#### **Features**
- **Pre-Configured Dashboard**: For Home Assistant.
- **Mobile and Desktop Support**: Responsive design.
- **Customizable Layouts**: Drag-and-drop interface.

#### **Technologies**
- Home Assistant Lovelace UI.
- React (for customization).

### 5.3 Maintenance Plan
#### **Features**
- **Automated Alerts**: For device failures or updates.
- **Monitoring**: Integration with Prometheus/Grafana.
- **Scheduling**: Automated maintenance reminders.

#### **Technologies**
- Monitoring: Prometheus, Grafana.
- Alerts: Twilio or email notifications.

---

## 6. Non-Functional Requirements
### 6.1 Performance
- Video processing should complete within **5 minutes** for a 10-minute walkthrough.
- **Vital Camp scan processing** should complete within **10 minutes** for a 3D model.
- BOM generation should complete within **30 seconds**.

### 6.2 Security
- **Data Encryption**: All user data encrypted at rest and in transit.
- **Authentication**: OAuth 2.0 for user accounts.
- **Provider Vetting**: Background checks for local providers.

### 6.3 Scalability
- **Local-First Processing**: Phase 2 avoids cloud dependencies and uses local tools by default.
- **Microservices**: Modular architecture for independent scaling when deployment policy later permits it.

---

## 7. Open Questions
1. Should the system support **multi-language** inputs (e.g., floor plans with non-English labels)?
2. What is the **maximum video length** for walkthroughs?
3. Should the system integrate with **smart home ecosystems** beyond Home Assistant (e.g., Apple HomeKit, Google Home)?
4. What is the **approval process** for local providers?
5. What **Vital Camp export formats** should HADS support (e.g., `.glb`, `.obj`, `.dxf`)?