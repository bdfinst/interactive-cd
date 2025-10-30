# Google Analytics Setup for Netlify Deployment

## Quick Setup Guide

This guide walks you through setting up Google Analytics 4 (GA4) for practices.minimumcd.org deployed on Netlify.

## Prerequisites

1. Google Analytics 4 account
2. Access to Netlify site settings
3. GA4 measurement ID (format: `G-XXXXXXXXXX`)

## Step 1: Get Your GA4 Measurement ID

### If you already have a GA4 property:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Click **Admin** (gear icon in bottom left)
4. Under **Property**, click **Data Streams**
5. Select your web data stream
6. Copy the **Measurement ID** (starts with `G-`)

### If you need to create a new GA4 property:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon)
3. Click **Create Property**
4. Enter property details:
   - Property name: "Minimum CD Practices"
   - Time zone: Your time zone
   - Currency: Your currency
5. Click **Next**
6. Fill in business information
7. Click **Create**
8. Create a **Web** data stream:
   - Website URL: `https://practices.minimumcd.org`
   - Stream name: "practices.minimumcd.org"
9. Click **Create stream**
10. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

## Step 2: Configure Cross-Domain Tracking (Optional)

If you want to track users across both `minimumcd.org` and `practices.minimumcd.org`:

1. In GA4, go to **Admin** → **Data Streams** → Select your stream
2. Click **Configure tag settings**
3. Click **Configure your domains**
4. Add both domains:
   - `minimumcd.org`
   - `practices.minimumcd.org`
5. Click **Save**

**Note**: The implementation already includes proper cookie configuration for cross-domain tracking.

## Step 3: Add Environment Variable to Netlify

### Method 1: Via Netlify UI

1. Log in to [Netlify](https://app.netlify.com/)
2. Select your site (`practices-minimumcd-org` or similar)
3. Go to **Site configuration** → **Environment variables**
4. Click **Add a variable** → **Add a single variable**
5. Enter:
   - **Key**: `VITE_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (your actual measurement ID)
   - **Scopes**: Select **All scopes** (or specific deploy contexts)
6. Click **Create variable**

### Method 2: Via Netlify CLI

```bash
netlify env:set VITE_GA_MEASUREMENT_ID "G-XXXXXXXXXX"
```

### Method 3: Via netlify.toml (Not Recommended for Secrets)

While possible, this is **not recommended** as it exposes the ID in version control:

```toml
[build.environment]
  VITE_GA_MEASUREMENT_ID = "G-XXXXXXXXXX"
```

**Better approach**: Use Netlify UI or CLI for environment-specific configuration.

## Step 4: Deploy the Site

### Option 1: Trigger Redeploy

1. In Netlify, go to **Deploys**
2. Click **Trigger deploy** → **Clear cache and deploy site**

### Option 2: Push to Git

```bash
git push origin main
```

Netlify will automatically deploy with the new environment variable.

## Step 5: Verify Analytics is Working

### Check Browser Console

1. Open your site: `https://practices.minimumcd.org`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for: `[Analytics] Initialized successfully: G-XXXXXXXXXX`

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for requests to `googletagmanager.com`
5. You should see:
   - `gtag/js?id=G-XXXXXXXXXX`
   - Collect requests with your measurement ID

### Check GA4 Real-Time Reports

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to **Reports** → **Realtime**
4. Visit your site in another tab
5. Within seconds, you should see your visit appear in the real-time report

## Troubleshooting

### Analytics Not Loading

**Problem**: No `[Analytics]` logs in console

**Solutions**:

1. Check environment variable is set: `echo $VITE_GA_MEASUREMENT_ID` (in Netlify build logs)
2. Verify measurement ID format: Must be `G-XXXXXXXXXX`
3. Clear cache and redeploy in Netlify
4. Check browser console for errors

### Invalid Measurement ID

**Problem**: Console shows `[Analytics] Disabled: Invalid measurement ID`

**Solutions**:

1. Verify format is `G-XXXXXXXXXX` (not `UA-XXXXXX-X`)
2. Remove any extra spaces or quotes
3. Ensure it's a GA4 property (not Universal Analytics)

### Script Not Loading

**Problem**: No requests to googletagmanager.com

**Solutions**:

1. Check browser ad blockers (disable for testing)
2. Check Content Security Policy settings
3. Verify environment variable is available at build time
4. Check browser console for script errors

### Data Not Appearing in GA4

**Problem**: Script loads but no data in GA4

**Solutions**:

1. Wait 24-48 hours for data processing (for historical reports)
2. Use Real-time reports for immediate verification
3. Verify measurement ID matches your GA4 property
4. Check if GA4 data collection is enabled (Admin → Data Streams)

## Local Development Testing

### Disable in Local Development

By default, analytics is disabled in local development (no `VITE_GA_MEASUREMENT_ID` set).

### Enable in Local Development

If you need to test locally:

1. Copy `.env.example` to `.env`
2. Add your measurement ID:
   ```bash
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Restart dev server:
   ```bash
   npm run dev
   ```

**Important**: Add `.env` to `.gitignore` to avoid committing secrets.

## Environment-Specific Configuration

### Development

- No tracking (measurement ID not set)
- Console logs enabled for debugging

### Production (Netlify)

- Full tracking enabled
- Console logs for monitoring

### Testing

- Consider using a separate GA4 property for testing
- Use `VITE_GA_MEASUREMENT_ID_TEST` for test environment

## Security Best Practices

1. **Never commit measurement IDs to version control**
   - Use environment variables only
   - Keep `.env` in `.gitignore`

2. **Use separate properties for staging/production**
   - Staging: `G-STAGING-ID`
   - Production: `G-PRODUCTION-ID`

3. **Monitor analytics access**
   - Review who has access to GA4 property
   - Use Google Analytics user management

4. **Enable data retention**
   - Set appropriate data retention period in GA4
   - Configure privacy settings

## Additional Configuration

### Custom Event Tracking

The implementation supports custom event tracking. Example:

```javascript
import { trackEvent } from '$lib/utils/analytics.js'

// Track practice adoption
trackEvent(window, 'practice_adopted', {
	practice_id: 'continuous-delivery',
	category: 'deployment',
	maturity: 'advanced'
})
```

Add these events to your components as needed.

### Privacy Compliance (GDPR/CCPA)

For privacy compliance, consider:

1. **Add cookie consent banner** (future enhancement)
2. **Configure IP anonymization** (already supported):
   ```javascript
   // In GoogleAnalytics.svelte, modify config:
   customParams: {
   	anonymize_ip: true
   }
   ```
3. **Add privacy policy link**
4. **Configure data retention in GA4**

## Support Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Implementation Details](./GOOGLE-ANALYTICS-IMPLEMENTATION.md)
- [Project Guidelines](../CLAUDE.md)

## Checklist

- [ ] GA4 property created
- [ ] Measurement ID copied (format: `G-XXXXXXXXXX`)
- [ ] Environment variable added to Netlify (`VITE_GA_MEASUREMENT_ID`)
- [ ] Site redeployed
- [ ] Browser console shows success message
- [ ] Real-time reports show activity
- [ ] Cross-domain tracking configured (if needed)
- [ ] Privacy policy updated (if required)

## Contact

For issues or questions, check:

1. Browser console for `[Analytics]` messages
2. Netlify deploy logs for build-time errors
3. GA4 Real-time reports for data verification
