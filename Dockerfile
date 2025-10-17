FROM node:20-slim

# Install yt-dlp and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && useradd -m appuser

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src

USER appuser
EXPOSE 3000

CMD ["npm", "start"]
