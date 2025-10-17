# Video Downloader Backend (Node + Fastify + yt-dlp)

This backend streams any **public video URL** directly to the user’s browser.
No file is saved on the server — the server just pipes the stream.

---

## 🚀 How to Run (Local)

### Prerequisites
- Node.js v18+
- yt-dlp installed globally or available in PATH
- ffmpeg installed

### Steps
```bash
npm install
node src/server.js
