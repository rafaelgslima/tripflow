# Klaro Consent Management Setup Guide

This guide explains how to use Klaro for GDPR/LGPD-compliant cookie and consent management in TripFlow.

## What is Klaro?

Klaro is a **free, open-source consent management platform** that:
- Shows a cookie banner to users
- Lets users opt-in/opt-out of tracking
- Blocks scripts until consent is given
- GDPR/LGPD compliant out of the box

## Current Setup

✅ Klaro is already integrated into TripFlow:
- CDN script loaded in `_document.tsx`
- Configuration in `src/lib/klaro-config.ts`
- Hook initialized in `_app.tsx`
- Privacy Policy linked automatically

## How It Works

1. **First visit**: User sees a consent banner at the bottom
2. **User choice**: User accepts all, rejects all, or customizes
3. **Cookie stored**: Choice stored in `klaro` cookie (365 days)
4. **Scripts blocked**: Analytics/tracking scripts won't load until consent given

## Adding New Tracking Tools

To add Google Analytics, Segment, or any other tracking service:

### Step 1: Edit `src/lib/klaro-config.ts`

Add a new service object to the `services` array:

```typescript
{
  name: 'google-analytics',
  title: 'Google Analytics',
  description: 'Analytics to understand how users interact with TripFlow',
  default: false,  // Don't enable by default (user must opt-in)
  purposes: ['analytics'],
  cookies: [/_ga/],  // Regex matching GA cookies
  required: false,   // Not required for app to function
  optOut: false,
  callback: (consent: boolean) => {
    if (consent) {
      // Load GA only if user consents
      loadGoogleAnalytics();
    }
  },
}
```

### Step 2: Conditionally Load Your Script

Wrap tracking script loading in a callback:

```typescript
// Only load if Klaro gives consent
if (typeof window !== 'undefined' && (window as any).klaro) {
  const consent = (window as any).klaro.getConsent('google-analytics');
  if (consent) {
    // Load Google Analytics
    gtag('config', 'GA_ID');
  }
}
```

## Current Services

| Service | Status | Enabled by Default |
|---------|--------|-------------------|
| Google Analytics | Configured | ❌ No (user must opt-in) |

## Cookie Banner Customization

Edit `src/lib/klaro-config.ts` to customize:

```typescript
noticeLocation: 'bottom' as const,  // 'bottom', 'top', or 'center'
consentModal: {
  acceptAll: true,      // Show "Accept All" button
  rejectAll: true,      // Show "Reject All" button
  changeDescription: true, // Show "Manage Preferences" button
},
cookieExpiresAfterDays: 365,  // How long to remember choice
```

## Testing

1. **Clear cookies**: Open DevTools → Application → Cookies → Delete `klaro`
2. **Refresh**: Reload page
3. **Banner appears**: You should see consent banner at bottom
4. **Test opt-in**: Click "Accept All" → cookie `klaro` is set
5. **Test opt-out**: Clear cookie, click "Reject All" → only essential scripts load

## Privacy Policy Integration

The banner automatically links to your Privacy Policy (`/privacy-policy`). Ensure it includes:
- ✅ What cookies we use
- ✅ Why we use them
- ✅ How long we store them
- ✅ User rights (already included)

## Production Checklist

- [ ] Test consent banner on live site
- [ ] Verify tracking scripts only load after consent
- [ ] Check DevTools → Network: ensure GA/tracking scripts are blocked before consent
- [ ] Test all three choices: Accept All, Reject All, Manage Preferences
- [ ] Verify `klaro` cookie is set correctly
- [ ] Monitor browser console for errors

## Important Notes

- **Klaro respects browser DNT headers** — if user has "Do Not Track" enabled, tracking is blocked
- **No backend required** — everything is client-side (no data sent to Klaro servers)
- **Open source** — https://github.com/klaro-org/klaro
- **Free forever** — no pricing tiers

## FAQ

**Q: Do I need to configure anything else?**
A: No. Klaro is fully configured. Just add tracking services as needed.

**Q: What if a user has an older `klaro` cookie?**
A: Delete their browser cookies to reset consent.

**Q: How do I know what services need consent?**
A: Any third-party script that tracks/identifies users needs consent. First-party analytics don't.

**Q: Can I customize the banner styling?**
A: Yes. Klaro uses CSS variables you can override in `globals.css`.

## Resources

- **Klaro Docs**: https://klaro.io/docs/
- **Configuration Options**: https://klaro.io/docs/configuration/
- **GDPR Guide**: https://klaro.io/docs/gdpr/
