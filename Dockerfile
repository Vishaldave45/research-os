# Multi-stage Dockerfile for ResearchOS Web Application
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.ts ./
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
COPY --from=build /app/data ./data
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/vite.config.ts ./
COPY --from=build /app/index.html ./

EXPOSE 3000
CMD ["npm", "run", "dev"]
