FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG SERVICE
RUN pnpm nest build ${SERVICE}

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

ARG SERVICE
ENV SERVICE=${SERVICE}
COPY --from=builder /app/dist/apps/${SERVICE} ./dist/apps/${SERVICE}

CMD ["sh", "-c", "node dist/apps/$SERVICE/main.js"]
