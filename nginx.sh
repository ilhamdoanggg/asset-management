
sudo ln -s /etc/nginx/sites-available/nextjs.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d domainanda.com -d www.domainanda.com