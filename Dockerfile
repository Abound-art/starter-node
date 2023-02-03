FROM node:18-alpine AS builder
RUN apk add --no-cache \
  python3 \
  pkgconfig make g++ \
  cairo-dev pango-dev #jpeg-dev giflib-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src src
RUN npm run build

FROM node:18-alpine
ENV NODE_ENV=production
RUN apk add --no-cache \
  tini \
  python3 \
  pkgconfig make g++ \
  cairo-dev pango-dev #jpeg-dev giflib-dev
WORKDIR /app
# RUN chown node:node .
# USER node
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/lib/ lib/
ENTRYPOINT [ "/sbin/tini","--", "node", "lib/index.js" ]
