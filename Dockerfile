FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

USER appuser

EXPOSE 3000

CMD ["node", "dist/main"]