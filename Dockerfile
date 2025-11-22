FROM node:20-alpine AS builder
WORKDIR /user/app
COPY package*.json .
RUN npm install --omit=dev
COPY ./dist ./dist
COPY server.js .
CMD ["node", "server.js"]
