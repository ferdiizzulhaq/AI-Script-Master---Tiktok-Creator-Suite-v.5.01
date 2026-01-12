# 🎬 AI Script Master v.5.01 (TikTok Creator Suite)

<div align="center">
  <img src="https://img.shields.io/badge/Version-v.5.01-blueviolet?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Framework-React%2019-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20%2B%20Veo-indigo?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini Models" />
  <br />
  <br />
  <h2 align="center">The Ultimate TikTok Creator Engine</h2>
  <p align="center">
    <strong>Upload a poster. Get a complete marketing campaign.</strong>
    <br />
    Turn a single image into viral TikTok scripts, cinematic Veo videos, voiceovers, live pitching practice, and cross-platform strategy.
  </p>
  <p align="center">
    <em>Coming Soon: Instagram Reels & YouTube Shorts Suites</em>
  </p>
</div>

---

## 🚀 Key Features

| Feature | Description | AI Model |
| :--- | :--- | :--- |
| **🎨 Vertical Script Gen** | Generates scripts specifically optimized for TikTok retention (Hooks, CTAs). | `gemini-2.5-flash` |
| **🎥 Magic Video** | Transforms static posters into cinematic 720p vertical video teasers. | `veo-3.1-fast-generate` |
| **🎙️ Live Pitch** | Real-time voice roleplay to practice selling your product against an AI client. | `gemini-2.5-flash-native-audio` |
| **📈 Trend Radar** | Fetches real-time news and Google Search trends related to your niche. | `gemini-3-pro` + `googleSearch` |
| **♻️ Repurpose** | Auto-converts scripts into IG Stories, X Threads, and LinkedIn posts. | `gemini-2.5-flash` |
| **🖼️ Thumbnail** | Generates high-CTR thumbnail concepts based on the script. | `imagen-4.0-generate` |

---

## 🛠️ Installation & Usage

You can run this application locally or build it as a desktop application.

### Prerequisites
*   **Node.js** (v18 or higher) installed on your system.
*   **Google AI Studio API Key** (Get it [here](https://aistudio.google.com/)).

### Option 1: Quick Start Scripts (Recommended)

We have provided automated scripts to get you started immediately.

**For Windows:**
1.  Double-click `run_dev.bat` to install dependencies and start the local server.
2.  Double-click `build_app.bat` to create a standalone `.exe` application.

**For macOS / Linux:**
1.  Open Terminal.
2.  Run `chmod +x run_dev.sh build_app.sh` to make them executable.
3.  Run `./run_dev.sh` to start the app.
4.  Run `./build_app.sh` to build the `.dmg` or Linux binary.

### Option 2: Manual Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

3.  **Build for Desktop (Electron):**
    ```bash
    npm run package
    ```
    Check the `out/` folder for your application file.

---

## 💳 Billing & API Keys

*   **Free Tier:** Works for Script Gen, Chat, Analysis, Live Pitch, and TTS.
*   **Paid Tier (Blaze):** Required for **Veo (Video Generation)** and **Imagen (Image Generation)**. 
    *   *Note:* If you receive a 403 error during video generation, ensure your Google Cloud Project has billing enabled.

---

<div align="center">
  <p>Built with ❤️ by the Senior Frontend Team</p>
</div>