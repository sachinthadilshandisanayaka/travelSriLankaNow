# Stage 1: Build the Angular application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application for production
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built Angular app from build stage
COPY --from=build /app/dist/travelSrilankaNow /usr/share/nginx/html

# Copy theme startup script
COPY generate-theme.sh /generate-theme.sh
RUN chmod +x /generate-theme.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Apply theme from THEME_PRESET env var, then start nginx
CMD ["/generate-theme.sh"]
