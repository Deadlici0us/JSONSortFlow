#!/bin/bash

# Navigate to the project directory
cd /home/node/app

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production mode
npm run start:prod # Uncomment for production

# Start development mode
#npm run start:dev # Uncomment for development
