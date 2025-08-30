# Frontend Dockerfile for AI Education Platform
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fallback to npm install if no lock file)
RUN npm ci --omit=dev || npm install --production

# Copy source code
COPY . .

# Skip build for development mode (missing dependencies)
# RUN npm run build

# Expose port
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start the application in development mode
CMD ["npm", "run", "dev"]
