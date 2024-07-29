FROM node:20.13.1-alpine AS build
WORKDIR /app
COPY . .

# Set BASE_HREF
ARG BASE_HREF
RUN npm ci && npm run build -- --base-href $BASE_HREF

# stage 2

FROM nginx:1.23.1-alpine
COPY --from=build /app/dist/smartchart-ui /usr/share/nginx/html/
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
