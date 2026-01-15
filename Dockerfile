# --- Stage 1: Build ---
FROM node:lts-alpine AS builder

WORKDIR /home/nodeuser/app

# Copy package files first for better cache utilization
COPY package*.json ./
RUN npm install

# Copy the rest of the source
COPY . .

# Build the project (creates the /build folder)
RUN npm run build

# --- Stage 2: Production ---
FROM node:lts-alpine AS runner

ENV NODE_ENV=production

# 1. Create a non-root user and set their home as the working directory
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup -h /home/nodeuser
WORKDIR /home/nodeuser/app

# 2. Install production dependencies only
COPY --from=builder /home/nodeuser/app/package*.json ./
RUN npm install --omit=dev

# 3. Copy compiled code from the builder stage
COPY --from=builder /home/nodeuser/app/build ./build

# 4. Prepare directories for logs and config with user permissions
# This ensures nodeuser can write to ~/app/logs/
RUN mkdir -p logs config && \
    chown -R nodeuser:nodegroup /home/nodeuser/app

# 5. Switch to the non-root user
USER nodeuser

# Expose the internal port (3000)
EXPOSE 3000

# Start the application
CMD ["node", "build/index.js"]  