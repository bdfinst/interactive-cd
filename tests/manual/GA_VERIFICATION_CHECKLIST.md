# Google Analytics Verification Checklist

## Quick Reference Guide for Manual GA Testing

This checklist provides step-by-step verification procedures for testing Google Analytics integration. Use this during development, before deployment, and after production releases.

---

## Pre-requisites

- [ ] Browser DevTools knowledge (F12 / Cmd+Opt+I)
- [ ] Access to GA4 console (for staging/production verification)
- [ ] Google Analytics Debugger extension installed (optional but recommended)

---

## 1. Development Environment Verification

**Goal:** Ensure GA is NOT active during local development

### Steps

1. **Start local dev server**

   ```bash
   npm run dev
   ```

2. **Open browser to** `http://localhost:5173`

3. **Open DevTools** → Console tab

4. **Run verification commands:**

   ```javascript
   // Should be undefined or false
   console.log('GA Script:', document.querySelector('script[src*="googletagmanager.com"]'))

   // Should be undefined
   console.log('dataLayer:', window.dataLayer)

   // Should be undefined
   console.log('gtag:', typeof window.gtag)
   ```

5. **Expected Results:**
   - ✅ No GA script in DOM
   - ✅ `window.dataLayer` is `undefined`
   - ✅ `window.gtag` is `undefined`
   - ✅ No console errors
   - ✅ Application loads and works normally

6. **Network Tab Check:**
   - ✅ No requests to `googletagmanager.com`
   - ✅ No requests to `google-analytics.com`

### ❌ If Tests Fail

**Problem:** GA script is loading in development

**Solution:**

1. Check `.env` file - ensure `VITE_GA_MEASUREMENT_ID` is NOT set or empty
2. Restart dev server: `Ctrl+C`, then `npm run dev`
3. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## 2. Staging/Preview Environment Verification

**Goal:** Ensure GA loads and tracks correctly with test measurement ID

### Steps

1. **Deploy to staging** (or preview deploy)

2. **Open staging URL** in browser

3. **Open DevTools** → Network tab
   - Filter: `gtag` or `google`

4. **Reload page** (`Cmd+R` or `Ctrl+R`)

5. **Verify Network Requests:**

   **Request 1: Script Load**
   - ✅ URL: `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - ✅ Status: `200 OK`
   - ✅ Type: `script`

   **Request 2: Page View**
   - ✅ URL: `https://www.google-analytics.com/g/collect?v=2&...`
   - ✅ Status: `200 OK` or `204 No Content`
   - ✅ Contains: `en=page_view`
   - ✅ Contains: `tid=G-XXXXXXXXXX` (measurement ID)

6. **Open DevTools** → Console tab

7. **Run verification commands:**

   ```javascript
   // Should exist
   console.log('GA Script:', document.querySelector('script[src*="googletagmanager.com"]'))

   // Should be an array
   console.log('dataLayer:', window.dataLayer)
   console.log('Is array?', Array.isArray(window.dataLayer))

   // Should be 'function'
   console.log('gtag type:', typeof window.gtag)

   // View dataLayer contents
   console.table(window.dataLayer)
   ```

8. **Expected Results:**
   - ✅ GA script present in DOM
   - ✅ `window.dataLayer` is an array
   - ✅ `window.gtag` is a function
   - ✅ No console errors

9. **Test SPA Navigation:**
   - Click internal link (e.g., "About" page)
   - Watch Network tab for new `g/collect` request
   - ✅ New page view event sent

