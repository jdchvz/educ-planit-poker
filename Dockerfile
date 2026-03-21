FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove package-lock and reinstall fresh
RUN rm -f package-lock.json

# Install dependencies fresh
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]