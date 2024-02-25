FROM node:18 AS builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend/. .

RUN npm run build

FROM nginx:1.24.0

RUN rm /etc/nginx/templates/default.conf.template
COPY nginx/default.conf.template /etc/nginx/templates/
COPY nginx/.htpasswd /etc/nginx/.htpasswd

COPY --from=builder /app/dist /usr/share/nginx/html