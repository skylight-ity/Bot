FROM node:10-alpine

WORKDIR /usr/src/app

COPY package*.json ./


COPY . .

EXPOSE 6002

ENV NODE_ENV=production
RUN npm i ts-node
RUN npm install typescript
CMD [ "ts-node index.ts"]
