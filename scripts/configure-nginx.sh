#!/bin/bash

# Configuration Nginx pour api.wanzo.com
cat > /tmp/api.wanzo.com << 'EOF'
server {
    listen 80;
    server_name api.wanzo.com;
    
    access_log /var/log/nginx/api.wanzo.com.access.log;
    error_log /var/log/nginx/api.wanzo.com.error.log;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Copier et activer
sudo cp /tmp/api.wanzo.com /etc/nginx/sites-available/api.wanzo.com
sudo ln -sf /etc/nginx/sites-available/api.wanzo.com /etc/nginx/sites-enabled/api.wanzo.com

# Tester et recharger
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✓ Configuration Nginx créée et activée pour api.wanzo.com"
else
    echo "✗ Erreur dans la configuration Nginx"
    exit 1
fi
