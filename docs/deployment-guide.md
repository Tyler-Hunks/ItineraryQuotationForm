# Deployment Guide: Publishing Your Travel Booking Form

## Overview

This guide covers two main deployment approaches for your travel booking form:

1. **Replit Publishing** - The easiest way to get your app live with Replit's integrated hosting
2. **Independent Hosting** - Export your project and deploy on external platforms for more control and flexibility

## Option 1: Replit Publishing (Recommended for Quick Setup)

### Step 1: Publish on Replit

1. **Start Publishing Process**
   - In your Replit workspace, click the **"Publish"** button at the top
   - This opens the publishing/deployment tab

2. **Choose Deployment Type**
   - Replit will automatically suggest the best option for your app
   - For this full-stack application, **Autoscale** is recommended
   - Available options:
     - **Autoscale**: Best for apps with variable traffic (recommended)
     - **Reserved VM**: For consistent high-traffic applications
     - **Static**: Only for frontend-only sites (not suitable for this app)

3. **Add Payment Method**
   - Follow prompts to add a payment method if required
   - Replit offers different pricing tiers based on usage

4. **Configure Settings**
   - Set your app name and description
   - Configure environment variables if needed (like `N8N_WEBHOOK_URL`)
   - Review deployment settings

### Step 2: Environment Variables Setup

In the Publishing settings, add your environment variables:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.app/webhook/your-webhook-id
```

### Step 3: Custom Domain (Optional)

To use your own domain name:

1. **Navigate to Domain Settings**
   - Go to Publishing tab → Settings → "Link a domain"
   - Or select "Manually connect from another registrar"

2. **Configure DNS Records**
   - Enter your domain name (e.g., `booking.yourcompany.com`)
   - Replit will provide DNS records to add:
     - **A Record**: Points to Replit's IP address
     - **TXT Record**: For domain verification

3. **Update Your Domain Registrar**
   - Log in to your domain provider (GoDaddy, Namecheap, etc.)
   - Add the provided A and TXT records
   - DNS propagation takes 5 minutes to 48 hours

4. **Verify Setup**
   - Return to Replit to check domain status
   - Test by visiting your custom domain

### Replit Publishing Pricing (2025)

- **Free Tier**: Limited resources, suitable for testing
- **Paid Plans**: Start from $5-10/month for production apps
- **Custom Domains**: Included with paid plans

**Pros of Replit Publishing:**
- ✅ Extremely easy setup (one-click deployment)
- ✅ Automatic HTTPS and SSL certificates
- ✅ Built-in scaling and load balancing
- ✅ Integrated with your development environment
- ✅ Automatic deployments when you update code

**Cons of Replit Publishing:**
- ❌ Higher costs for high-traffic applications
- ❌ Limited control over server configuration
- ❌ Vendor lock-in to Replit platform

## Option 2: Independent Hosting (More Control & Flexibility)

### Step 1: Export Your Project

#### Method A: Direct Download
1. In Replit, click the **3 dots** in the Files sidebar
2. Select **"Download as zip"**
3. Extract the zip file on your computer

#### Method B: GitHub Export (Recommended)
1. **Connect to GitHub**
   - Click "Version Control" tab in Replit
   - Click "Connect to GitHub" and authenticate
   - Create a new repository or connect to existing one

2. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit for deployment"
   git push origin main
   ```

### Step 2: Prepare for Production

Your app needs these components for production deployment:

#### Production Build Process
```bash
# Install dependencies
npm install

# Build both frontend and server for production
npm run build
# This runs: vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

#### Environment Variables
Create a `.env` file with:
```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.app/webhook/your-webhook-id
PORT=5000
NODE_ENV=production
```

#### Note About Database
This application currently uses in-memory storage, so no database setup is required. If you need persistent storage, you would need to modify the application to use a database.

### Step 3: Choose Your Hosting Platform

#### Option A: Vercel (Recommended for Next.js/React Apps)

**Best for:** Full-stack applications with serverless functions

1. **Deploy from GitHub**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click "New Project" and import your GitHub repository
   - Vercel auto-detects your setup

2. **Note about Vercel Compatibility**
   
   **Important**: This application uses a single Express server that serves both API routes and static files. This architecture is not well-suited for Vercel's serverless functions. **We recommend using Render or Railway instead** (see options below).
   
   If you must use Vercel, you would need to restructure the application to separate the API into serverless functions.

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add your `N8N_WEBHOOK_URL`

4. **Deploy**
   - Vercel automatically deploys on every GitHub push
   - Get live URL: `https://your-project.vercel.app`

**Vercel Pricing:**
- **Free Tier**: 100GB bandwidth, hobby projects
- **Pro Plan**: $20/month per user, production apps
- **Custom Domains**: Free with all plans

#### Option B: Render (Great for Full-Stack Apps)

**Best for:** Applications needing persistent services and databases

