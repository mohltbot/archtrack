# ArchTrack Admin Dashboard Dockerfile
# Production-ready container for employee tracking system

FROM node:20-alpine

# Install SQLite and other dependencies
RUN apk add --no-cache sqlite curl

# Set working directory
WORKDIR /app

# Copy package files
COPY admin/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY admin/ ./

# Build the server
RUN npm run build:server

# Create data directory for SQLite
RUN mkdir -p /data && chmod 777 /data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=sqlite:/data/archtrack.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
