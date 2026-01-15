# --- Stage 1: Build ---
FROM node:lts-alpine AS builder
# Use the existing node user's home for the build
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:lts-alpine AS runner
ENV NODE_ENV=production

# 1. Simply set the WORKDIR to the existing node user's home
WORKDIR /home/node/app

# 2. Copy dependencies
COPY --from=builder /home/node/app/package*.json ./
RUN npm install --omit=dev

# 3. Copy compiled code
COPY --from=builder /home/node/app/build ./build

# 4. Create directories and set ownership to the existing 'node' user
# Alpine's 'node' user is already UID 1000
RUN mkdir -p logs config && \
    chown -R node:node /home/node/app

# 5. Switch to the built-in node user
USER node

EXPOSE 3000

CMD ["node", "build/app.js"]