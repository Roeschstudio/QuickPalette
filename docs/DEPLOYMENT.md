# Deployment Guide

This guide will help you deploy QuickPalette to various platforms.

## GitHub Pages

### Prerequisites

- A GitHub account
- The project pushed to a GitHub repository

### Steps

1. Update `vite.config.js` to ensure the base path is correctly set:

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  base: "/quickpalette/", // Replace with your repository name
});
```

2. Build the project:

```bash
npm run build
```

3. Deploy to GitHub Pages using the GitHub CLI:

```bash
gh-pages -d dist
```

Or manually:

- Go to your repository on GitHub
- Click on Settings
- Scroll down to the "GitHub Pages" section
- Under "Source", select "Deploy from a branch"
- Choose the `gh-pages` branch and `/ (root)` folder
- Save and wait for deployment

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Netlify

### Prerequisites

- A Netlify account
- The project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Steps

1. Build the project:

```bash
npm run build
```

2. Deploy to Netlify:

- Sign in to Netlify
- Click "New site from Git"
- Connect your Git provider
- Select the repository
- Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Click "Deploy site"

### Custom Domain

To use a custom domain:

1. Go to Site settings > Domain management
2. Add your custom domain
3. Update your DNS records as instructed by Netlify

## Vercel

### Prerequisites

- A Vercel account
- The project pushed to a Git repository

### Steps

1. Build the project:

```bash
npm run build
```

2. Deploy to Vercel:

- Sign in to Vercel
- Click "New Project"
- Import your Git repository
- Configure the project:
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Click "Deploy"

### Custom Domain

To use a custom domain:

1. Go to your project dashboard
2. Click on "Domains"
3. Add your custom domain
4. Update your DNS records as instructed by Vercel

## Firebase Hosting

### Prerequisites

- A Google account
- Firebase CLI installed: `npm install -g firebase-tools`

### Steps

1. Initialize Firebase in your project:

```bash
firebase init hosting
```

2. Configure Firebase Hosting:

- Select your project or create a new one
- Set the public directory as `dist`
- Configure as a single-page app if needed
- Don't overwrite the index.html file

3. Build the project:

```bash
npm run build
```

4. Deploy to Firebase:

```bash
firebase deploy
```

## Docker

### Creating a Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Creating nginx.conf

Create an `nginx.conf` file:

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Building and Running

```bash
# Build the Docker image
docker build -t quickpalette .

# Run the container
docker run -p 8080:80 quickpalette
```

## Environment Variables

QuickPalette doesn't require any environment variables for basic functionality. However, you might want to add:

- `VITE_APP_TITLE`: Custom application title
- `VITE_API_URL`: API endpoint if you add backend functionality

Create a `.env.production` file for production builds:

```
VITE_APP_TITLE=QuickPalette
```

## Performance Optimization

### Pre-compressing Assets

Add to `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: "gzip",
      ext: ".gz"
    })
  ]
});
```

### CDN Configuration

For better performance, consider using a CDN for static assets.

## Security Considerations

- Ensure HTTPS is enabled in production
- Implement Content Security Policy (CSP) headers
- Regularly update dependencies to patch security vulnerabilities
- Consider adding integrity checks for external resources

## Monitoring

Set up monitoring for your deployed application:

- Use services like Vercel Analytics, Netlify Analytics, or Google Analytics
- Implement error tracking with services like Sentry
- Set up uptime monitoring with services like UptimeRobot or Pingdom