import { spawn } from "child_process";
import dns from "dns/promises";
import ipaddr from "ipaddr.js";

const BLOCKED_RANGES = [
  ["10.0.0.0", 8],
  ["127.0.0.0", 8],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["169.254.0.0", 16],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
];

// Checks if host resolves to a private IP
async function isPrivateHost(hostname) {
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    return addresses.some(({ address }) => {
      const parsed = ipaddr.parse(address);
      return BLOCKED_RANGES.some(([range, bits]) =>
        parsed.match(ipaddr.parse(range), bits)
      );
    });
  } catch {
    return true; // fail safe
  }
}

export async function downloadVideo(url, reply) {
  try {
    const valid = /^https?:\/\//i.test(url);
    if (!valid) throw new Error("Invalid URL");

    const { hostname } = new URL(url);
    if (await isPrivateHost(hostname))
      throw new Error("Blocked private or internal host");

    reply.header("Content-Disposition", 'attachment; filename="video.mp4"');
    reply.header("Content-Type", "video/mp4");

    const ytdlp = spawn("yt-dlp", ["-o", "-", "-f", "best", url]);

    // Kill yt-dlp if client disconnects
    reply.raw.on("close", () => ytdlp.kill("SIGKILL"));

    ytdlp.stdout.pipe(reply.raw);

    ytdlp.stderr.on("data", (data) => {
      console.log(`[yt-dlp] ${data}`);
    });

    ytdlp.on("error", (err) => {
      console.error("yt-dlp spawn failed:", err);
      reply.raw.end();
    });

    ytdlp.on("close", (code) => {
      if (code !== 0) console.log(`yt-dlp exited with code ${code}`);
      reply.raw.end();
    });
  } catch (err) {
    throw err;
  }
}
