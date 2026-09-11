FROM node:20-alpine

WORKDIR /app

# Prisma engines on Alpine need OpenSSL; without it schema engine crashes at startup
RUN apk add --no-cache openssl libc6-compat

RUN npm config set registry https://registry.npmmirror.com

COPY package.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
