# Deployment Guide

## Overview
This guide covers deploying the Guides Nepal application to production environments.

## Deployment Options

### 1. Vercel (Recommended for Frontend)

#### Prerequisites
- GitHub account
- Vercel account
- Domain name (optional)

#### Steps
1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-domain.com
   FRONTEND_OAUTH_REDIRECT=https://your-frontend-domain.com/auth/callback
   ```

4. **Configure Redirects**
   Create `vercel.json` in your project root:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

5. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Custom domain can be configured in project settings

### 2. Render (Recommended for Backend)

#### Prerequisites
- Render account
- PostgreSQL database

#### Steps
1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect GitHub repository

2. **Configure Environment**
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   SECRET_KEY=your-production-secret-key
   ENV=production
   BACKEND_CORS_ORIGINS=https://your-frontend-domain.com
   ```

4. **Database Setup**
   - Create PostgreSQL database on Render
   - Run migrations: `alembic upgrade head`

5. **Deploy**
   - Render will deploy automatically on push
   - Health checks available at `/health`

### 3. Docker Deployment

#### Prerequisites
- Docker and Docker Compose
- Server with Docker support

#### Steps
1. **Build and Run**
   ```bash
   docker compose up --build -d
   ```

2. **Environment Configuration**
   Create `.env` file with production values:
   ```
   # Database
   POSTGRES_DB=guides_nepal
   POSTGRES_USER=youruser
   POSTGRES_PASSWORD=yourpassword
   
   # Backend
   DATABASE_URL=postgresql://youruser:yourpassword@db:5432/guides_nepal
   SECRET_KEY=your-production-secret-key
   ENV=production
   
   # Frontend
   VITE_API_URL=https://your-backend-domain.com
   ```

3. **SSL/TLS Setup**
   - Use reverse proxy (Nginx/Apache)
   - Configure Let's Encrypt certificates

### 4. Manual Server Deployment

#### Prerequisites
- VPS or dedicated server
- Domain name
- SSL certificate

#### Frontend Deployment
1. **Build Application**
   ```bash
   npm install
   npm run build
   ```

2. **Serve Static Files**
   - Use Nginx to serve `dist/` directory
   - Configure SPA routing:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

3. **SSL Configuration**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name your-domain.com;
     
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;
     
     root /var/www/guides-nepal/dist;
     index index.html;
     
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

#### Backend Deployment
1. **Setup Python Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   export DATABASE_URL="postgresql://user:pass@localhost:5432/guides_nepal"
   export SECRET_KEY="your-production-secret-key"
   export ENV="production"
   export BACKEND_CORS_ORIGINS="https://your-frontend-domain.com"
   ```

3. **Run with Gunicorn**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

4. **Setup Systemd Service**
   Create `/etc/systemd/system/guides-nepal.service`:
   ```ini
   [Unit]
   Description=Guides Nepal Backend
   After=network.target
   
   [Service]
   User=youruser
   WorkingDirectory=/path/to/backend
   Environment=PATH=/path/to/venv/bin
   ExecStart=/path/to/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

## Environment Variables Reference

### Frontend
```bash
VITE_API_URL=https://api.yourdomain.com
FRONTEND_OAUTH_REDIRECT=https://yourdomain.com/auth/callback
VITE_GOOGLE_OAUTH_URL=https://api.yourdomain.com/api/v1/auth/oauth/google
VITE_FACEBOOK_OAUTH_URL=https://api.yourdomain.com/api/v1/auth/oauth/facebook
```

### Backend
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SECRET_KEY=your-secret-key-minimum-32-characters
ENV=production

# CORS
BACKEND_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/oauth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
FACEBOOK_REDIRECT_URI=https://api.yourdomain.com/api/v1/auth/oauth/facebook/callback

# AI (Optional)
AI_PROVIDER=auto
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
OPENAI_API_KEY=your-openai-api-key
```

## Database Migration

### Production Migration
```bash
# Backup first
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Run migrations
alembic upgrade head

# Verify migration
alembic current
```

## Monitoring and Health Checks

### Health Check Endpoint
```http
GET /health
```

### Monitoring Setup
- Use services like UptimeRobot or Pingdom
- Monitor database connection
- Monitor API response times
- Set up alerts for downtime

## Security Best Practices

### 1. Environment Security
- Never commit secrets to repository
- Use strong passwords and keys
- Rotate secrets regularly
- Use environment-specific configurations

### 2. Database Security
- Use connection pooling
- Implement proper user permissions
- Regular backups
- Enable SSL connections

### 3. API Security
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### 4. Infrastructure Security
- Keep software updated
- Use firewalls
- Implement proper logging
- Monitor for suspicious activity

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching strategies

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Regular maintenance

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check `BACKEND_CORS_ORIGINS`
2. **Database Connection**: Verify `DATABASE_URL`
3. **Build Failures**: Check Node.js version
4. **Migration Errors**: Check database permissions

### Logs
- Frontend: Browser developer console
- Backend: Application logs
- Database: PostgreSQL logs
- Server: System logs

## Support and Maintenance

### Regular Tasks
- Monitor application health
- Update dependencies
- Review security logs
- Backup database
- Performance monitoring

### Emergency Procedures
- Database recovery
- Rollback procedures
- Incident response
- Communication plans

---

For more information, see:
- [Frontend README](../README.md)
- [Backend Documentation](backend/docs/)
- [Docker Configuration](docker-compose.yml)