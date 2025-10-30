# Use the official Nginx image as the base
FROM nginx:alpine

# Copy custom nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy your website files to the Nginx default directory
COPY website/ /usr/share/nginx/html/

# Expose port 80 to allow traffic
EXPOSE 80