10. **Test with Google Analytics Debugger:**
    - Install [GA Debugger extension](https://chrome.google.com/webstore/detail/google-analytics-debugger)
    - Enable debugger (icon turns green)
    - Reload page
    - Check console for GA debug messages
    - ✅ See detailed event logging

### ❌ If Tests Fail

**Problem:** GA script not loading

**Solution:**

1. Verify `VITE_GA_MEASUREMENT_ID` is set in Netlify environment variables
2. Check build logs for environment variable
3. Verify measurement ID format: `G-XXXXXXXXXX` (GA4 format)
4. Check for CSP headers blocking script

**Problem:** Script loads but no events sent

**Solution:**

1. Check browser console for errors
2. Verify ad blocker is not interfering (test in incognito mode)
3. Check Network tab → Filter by "google-analytics.com"
4. Verify measurement ID matches GA4 property

---

## 3. Production Environment Verification

**Goal:** Ensure GA works correctly in production with real measurement ID

### Steps

1. **Deploy to production**

2. **Open production URL** in browser

3. **Repeat all steps from Staging Verification** (Section 2)

4. **Additional Production Checks:**

   **4.1 Real-time Data Verification**
   - Open GA4 console: [analytics.google.com](https://analytics.google.com)
   - Navigate to: Reports → Realtime
   - Open your production site in another tab
   - ✅ See yourself as active user in GA4
   - ✅ See page views being tracked
   - ✅ Verify correct page paths and titles

   **4.2 Multi-page Journey**
   - Navigate through site: Home → About → Back to Home
   - In GA4 Realtime, verify:
     - ✅ Page path changes tracked
     - ✅ Each navigation creates new page view event
     - ✅ Correct page titles sent

   **4.3 Multiple Browser Test**
   - Test in different browsers:
     - ✅ Chrome (Desktop)
     - ✅ Firefox
     - ✅ Safari (Desktop)
     - ✅ Safari (iOS) - if available
     - ✅ Chrome (Android) - if available

### ❌ If Tests Fail

**Problem:** No data in GA4 Realtime

**Solution:**

1. Wait 5-10 minutes (initial data delay is normal)
2. Verify correct GA4 property selected in console
3. Check measurement ID in Netlify environment variables
4. Hard refresh browser to clear cache
5. Test in incognito mode to rule out extensions

**Problem:** Events showing in DebugView but not in Realtime

**Solution:**

1. This is normal - DebugView is instant, Realtime has slight delay
2. Wait 5-10 minutes
3. Check Realtime report filters (ensure no filters are active)

---

## 4. Cross-browser Compatibility Testing

**Goal:** Ensure GA works across all major browsers

### Test Matrix

| Browser | Platform | Version | Status | Notes |
| ------- | -------- | ------- | ------ | ----- |
| Chrome  | Desktop  | Latest  | [ ]    |       |
| Firefox | Desktop  | Latest  | [ ]    |       |
| Safari  | Desktop  | Latest  | [ ]    |       |
| Edge    | Desktop  | Latest  | [ ]    |       |
| Safari  | iOS      | Latest  | [ ]    |       |
| Chrome  | Android  | Latest  | [ ]    |       |

### Testing Procedure (for each browser)

1. Open production site
2. Open DevTools → Console
3. Verify no errors
4. Open DevTools → Network
5. Verify GA script loads (`gtag/js`)
6. Verify page view sent (`g/collect`)
7. Navigate to another page
8. Verify second page view sent
9. Check GA4 Realtime (see user)

---

## 5. Error Handling and Resilience Testing

**Goal:** Ensure application works even when GA fails

### Test Scenarios

#### 5.1 Ad Blocker Test

**Setup:**

- Install ad blocker (e.g., uBlock Origin)
- Enable ad blocker
- Open production site

**Verify:**

- [ ] Site loads without errors
- [ ] No console errors related to GA
- [ ] Navigation works normally
- [ ] GA script blocked (expected)
- [ ] Application fully functional

**Expected:** Application degrades gracefully, no user-facing errors

---

#### 5.2 Network Timeout Test

**Setup:**

- Open DevTools → Network tab
- Set throttling to "Slow 3G"
- Reload page

**Verify:**

- [ ] Page renders before GA loads
- [ ] GA loads asynchronously
- [ ] No blocking of critical content
- [ ] No console errors

**Expected:** GA shouldn't block page rendering

---

#### 5.3 Offline Test

**Setup:**

- Open DevTools → Network tab
- Check "Offline" checkbox
- Reload page (if using service worker, may still load)

**Verify:**

- [ ] Page loads from cache (if service worker active)
- [ ] GA fails silently
- [ ] No console errors
- [ ] Application functional

**Expected:** GA failure doesn't break app

---

#### 5.4 Invalid Measurement ID Test

**Setup:**

- Temporarily set invalid measurement ID in environment
- Deploy to test environment

**Verify:**

- [ ] Site loads
- [ ] Console shows warning (expected)
- [ ] No application crashes
- [ ] Application functional

**Expected:** Graceful handling of configuration errors

---

## 6. Performance Impact Testing

**Goal:** Ensure GA doesn't negatively impact page performance

### Steps

1. **Open Incognito Window** (clean state)

2. **Run Lighthouse Audit**
   - Open DevTools → Lighthouse tab
   - Select: Performance, Best Practices
   - Device: Desktop
   - Click "Analyze page load"

3. **Verify Metrics:**
   - ✅ Performance score > 90
   - ✅ First Contentful Paint (FCP) < 1.8s
   - ✅ Time to Interactive (TTI) < 3.8s
   - ✅ Total Blocking Time (TBT) < 300ms
   - ✅ Cumulative Layout Shift (CLS) < 0.1

4. **Compare with GA disabled:**
   - Test locally without GA
   - Run Lighthouse again
   - Compare scores
   - ✅ Minimal performance difference (< 5 points)

5. **Network Impact:**
   - DevTools → Network tab
   - Check "Disable cache"
   - Reload page
   - Find GA script request
   - ✅ Script size < 50KB
   - ✅ Script loads async (doesn't block rendering)

### ❌ If Performance Degraded

**Problem:** Lighthouse score dropped significantly

**Solution:**

1. Verify GA script is loaded with `async` attribute
2. Ensure GA initialization doesn't block rendering
3. Consider delaying GA initialization until after page interactive
4. Check if GA is causing layout shifts (unlikely)

---

## 7. Privacy and Compliance Testing

**Goal:** Ensure privacy controls work correctly (if implemented)

### Cookie Consent (if implemented)

1. **Open site in incognito**
2. **Before accepting cookies:**
   - [ ] GA script should NOT load
   - [ ] No requests to google-analytics.com
3. **Accept cookies**
   - [ ] GA script loads
   - [ ] Page view tracked
4. **Revoke consent** (if possible)
   - [ ] GA stops tracking new events

### Do Not Track (if implemented)

1. **Enable DNT in browser**
   - Firefox: Settings → Privacy → Send "Do Not Track" signal
   - Chrome: Settings → Privacy and security → Send "Do Not Track"
2. **Open site**
3. **Verify:**
   - [ ] GA respects DNT setting (implementation-dependent)

### Data Being Sent

1. **Open DevTools → Network tab**
2. **Find GA collection request** (`g/collect`)
3. **Right-click → Copy → Copy URL**
4. **Paste in text editor**
5. **Verify NO personally identifiable information (PII):**
   - ❌ No email addresses
   - ❌ No names
   - ❌ No phone numbers
   - ❌ No user IDs (unless anonymized)

---

## 8. Console Verification Commands

**Quick copy-paste commands for browser console:**

```javascript
// ============================================
// GA Verification Commands
// ============================================

// 1. Check if GA script is loaded
console.log('✅ GA Script Loaded:', !!document.querySelector('script[src*="googletagmanager.com"]'))

// 2. Check dataLayer
console.log('✅ dataLayer exists:', typeof window.dataLayer !== 'undefined')
console.log('✅ dataLayer is array:', Array.isArray(window.dataLayer))
console.log('📊 dataLayer contents:', window.dataLayer)

// 3. Check gtag function
console.log('✅ gtag function exists:', typeof window.gtag === 'function')

// 4. Send test event (only if gtag exists)
if (typeof window.gtag === 'function') {
	window.gtag('event', 'manual_test', {
		event_category: 'testing',
		event_label: 'console_verification',
		value: 1
	})
	console.log('✅ Test event sent to GA')
} else {
	console.log('⚠️  gtag not available - GA not initialized')
}

// 5. View all GA configuration
if (window.dataLayer) {
	console.table(
		window.dataLayer.filter(
			item => typeof item === 'object' && (item[0] === 'config' || item[0] === 'event')
		)
	)
}

// 6. Get measurement ID from dataLayer
const measurementId = window.dataLayer?.find(
	item => Array.isArray(item) && item[0] === 'config'
)?.[1]
console.log('📊 Measurement ID:', measurementId || 'Not found')

// 7. Check for errors
console.log(
	'❌ Console Errors:',
	window.performance.getEntriesByType('navigation')[0]?.serverTiming || 'None'
)
```

---

## 9. GA4 Console Verification

**How to verify data in Google Analytics 4:**

### Real-time Reports

1. **Login to GA4:** [analytics.google.com](https://analytics.google.com)
2. **Select your property**
3. **Navigate:** Reports → Realtime
4. **Verify:**
   - ✅ Users by active page (should show current page)
   - ✅ Event count by Event name (should show `page_view`)
   - ✅ Users by country/city (should show your location)

### DebugView (Recommended for Testing)

1. **Install Google Analytics Debugger** extension
2. **Enable debugger** (icon turns green)
3. **Open site** in browser with debugger enabled
4. **In GA4:** Configure → DebugView
5. **Verify:**
   - ✅ See your device appear in debug stream
   - ✅ See `page_view` events
   - ✅ See event parameters (page_title, page_location, etc.)
   - ✅ No error events

### Historical Data (After 24 hours)

1. **Navigate:** Reports → Engagement → Pages and screens
2. **Verify:**
   - ✅ Page views logged
   - ✅ Correct page paths
   - ✅ Correct page titles
   - ✅ User engagement metrics

---

## 10. Deployment Checklist

### Pre-deployment

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Manual testing completed on preview deploy
- [ ] No console errors in browser DevTools
- [ ] GA measurement ID configured for production
- [ ] Lighthouse performance score acceptable

### Immediately After Deployment

- [ ] Production site loads
- [ ] No console errors
- [ ] GA script loads (Network tab)
- [ ] Page view sent (Network tab)
- [ ] Verify in GA4 Realtime (within 5 minutes)

### Within 1 Hour

- [ ] GA4 Realtime shows accurate data
- [ ] Multiple page views tracked
- [ ] Different browsers tested
- [ ] Mobile tested (if applicable)

### Within 24 Hours

- [ ] Review GA4 standard reports
- [ ] Check for data anomalies
- [ ] Verify no errors in GA4
- [ ] Confirm expected traffic volume

---

## 11. Troubleshooting Guide

### Problem: GA script not loading

**Checks:**

1. Is `VITE_GA_MEASUREMENT_ID` set? (Netlify → Site settings → Environment variables)
2. Is measurement ID in correct format? (G-XXXXXXXXXX)
3. Is ad blocker enabled? (Test in incognito)
4. Check browser console for errors
5. Check Network tab → filter by "google"

---

### Problem: Script loads but no events

**Checks:**

1. Check Network tab → filter by "analytics"
2. Verify measurement ID matches GA4 property
3. Check GA4 property is not disabled
4. Verify browser allows third-party cookies
5. Test in incognito mode

---

### Problem: Events in DebugView but not Realtime

**Solution:**

- This is normal! DebugView is instant, Realtime has 5-10 minute delay
- Wait and check again
- Verify you're looking at the correct date range

---

### Problem: Console errors related to GA

**Common Errors:**

**Error:** `gtag is not defined`

- **Cause:** Script hasn't loaded yet
- **Fix:** Ensure script loaded before calling gtag()

**Error:** `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

- **Cause:** Ad blocker or privacy extension
- **Fix:** This is expected, app should handle gracefully

**Error:** `Refused to load the script because it violates the following Content Security Policy directive`

- **Cause:** CSP headers too restrictive
- **Fix:** Add googletagmanager.com and google-analytics.com to CSP

---

## Quick Reference Summary

### ✅ Success Indicators

- GA script loads (Network tab shows 200 OK)
- `window.dataLayer` is an array
- `window.gtag` is a function
- Page view requests sent to google-analytics.com
- No console errors
- Data appears in GA4 Realtime (within 5 minutes)
- App works normally with ad blocker enabled

### ❌ Failure Indicators

- Console errors mentioning "gtag" or "analytics"
- No GA script in DOM (when measurement ID is set)
- Application crashes or errors
- GA blocks page rendering
- GA sends PII (personally identifiable information)

### 🔧 Quick Fixes

1. **Clear cache:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Test incognito:** Rule out extensions interfering
3. **Check env vars:** Netlify → Site settings → Environment variables
4. **Restart dev server:** Stop and run `npm run dev` again
5. **Check Network tab:** See what's actually being loaded

---

## Contact and Support

**For GA implementation questions:**

- Review: `/tests/GA_TESTING_STRATEGY.md`
- Check: Google Analytics documentation
- Debug: Use GA Debugger extension

**For deployment issues:**

- Check Netlify build logs
- Verify environment variables
- Review deploy preview before merging

---

## Changelog

| Date       | Change                    | Author       |
| ---------- | ------------------------- | ------------ |
| 2025-10-29 | Initial checklist created | Tester Agent |

---

**Last Updated:** 2025-10-29
**Version:** 1.0.0
