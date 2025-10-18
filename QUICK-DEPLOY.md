# Quick Deploy to Netlify

Deploy the CD Practices app to Netlify in 5 minutes.

## Prerequisites

- Netlify account ([Sign up free](https://app.netlify.com/signup))
- [Netlify CLI](https://docs.netlify.com/cli/get-started/): `npm install -g netlify-cli`

## Deploy Steps

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Login to Netlify

```bash
netlify login
```

This opens your browser for authentication.

### 3. Initialize Site

```bash
netlify init
```

Follow the prompts:

- **Create & configure a new site**: Yes
- **Team**: Choose your team
- **Site name**: `cd-practices` (or your preferred name)
- **Build command**: `npm run build`
- **Publish directory**: `build`

### 4. Add PostgreSQL Database

```bash
netlify db init --assume-no
```

This creates a Netlify Postgres database for your site.

### 5. Get Database Credentials

```bash
netlify env:get DATABASE_URL
```

This shows your database connection string.

### 6. Set Environment Variables

```bash
netlify env:set DATABASE_URL "postgresql://user:pass@host:port/database"
netlify env:set NODE_ENV "production"
```

Replace the DATABASE_URL with the one from step 5.

### 7. Deploy Database Schema

```bash
# Set the DATABASE_URL in your shell
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run deployment script
./db/deploy-initial.sh
```

Type `y` when prompted to continue.

### 8. Deploy Site

```bash
netlify deploy --prod
```

Wait for build to complete (~1-2 minutes).

### 9. Open Your Site

```bash
netlify open:site
```

Your app is now live at: `https://your-site-name.netlify.app`

## Verify Deployment

### Test API

```bash
curl https://your-site-name.netlify.app/api/practices/tree | jq '.success'
```

Should return: `true`

### Test UI

Open in browser: `https://your-site-name.netlify.app`

You should see:

- ✅ "CD Practices" heading
- ✅ Practice count (Total Practices: 94)
- ✅ Hierarchical tree of practices

## Next Steps

### Enable Auto-Deploy from Git

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site Settings** → **Build & deploy**
4. Connect your Git repository
5. Set branch to deploy: `main`

Now every push to `main` automatically deploys!

### Add Custom Domain (Optional)

```bash
netlify domains:add yourdomain.com
```

Follow instructions to update DNS.

## Troubleshooting

### Build Fails

```bash
# Check build logs
netlify build:log

# Test build locally
npm run build
```

### Database Connection Error

```bash
# Verify DATABASE_URL is set
netlify env:get DATABASE_URL

# Test connection
psql "$(netlify env:get DATABASE_URL)" -c "SELECT COUNT(*) FROM practices;"
```

Should return: `23`

### API Not Working

```bash
# Check function logs
netlify functions:log

# Test API locally
netlify dev
```

## Update Deployment

### Update Code

```bash
git add .
git commit -m "Update feature"
git push origin main

# Auto-deploys if Git integration enabled
# Or manually:
netlify deploy --prod
```

### Update Database

```bash
# Create migration file
cp db/data/002_example_new_practice.sql db/data/003_new.sql

# Edit db/data/003_new.sql with your changes

# Deploy migration
export DATABASE_URL="$(netlify env:get DATABASE_URL)"
psql "$DATABASE_URL" -f db/data/003_new.sql
```

## Useful Commands

```bash
# View site status
netlify status

# Open site in browser
netlify open:site

# Open Netlify dashboard
netlify open:admin

# View environment variables
netlify env:list

# View deployment logs
netlify deploy:log

# Run local dev with Netlify
netlify dev
```

## Cost

**Free Tier Includes**:

- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 500MB PostgreSQL storage
- ✅ Custom domain with SSL
- ✅ Auto-deploy from Git

**Plenty for this app!** Only upgrade if you exceed limits.

## Support

- [Full Deployment Guide](./NETLIFY-DEPLOYMENT.md)
- [Netlify Docs](https://docs.netlify.com/)
- [Get Help](https://answers.netlify.com/)

---

**Summary**: 5 steps to deploy:

1. `netlify init` → Initialize
2. `netlify db init --assume-no` → Add DB
3. `netlify env:get DATABASE_URL` → Get connection string
4. `./db/deploy-initial.sh` → Deploy schema
5. `netlify deploy --prod` → Go live! 🚀
