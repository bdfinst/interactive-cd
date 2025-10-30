# Google Analytics Testing - Quick Reference Card

## 🎯 One-Page Testing Guide

This is your quick reference for testing Google Analytics integration. For detailed information, see the full testing documents.

---

## 📂 Testing Documents

| Document                                   | Purpose                          | When to Use                      |
| ------------------------------------------ | -------------------------------- | -------------------------------- |
| `GA_TESTING_OVERVIEW.md`                   | Start here - high-level overview | First time, understanding scope  |
| `GA_TESTING_STRATEGY.md`                   | Complete testing strategy        | Planning tests, deep dive        |
| `manual/GA_VERIFICATION_CHECKLIST.md`      | Step-by-step manual testing      | Development, staging, production |
| `unit/analytics/ga-utils.test.js.template` | Unit test template               | After GA implementation          |
| `e2e/google-analytics.spec.js.template`    | E2E test template                | After GA implementation          |

---

## ✅ Quick Verification Steps

### Development (Local)

```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:5173
# 3. Open DevTools Console (F12)
# 4. Run this:
console.log('GA Script:', document.querySelector('script[src*="googletagmanager.com"]'))
# Should be: null

# 5. Verify app works normally
```

**Expected:** No GA script, no errors, app works fine

---

### Staging/Preview

```bash
# 1. Deploy to preview
# 2. Open preview URL
# 3. Open DevTools Network tab
# 4. Look for:
#    - gtag/js request (200 OK)
#    - g/collect request (200 OK)

# 5. Open DevTools Console
# 6. Run this:
console.log('dataLayer:', window.dataLayer)
console.log('gtag:', typeof window.gtag)
# Should be: array and function
```

**Expected:** GA loads, dataLayer exists, no errors

---

### Production

```bash
# After deployment:
# 1. Open production site
# 2. Verify GA script loads (Network tab)
# 3. Open GA4 console → Realtime
# 4. See yourself as active user (within 5 min)
```

**Expected:** GA tracks correctly, data in GA4 Realtime

---

## 🧪 Test Commands

```bash
# Unit tests
npm test                    # All unit tests
npm test -- ga-utils        # GA utilities only
npm run test:watch          # Watch mode (TDD)

# E2E tests
npm run test:e2e                           # All E2E tests
npm run test:e2e -- google-analytics.spec  # GA E2E only
npm run test:e2e:ui                        # Visual debugging

# Coverage
npm test -- --coverage      # Unit test coverage
```

---

## 🔍 Browser Console Verification

**Copy-paste this into browser console:**

```javascript
// Quick GA check
console.log('✅ GA Script:', !!document.querySelector('script[src*="googletagmanager.com"]'))
console.log('✅ dataLayer:', Array.isArray(window.dataLayer))
console.log('✅ gtag:', typeof window.gtag === 'function')

// Send test event (if gtag exists)
if (window.gtag) {
	window.gtag('event', 'test', { category: 'manual', label: 'console' })
	console.log('✅ Test event sent')
}
```

---

## 🚨 Common Issues

### Problem: GA not loading

**Check:**

1. Is `VITE_GA_MEASUREMENT_ID` set? (Netlify env vars)
2. Is format correct? (`G-XXXXXXXXXX`)
3. Ad blocker enabled? (Test incognito)
4. Console errors? (F12 → Console)

---

### Problem: No data in GA4

**Check:**

1. Wait 5-10 minutes (initial delay)
2. Correct GA4 property selected?
3. Measurement ID matches?
4. Check Realtime report (not just standard reports)

---

### Problem: Tests failing

**Check:**

1. Did you remove `.template` extension?
2. Did you import actual functions?
3. Did you uncomment assertions?
4. Environment variable set for tests?

---

## 📋 Deployment Checklist

**Before Deploy:**

- [ ] All tests pass (`npm test && npm run test:e2e`)
- [ ] Manual testing on preview deploy
- [ ] No console errors
- [ ] GA measurement ID configured

**After Deploy:**

- [ ] Site loads (< 1 min)
- [ ] GA script loads (Network tab)
- [ ] GA4 Realtime shows data (< 5 min)
- [ ] Multiple browsers tested

---

## 🎓 Success Criteria

- ✅ GA loads when configured
- ✅ App works when NOT configured
- ✅ No console errors (any scenario)
- ✅ Page views tracked correctly
- ✅ Works across all browsers
- ✅ Performance not impacted

---

## 🔗 Environment Variables

```bash
# Development (.env)
VITE_GA_MEASUREMENT_ID=                    # Empty = disabled

# Staging
VITE_GA_MEASUREMENT_ID=G-STAGING123       # Test ID

# Production
VITE_GA_MEASUREMENT_ID=G-PROD456          # Real ID
```

---

## 📊 Network Tab - What to Look For

**GA Script Load:**

- URL: `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
- Status: `200 OK`
- Type: `script`

**Page View Event:**

- URL: `https://www.google-analytics.com/g/collect?v=2&...`
- Status: `200 OK` or `204 No Content`
- Contains: `en=page_view` and `tid=G-XXXXXXXXXX`

---

## 🛠️ Troubleshooting Commands

```bash
# Check environment variable
echo $VITE_GA_MEASUREMENT_ID

# Restart dev server (if env var changed)
# Ctrl+C, then:
npm run dev

# Clear browser cache
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Test in incognito (rule out extensions)
# Cmd+Shift+N (Mac) or Ctrl+Shift+N (Windows)
```

---

## 📱 Browser Testing

**Test on:**

- ✅ Chrome (Desktop)
- ✅ Firefox
- ✅ Safari (Desktop)
- ✅ Safari (iOS)
- ✅ Chrome (Android)

---

## 🔐 Privacy Checks

**Verify no PII sent:**

1. Network tab → Find `g/collect` request
2. Right-click → Copy URL
3. Paste in text editor
4. Check for:
   - ❌ No email addresses
   - ❌ No names
   - ❌ No phone numbers

---

## 💡 Pro Tips

1. **Use GA Debugger extension** - Real-time event visibility
2. **Test in incognito** - Clean slate, no extensions
3. **Check Network tab first** - See what's actually loading
4. **Wait for Realtime** - GA4 has 5-10 min delay
5. **Hard refresh** - Clear cache if behavior is weird

---

## 📞 Support

**For detailed guidance, see:**

- Testing Overview: `/tests/GA_TESTING_OVERVIEW.md`
- Full Strategy: `/tests/GA_TESTING_STRATEGY.md`
- Manual Checklist: `/tests/manual/GA_VERIFICATION_CHECKLIST.md`

**Project guidelines:**

- CLAUDE.md - Development workflow (BDD → ATDD → TDD)

---

## 🚀 Next Steps

1. **Wait for implementation** - Coder agent to complete GA code
2. **Activate tests** - Remove `.template` from test files
3. **Run tests** - Execute unit and E2E tests
4. **Manual verify** - Follow checklist for each environment
5. **Deploy** - Ship with confidence

---

**Last Updated:** 2025-10-29 | **Version:** 1.0.0 | **Author:** Tester Agent
