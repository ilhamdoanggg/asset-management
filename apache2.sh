sudo a2ensite nextjs.conf
sudo apache2ctl configtest
sudo systemctl reload apache2

sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d domainanda.com -d www.domainanda.com