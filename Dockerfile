# --- Stage 1: Build ---
FROM node:lts-alpine AS builder
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install  # Installs everything (including devDeps like TypeScript)
COPY . .
RUN npm run build
# Clean up node_modules to only include production deps
RUN npm prune --omit=dev 

# --- Stage 2: Production ---
FROM node:lts-alpine AS runner
ENV NODE_ENV=production
WORKDIR /home/node/app

# Copy ONLY what is needed from builder
COPY --from=builder --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/app/build ./build
COPY --from=builder --chown=node:node /home/node/app/package*.json ./

RUN mkdir -p logs config && chown -R node:node /home/node/app

USER node
EXPOSE 3000
CMD ["node", "build/app.js"]