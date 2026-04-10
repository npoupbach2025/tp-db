# ===== Stage 1: Build frontend =====
FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY index.html vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js components.json ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

# ===== Stage 2: Production server =====
FROM node:20-alpine
WORKDIR /app

# Copy TP project files (SQL, docs, UML)
COPY tp/ /tp/

# Copy server code and install dependencies
COPY server/ ./server/
WORKDIR /app/server
RUN npm install --production

# Copy built frontend from stage 1
COPY --from=frontend-build /app/dist /app/dist

# Environment
ENV NODE_ENV=production
ENV TP_PROJECT_ROOT=/tp

RUN chmod +x /app/server/entrypoint.sh

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/dashboard/stats || exit 1

ENTRYPOINT ["/app/server/entrypoint.sh"]
