#!/bin/bash
# First-time SSL certificate setup for travelsrilankanow.lk
# Run this script on the server after deploying

set -e

DOMAIN="travelsrilankanow.lk"
EMAIL="admin@travelsrilankanow.lk"  # Change to your email

echo "=== SSL Certificate Setup for $DOMAIN ==="

# Step 1: Create directories
echo "[1/4] Creating directories..."
mkdir -p certbot/www certbot/conf

# Step 2: Create a temporary nginx config (HTTP only) for certificate generation
echo "[2/4] Starting nginx with HTTP-only config..."
cat > nginx/default.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name travelsrilankanow.lk www.travelsrilankanow.lk;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
    }
}
NGINX_CONF

# Start only nginx-proxy and frontend (backend+db should already be running)
docker compose up -d nginx-proxy

# Wait for nginx to be ready
sleep 3

# Step 3: Request certificate
echo "[3/4] Requesting SSL certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email

# Step 4: Restore the full HTTPS nginx config
echo "[4/4] Enabling HTTPS config..."
cat > nginx/default.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name travelsrilankanow.lk www.travelsrilankanow.lk;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name travelsrilankanow.lk www.travelsrilankanow.lk;

    ssl_certificate /etc/letsencrypt/live/travelsrilankanow.lk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/travelsrilankanow.lk/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 50M;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONF

# Reload nginx with HTTPS config
docker compose restart nginx-proxy

echo ""
echo "=== DONE! ==="
echo "Your site is now available at:"
echo "  https://travelsrilankanow.lk"
echo "  https://www.travelsrilankanow.lk"
echo ""
echo "Don't forget to set up auto-renewal with cron:"
echo "  crontab -e"
echo "  0 3 * * * cd $(pwd) && docker compose run --rm certbot renew && docker compose exec nginx-proxy nginx -s reload"
