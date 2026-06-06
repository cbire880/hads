# Vital Camp Tutorial: Recording and Uploading Videos for HADS

This tutorial guides you through recording a **video walkthrough** of your home using **Vital Camp** and uploading it to the **Home Automation Design Service (HADS)** for automated home automation design.

---

## **1. Recording a Video Walkthrough with Vital Camp**
### **Requirements**
- **Device**: Smartphone or tablet with **Vital Camp** installed ([iOS](https://apps.apple.com/app/vital-camp/id123456789) | [Android](https://play.google.com/store/apps/details?id=com.vital.camp)).
- **Lighting**: Ensure all rooms are well-lit (natural or artificial light).
- **Stability**: Use a tripod or steady surface to avoid shaky footage.

### **Steps**
1. **Open Vital Camp**:
   - Launch the Vital Camp app on your device.
   - Select **"New Scan"** to start a new recording.

2. **Calibrate the Scan**:
   - Follow the on-screen instructions to calibrate the app (e.g., point the camera at a flat surface).
   - Ensure the app detects walls, floors, and ceilings accurately.

3. **Start Recording**:
   - Begin recording your walkthrough by tapping the **"Record"** button.
   - Move slowly through each room, capturing:
     - Walls, doors, and windows.
     - Electrical outlets, light switches, and potential device locations.
     - Structural features (e.g., stairs, built-in shelves).
   - Spend **10-15 seconds** in each room to ensure accurate 3D reconstruction.

4. **Complete the Scan**:
   - Tap **"Finish"** to end the recording.
   - Review the scan to ensure all areas are captured.

5. **Export the Scan**:
   - Select **"Export"** from the app menu.
   - Choose the following export formats:
     - **3D Model**: `.glb` or `.obj` (for device placement).
     - **Floor Plan**: `.svg` or `.dxf` (for layout validation).
   - Save the files to your device or cloud storage.

---

## **2. Uploading to HADS**
### **Steps**
1. **Access the HADS Web Interface**:
   - Open the HADS web app in your browser.
   - Log in to your account (or create one if you haven’t already).

2. **Upload the Scan**:
   - Start HADS locally with `npm run dev` and open `http://localhost:3000/`.
   - Choose the exported files (`.glb`/`.obj` + `.svg`/`.dxf`) in the upload form.
   - Alternatively, upload the **video recording** (MP4/MOV/AVI) directly.
   - Submit the form and watch the progress tracker. The MVP returns a completed job with the stored files, a floor-plan preview, and baseline device placement recommendations.

3. **Validate the Layout**:
   - HADS will process the scan and generate a **3D model reference** and **floor plan preview**.
   - Review the generated layout JSON for accuracy.
   - Adjust room labels or device placements in later UI phases if needed.

4. **Submit for Processing**:
   - Confirm the layout and submit it for **BOM generation** and **device placement**.

---

## **3. Tips for Best Results**
- **Lighting**: Ensure all rooms are well-lit to improve scan accuracy.
- **Slow Movement**: Move slowly through each room to avoid blurry footage.
- **Close-Ups**: Capture close-ups of electrical outlets, switches, and potential device locations.
- **Review**: Always review the scan before exporting to ensure completeness.

---

## **4. Troubleshooting**
| Issue                          | Solution                                                                                     |
|--------------------------------|---------------------------------------------------------------------------------------------|
| **Scan is incomplete**         | Retake the video, ensuring all areas are captured.                                          |
| **3D model is distorted**      | Improve lighting and move slower during recording.                                          |
| **HADS fails to process scan** | Ensure the file format is supported (`.glb`, `.obj`, `.svg`, `.dxf`, MP4, MOV, AVI).             |
| **Device placement is off**    | Manually adjust device locations in the HADS web interface.                                |

---

## **5. Next Steps**
After uploading your scan, HADS will:
1. Generate a **Bill of Materials (BOM)** for your home automation system.
2. Recommend **device placements** for sensors, cameras, and switches.
3. Match you with **local providers** for installation.
4. Provide an **installation guide** and **Home Assistant dashboard**.