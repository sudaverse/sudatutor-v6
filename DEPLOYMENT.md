# Production Deployment Guide

This guide covers different deployment options for **المعلم السوداني**.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Static Hosting (Vercel/Netlify)](#static-hosting)
3. [Docker Deployment](#docker-deployment)
4. [Traditional VPS/Server](#traditional-server)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure:

- ✅ File Search Store is created and populated
- ✅ Store ID is updated in `config/app.config.ts`
- ✅ All curriculum files are uploaded
- ✅ Application builds successfully (`npm run build`)

---

## Static Hosting

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set environment variables**
   ```bash
   vercel env add GEMINI_API_KEY production
   ```

### Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variables**
   - Go to Site settings → Build & deploy → Environment
   - Add `GEMINI_API_KEY`

### GitHub Pages

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy using gh-pages**
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

---

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Create `.env` file**
   ```bash
   echo "GEMINI_API_KEY=your-key-here" > .env
   ```

2. **Build and run**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Stop**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build image**
   ```bash
   docker build -t sudatutor:latest .
   ```

2. **Run container**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e GEMINI_API_KEY=your-key-here \
     --name sudatutor \
     sudatutor:latest
   ```

3. **View logs**
   ```bash
   docker logs -f sudatutor
   ```

### Push to Docker Hub

```bash
# Tag the image
docker tag sudatutor:latest yourusername/sudatutor:latest

# Push to Docker Hub
docker push yourusername/sudatutor:latest
```

---

## Traditional Server

### Using Node.js

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install serve**
   ```bash
   npm install -g serve
   ```

3. **Run the server**
   ```bash
   serve -s dist -l 3000
   ```

4. **Run with PM2 (process manager)**
   ```bash
   npm install -g pm2
   pm2 serve dist 3000 --name sudatutor --spa
   pm2 save
   pm2 startup
   ```

### Using Nginx

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Copy files to server**
   ```bash
   scp -r dist/* user@server:/var/www/sudatutor
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/sudatutor;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

4. **Reload Nginx**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |

### Setting Environment Variables

#### Vercel
```bash
vercel env add GEMINI_API_KEY production
```

#### Netlify
- Dashboard → Site settings → Build & deploy → Environment

#### Docker
```bash
# .env file
GEMINI_API_KEY=your-key-here
```

#### Traditional Server
```bash
# /etc/environment
GEMINI_API_KEY=your-key-here

# Or in PM2
pm2 set env.GEMINI_API_KEY your-key-here
```

---

## Post-Deployment

### Verification Checklist

- [ ] Application loads correctly
- [ ] Grade/subject selection works
- [ ] Chat interface responds to queries
- [ ] Source citations are displayed
- [ ] Mobile responsive design works
- [ ] Arabic text displays correctly (RTL)
- [ ] No console errors

### Testing

```bash
# Check if the application is running
curl http://your-domain.com

# Test API connectivity (if applicable)
curl http://your-domain.com/health
```

### Monitoring

#### Basic Monitoring

```bash
# Using PM2
pm2 monit

# Using Docker
docker stats sudatutor
```

#### Advanced Monitoring

Consider setting up:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry
- **Analytics**: Google Analytics, Plausible

---

## Performance Optimization

### Build Optimizations

Already configured in `vite.config.ts`:
- Code splitting
- Tree shaking
- Minification
- Source maps (development only)

### CDN Configuration

Consider using a CDN for:
- Static assets
- Fonts (Cairo from Google Fonts)
- Tailwind CSS

### Caching Strategy

#### Nginx Example
```nginx
# Cache HTML for 1 hour
location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}

# Cache assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Considerations

### API Key Protection

⚠️ **Important**: The current architecture exposes the API key in the browser.

**Production Recommendations**:

1. **Backend Proxy** (Recommended)
   - Create a simple backend service
   - Proxy Gemini API requests through your server
   - Keep API key on the server

2. **API Key Restrictions**
   - Restrict API key to specific domains
   - Set usage quotas
   - Monitor API usage

3. **Authentication Layer**
   - Add user authentication
   - Track usage per user
   - Implement rate limiting

### Headers

Add security headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## Troubleshooting

### Application won't start

**Check:**
- Environment variables are set
- Port 3000 is not in use
- All dependencies are installed

### API errors

**Check:**
- GEMINI_API_KEY is correct
- API key has proper permissions
- File Search Store exists and is populated

### Build fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Rollback Procedure

### Docker
```bash
# Roll back to previous image
docker pull yourusername/sudatutor:previous-tag
docker-compose down
docker-compose up -d
```

### PM2
```bash
# Roll back to previous version
pm2 delete sudatutor
# Deploy previous version
pm2 serve old-dist 3000 --name sudatutor --spa
```

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Open an issue on GitHub

---

## Next Steps

After successful deployment:
1. Set up monitoring
2. Configure backups
3. Plan for scaling
4. Implement analytics
5. Add user feedback mechanism

---

**Happy Deploying! 🚀**
