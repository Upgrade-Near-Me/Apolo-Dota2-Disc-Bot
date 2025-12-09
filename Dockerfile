# Multi-stage build for security and optimization
# Stage 1: Dependencies
# Using latest LTS Node.js with Alpine 3.21 (most secure)
FROM node:20.18.1-alpine3.21 AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies for tsx)
RUN npm ci --ignore-scripts

# Stage 2: Production image
FROM node:20.18.1-alpine3.21 AS runner

# Install security updates and required packages
RUN apk upgrade --no-cache && \
    apk add --no-cache \
    dumb-init \
    font-noto \
    fontconfig \
    curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Environment (can be overridden at runtime)
ENV NODE_ENV=production
ENV METRICS_HOST=0.0.0.0
ENV METRICS_PORT=9100

# Expose metrics port (internal only)
EXPOSE 9100

# Healthcheck - check if bot metrics endpoint is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:9100/health || exit 1

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Start application with tsx to run TypeScript directly
CMD ["npx", "tsx", "src/index.ts"]
