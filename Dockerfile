FROM nginx
COPY conf/default.conf /etc/nginx/conf.d/default.conf
COPY dist/front/browser /usr/share/nginx/html
