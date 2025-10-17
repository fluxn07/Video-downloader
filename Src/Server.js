import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { downloadVideo } from "./download.js";

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576, // 1 MB max body
});

await fastify.register(rateLimit, {
  max: 2, // 2 downloads per minute per IP
  timeWindow: "1 minute",
});

fastify.get("/download", async (req, reply) => {
  const url = req.query.url;
  if (!url) {
    return reply.code(400).send({ error: "Missing URL parameter" });
  }

  try {
    await downloadVideo(url, reply);
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: err.message || "Internal Server Error" });
  }
});

fastify.get("/", async (req, reply) => {
  reply.code(200).send({
    message: "Video Downloader API running",
    endpoint: "/download?url=<video_link>",
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log("✅ Server running on port 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