1. **Create Web Service**
   - Go to [render.com](https://render.com) and sign up
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```yaml
   # Build Command
   npm install && npm run build
   
   # Start Command  
   npm start
   # This runs: NODE_ENV=production node dist/index.js
   
   # Environment
   NODE_ENV=production
   ```

3. **Add Environment Variables**
   - In service settings, add your environment variables:
     - `N8N_WEBHOOK_URL`: Your n8n webhook URL
     - `NODE_ENV`: `production`
     - `PORT`: Leave empty (Render will auto-assign)
   
   **Important**: The app automatically binds to `process.env.PORT` - don't set a fixed PORT value on managed platforms.

**Render Pricing:**
- **Free Tier**: Limited but good for testing
- **Starter Plan**: $7/month for web services
- **Database**: $7/month for PostgreSQL

#### Option C: Railway (Docker-based Deployment)

**Best for:** Developers who want more control and Docker support

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repository

2. **Automatic Deployment**
   - Railway auto-detects Node.js and deploys
   - Provides automatic HTTPS and custom domains

3. **Environment Variables**
   - Add variables in Railway dashboard
   - Supports automatic database provisioning

**Railway Pricing:**
- **Usage-based**: Pay for what you use
- **Starting**: ~$5/month for small applications

#### Option D: VPS/Cloud Hosting (Advanced)

**Best for:** Users who need full control and want to manage their own server

**Recommended Providers:**
- **DigitalOcean Droplets**: $6/month for basic VPS
- **Linode**: $5/month VPS options
- **AWS EC2**: Pay-as-you-go pricing

**Setup Process (Requires Technical Knowledge):**
1. **Set up Node.js Environment**
   - Install Node.js 18+ on your VPS
   - Install PM2 for process management
   - Set up reverse proxy (nginx/apache)

2. **Deploy Application**
   - Clone repository to server
   - Run `npm install && npm run build`
   - Start with PM2: `pm2 start dist/index.js --name travel-booking`

3. **Configure Web Server**
   - Set up nginx to proxy requests to Node.js app on port 5000
   - Configure SSL certificate (Let's Encrypt)
   - Set up firewall and security settings

### Step 4: Post-Deployment Setup

#### SSL/HTTPS Configuration
- Most modern platforms (Vercel, Render, Railway) provide automatic HTTPS
- For traditional hosting, enable SSL through hosting panel

#### Monitoring and Logging
```javascript
// Add production logging
if (process.env.NODE_ENV === 'production') {
  // Set up error tracking (Sentry, LogRocket, etc.)
  // Monitor application performance
  // Set up uptime monitoring
}
```

#### Performance Optimization (Optional)
```javascript
// Optional: Enable compression (requires installing compression package)
// npm install compression
// app.use(compression());

// Optional: Add caching headers for static files
app.use(express.static('dist', {
  maxAge: '1y',
  etag: false
}));
```

## Platform Comparison Table

| Platform | Free Tier | Pricing | Best For | Pros | Cons |
|----------|-----------|---------|----------|------|------|
| **Replit** | Limited | $5-20/mo | Quick setup | Easy deployment | Higher costs |
| **Render** | Limited | $7/mo | **This app** | Good for Node.js apps | Learning curve |
| **Railway** | Usage-based | $5+/mo | **This app** | Great for full-stack | Usage-based pricing |
| **Vercel** | 100GB bandwidth | $20/mo | Serverless apps | Excellent DX | Not ideal for this architecture |
| **VPS Hosting** | No | $5-10/mo | Advanced users | Full control | Requires server management |

## Migration Guide: Replit → Independent Hosting

### 1. Backup Your Data
```bash
# Export from Replit
git clone your-replit-repo
cd your-replit-repo
```

### 2. Verify Configuration
```javascript
// The package.json already has the correct scripts:
{
  "scripts": {
    "start": "NODE_ENV=production node dist/index.js",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
// No changes needed - these are already configured correctly
```

### 3. Environment Variables
```bash
# Create .env file for local development
touch .env
echo "N8N_WEBHOOK_URL=your-webhook-url" >> .env
echo "NODE_ENV=development" >> .env

# Add production variables to hosting platform
N8N_WEBHOOK_URL=your-webhook-url
```

### 4. Environment Setup
```bash
# Create .env file for production
echo "N8N_WEBHOOK_URL=your-webhook-url" > .env
echo "NODE_ENV=production" >> .env
echo "PORT=5000" >> .env
```

### 5. Update Domain/DNS
```bash
# Point your domain to new hosting
# Update DNS A records
# Configure HTTPS/SSL
```

## Troubleshooting Common Issues

### Build Failures
```bash
# Check Node.js version compatibility
node --version

# Verify all dependencies are installed
npm install

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
```

### Environment Variable Issues
```javascript
// Verify environment variables are loaded
console.log('Environment check:', {
  node_env: process.env.NODE_ENV,
  has_webhook_url: !!process.env.N8N_WEBHOOK_URL,
  port: process.env.PORT
});
```

### File Upload Issues
```javascript
// Check file upload limits
console.log('Max file size:', process.env.MAX_FILE_SIZE || '10MB');
console.log('Allowed file types:', ['pdf', 'doc', 'docx', 'xlsx', 'md']);
```

### CORS Issues (Optional)
```javascript
// Optional: Configure CORS if needed (requires installing cors package)
// npm install cors
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
//   credentials: true
// }));
```

## Security Checklist for Production

### ✅ Environment Variables
- [ ] All secrets stored in environment variables (not in code)
- [ ] n8n webhook URLs protected and validated
- [ ] Environment variables properly configured for production

### ✅ HTTPS/SSL
- [ ] SSL certificate configured
- [ ] HTTP redirects to HTTPS
- [ ] Secure headers enabled

### ✅ File Upload Security
- [ ] File type validation
- [ ] File size limits enforced
- [ ] Virus scanning for uploaded files (if storing permanently)

### ✅ Rate Limiting
- [ ] API rate limiting configured
- [ ] Form submission limits
- [ ] DDoS protection enabled

### ✅ Monitoring
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Log aggregation

## Getting Help

### Replit Support
- [Replit Documentation](https://docs.replit.com/)
- [Replit Community](https://replit.com/community)
- Contact support through Replit dashboard

### Platform-Specific Help
- **Vercel**: [docs.vercel.com](https://docs.vercel.com)
- **Render**: [render.com/docs](https://render.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)

### Community Resources
- Stack Overflow for technical issues
- GitHub Issues for platform-specific problems
- Discord/Slack communities for real-time help