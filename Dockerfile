# Multi-stage Dockerfile for ResearchOS Frontend
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Production static serving stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/vite.config.ts ./

EXPOSE 3000
CMD ["npm", "run", "preview"]
