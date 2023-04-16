FROM node:19.8-alpine as build

WORKDIR /app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm i

COPY . .

ARG VITE_TRPC_ENDPOINT=/trpc

RUN npm run build

FROM nginx:alpine as serve

COPY --from=build /app/dist /var/www/frontend
# COPY ./dist /var/www/frontend
COPY *.conf /etc/nginx/conf.d

EXPOSE 80
