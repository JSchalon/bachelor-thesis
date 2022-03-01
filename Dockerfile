FROM nginx:1.19.9-alpine
COPY dist /usr/share/nginx/html/dist

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD  nginx -g "daemon off;"
