FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev || npm install

COPY python/requirements.txt ./python/requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r python/requirements.txt

COPY . .

ENV PORT=3001 PYTHON_BIN=python3
EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
