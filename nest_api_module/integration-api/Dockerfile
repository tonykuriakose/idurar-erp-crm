FROM node:18-alpine AS builder


WORKDIR /app


COPY package*.json ./


RUN npm ci --only=production && npm cache clean --force


COPY . .


RUN npm run build


FROM node:18-alpine AS production


RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001


WORKDIR /app


COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs


EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/integration/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"


CMD ["node", "dist/main"]