# 🎬 AI Script Master v.5.01 (TikTok Creator Suite)

<div align="center">
  <br />
  <img src="https://img.shields.io/badge/Version-v.5.01-7c3aed?style=for-the-badge&logo=tiktok&logoColor=white" alt="Version v5.01" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Build-Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.5_Flash-indigo?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini 2.5" />
  <img src="https://img.shields.io/badge/Video-Google_Veo-ea4335?style=for-the-badge&logo=google&logoColor=white" alt="Google Veo" />
  <img src="https://img.shields.io/badge/Desktop-Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <br />
  <br />
  <h1>🚀 The Ultimate AI Production Suite for TikTok Creators</h1>
  <p align="center" style="font-size: 1.1em; max-width: 600px; margin: 0 auto;">
    <strong>Upload a single poster. Generate an entire viral marketing campaign.</strong><br/>
    AI Script Master is a cutting-edge web and desktop application designed to streamline the creative workflow for short-form video creators.
  </p>
</div>

<br />

---

## ✨ Features & Capabilities

This suite leverages the latest **Google GenAI SDK** to perform complex multimodal tasks:

| Feature | Description | AI Model Used |
| :--- | :--- | :--- |
| **🎨 Vertical Script Gen** | Analyze image posters and generate viral-ready TikTok scripts with hooks, CTAs, and visual directions. | `gemini-2.5-flash` |
| **🎥 Magic Video (Veo)** | Transform static images into cinematic 720p/1080p vertical video teasers suitable for Reels/TikTok. | `veo-3.1-fast-generate` |
| **🎙️ Live Pitch Practice** | Practice your sales pitch in real-time with an AI persona (e.g., Critical Client, Gen Z) using low-latency voice. | `gemini-2.5-flash-native-audio` |
| **📈 Trend Radar** | Fetch real-time news and Google Search trends related to your niche to ensure content relevance. | `gemini-3-pro` + `googleSearch` |
| **♻️ Content Repurposing** | Automatically convert video scripts into Instagram Stories, X Threads, and LinkedIn professional posts. | `gemini-2.5-flash` |
| **🖼️ Thumbnail Concepts** | Generate high-CTR thumbnail visualizations based on the generated script and branding analysis. | `imagen-4.0-generate` |
| **🗣️ Multilingual TTS** | Text-to-Speech with specific voice tones (Cheerful, Deep, Storyteller) in English and Indonesian. | `gemini-2.5-flash-tts` |

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **Build Tool**: Vite 5
*   **Desktop Wrapper**: Electron 28
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
*   **Icons**: Lucide React

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the application on your local machine for development.

### 1. Prerequisites
*   **Node.js**: Version 18.0.0 or higher ([Download Here](https://nodejs.org/)).
*   **API Key**: A Google AI Studio API Key.
    *   Get it for free at [aistudio.google.com](https://aistudio.google.com/).
    *   *Note: To use **Veo (Video)** and **Imagen**, you must use an API key linked to a Google Cloud Project with Billing enabled.*

### 2. Installation
Clone the repository (or download the source code) and install dependencies:

```bash
# Install NPM dependencies
npm install
```

### 3. Running the App
Start the local development server with Vite. This allows for Hot Module Replacement (HMR) and fast editing.

```bash
npm run dev
```
> The app will open at `http://localhost:5173`.

---

## 📦 Building for Desktop (Windows, macOS, Linux)

This project includes **Electron Forge** configuration to package the web application into a standalone desktop executable (`.exe`, `.dmg`, `.deb`, etc.).

### Build Commands

Run the following command to package and make the distributable file for your current operating system:

```bash
npm run package
```

This command runs `electron-forge make` under the hood.

### Platform Specific Instructions

#### 🪟 Windows
*   **Requirement**: Run the build command on a Windows machine.
*   **Output**: This will generate a **Squirrel installer** (`.exe`) inside the `out/make/squirrel.windows/` folder.
*   **To Run**: Double-click the generated `.exe` to install and launch.

#### 🍎 macOS
*   **Requirement**: Run the build command on a macOS machine.
*   **Output**: This will generate a **.zip** or **.dmg** file inside the `out/make/` folder.
*   **Note**: For distribution, you may need to sign the application with an Apple Developer ID, otherwise users will see a security warning.

#### 🐧 Linux
*   **Requirement**: Run the build command on a Linux machine.
*   **Output**: Depending on your configuration, this can generate `.deb` (Debian/Ubuntu) or `.rpm` (RedHat/Fedora) packages in the `out/make/` folder.
*   **Dependencies**: Ensure you have `rpm` or `dpkg` build tools installed on your system (`sudo apt-get install dpkg fakeroot rpm`).

---

## ❓ Troubleshooting

### Common API Errors

1.  **Error 403 (Permission Denied) on Video Generation**:
    *   **Cause**: The API Key used is from the Free Tier. Veo models require a "Blaze" (Pay-as-you-go) plan.
    *   **Fix**: Enable billing on your Google Cloud Console project associated with the API key.

2.  **Error 429 (Resource Exhausted)**:
    *   **Cause**: You have hit the rate limit (RPM/TPM) for the model.
    *   **Fix**: Wait for 1-2 minutes before trying again, or request a quota increase.

3.  **Microphone Not Working (Live Pitch)**:
    *   **Cause**: Browser or OS permission denied.
    *   **Fix**: Allow microphone access in your browser settings (click the lock icon in the URL bar) and check your System Preferences.

---

## 📜 License

This project is open-source and available under the **MIT License**.

<div align="center">
  <p>Created by the Senior Frontend Team</p>
</div>
