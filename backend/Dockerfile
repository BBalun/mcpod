FROM node:19.8-alpine

WORKDIR /app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm i

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD [ "npm", "start" ]