# --- Stage 1: Build & Prune ---
FROM node:lts-alpine AS builder

WORKDIR /home/node/app

# Copy configuration and dependency manifests
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
COPY tsconfig.json ./

# Install ALL dependencies
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove development dependencies to keep the image slim
RUN npm prune --omit=dev

# --- Stage 2: Production Runtime ---
FROM node:lts-alpine AS runner

# Set production environment variables
ENV NODE_ENV=production \
    MIN_THREADS=2 \
    MAX_THREADS=4 \
    PORT=3000

WORKDIR /home/node/app

# Copy only the necessary artifacts from the builder
# Using --chown here is faster and creates fewer layers
COPY --from=builder --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/app/build ./build
COPY --from=builder --chown=node:node /home/node/app/package*.json ./

# Create necessary directories for the app logic
RUN mkdir -p logs config && chown -R node:node /home/node/app

# Security: Use the built-in 'node' user
USER node

EXPOSE 3000

# Healthcheck to ensure the container is actually responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["node", "build/app.js"]