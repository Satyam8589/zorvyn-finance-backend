# STAGE 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (if needed)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# STAGE 2: Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only the necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.js ./server.js

# Change ownership to the non-root user
USER nextjs

# Expose the API port
EXPOSE 5000

# Optional: Add a simple healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "server.js"]
