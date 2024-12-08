# Deployment Guide

## Overview

This guide covers the deployment process for the BPM Platform, including environment setup, deployment strategies, and monitoring procedures.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Continuous Integration/Deployment](#continuous-integrationdeployment)
7. [Monitoring](#monitoring)
8. [Backup and Recovery](#backup-and-recovery)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js v18 or higher
- MongoDB v5 or higher
- Docker and Docker Compose
- Heroku CLI (for Heroku deployment)
- SSL Certificate
- Domain Name

## Environment Setup

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://username:password@host:port/database
JWT_SECRET=your-secret-key
REDIS_URL=redis://username:password@host:port
API_KEY=your-api-key
```

### Environment-Specific Configurations

```javascript
// config/production.js
module.exports = {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT
  },
  database: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  redis: {
    url: process.env.REDIS_URL
  }
};
```

## Deployment Options

### 1. Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create new Heroku app
heroku create bpm-platform

# Add MongoDB addon
heroku addons:create mongolab

# Add Redis addon
heroku addons:create heroku-redis

# Configure environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Deploy application
git push heroku main

# Ensure proper scaling
heroku ps:scale web=1
```

### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/bpm
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data

volumes:
  mongo-data:
  redis-data:
```

## Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name bpm-platform.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Configuration

```bash
# Install SSL certificate using Let's Encrypt
sudo certbot --nginx -d bpm-platform.com
```

## Database Setup

### MongoDB Setup

```bash
# Create admin user
mongo admin --eval '
  db.createUser({
    user: "admin",
    pwd: "secure_password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  })
'

# Create application database and user
mongo admin -u admin -p secure_password --eval '
  use bpm_platform;
  db.createUser({
    user: "app_user",
    pwd: "app_password",
    roles: [ { role: "readWrite", db: "bpm_platform" } ]
  })
'
```

## Continuous Integration/Deployment

### GitHub Actions Workflow

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "bpm-platform"
          heroku_email: "your-email@example.com"
```

## Monitoring

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  res.send(healthcheck);
});
```

### Prometheus Metrics

```javascript
const prometheus = require('prom-client');

// Create a Registry which registers the metrics
const register = new prometheus.Registry();

// Add a default label which is added to all metrics
prometheus.collectDefaultMetrics({ register });

// Create a histogram metric
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 500]
});

register.registerMetric(httpRequestDurationMicroseconds);
```

## Backup and Recovery

### MongoDB Backup

```bash
# Backup
mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://username:password@host:port/database" /backup/20231208/
```

### Automated Backup Script

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb/$TIMESTAMP"

# Create backup
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR

# Compress backup
tar -zcvf "$BACKUP_DIR.tar.gz" $BACKUP_DIR

# Upload to S3
aws s3 cp "$BACKUP_DIR.tar.gz" "s3://bucket-name/mongodb-backups/"

# Clean up
rm -rf $BACKUP_DIR
rm "$BACKUP_DIR.tar.gz"
```

## Security Considerations

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Troubleshooting

### Common Issues and Solutions

1. **Connection Issues**
   ```bash
   # Check MongoDB connection
   mongo --eval "db.adminCommand('ping')"

   # Check Redis connection
   redis-cli ping
   ```

2. **Performance Issues**
   ```bash
   # Check Node.js memory usage
   node --trace-memory-usage app.js

   # Monitor system resources
   top -p $(pgrep -f node)
   ```

3. **Log Analysis**
   ```bash
   # View application logs
   tail -f /var/log/bpm-platform/app.log

   # Search for errors
   grep -r "Error" /var/log/bpm-platform/
   ```

### Monitoring Commands

```bash
# Check application status
pm2 status

# Monitor logs
pm2 logs

# Monitor metrics
pm2 monit
```

## Scaling

### Horizontal Scaling

```bash
# Scale with PM2
pm2 scale app +3

# Scale with Docker Compose
docker-compose up --scale app=3

# Scale on Heroku
heroku ps:scale web=3
```

### Load Balancing

```nginx
upstream bpm_platform {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name bpm-platform.com;

    location / {
        proxy_pass http://bpm_platform;
    }
}
```
