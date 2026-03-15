# Session Timeout & JWT Configuration Guide

## Overview

TripFlow implements automatic session timeout after **20 minutes** with a **2-minute warning** before expiration. This document explains how the system works and how to configure it.

---

## How It Works

### 1. **Supabase JWT Tokens**

- Supabase issues JWT (JSON Web Tokens) for authentication
- Tokens have an expiration time (`exp` claim) configured in Supabase Dashboard
- Tokens are automatically refreshed by the Supabase client before expiration
- If a user is inactive and tokens expire, they're logged out

### 2. **Client-Side Session Management**

- The `useSessionTimeout` hook manages session duration
- After 18 minutes, a warning modal appears
- After 20 minutes total, the user is automatically logged out
- User can extend the session by clicking "Extend Session" in the warning modal

### 3. **Token Refresh Strategy**

- Supabase client automatically refreshes tokens (configured in `client.ts`)
- Extending session (via warning modal) resets the timer and keeps the user logged in
- Session timeout runs independently of user activity

---

## Configuration

### Supabase Dashboard Configuration

**IMPORTANT:** You must configure JWT expiry in your Supabase Dashboard:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Auth** → **JWT Settings**
3. Set **JWT expiry limit** to match your desired session length

**Recommended Settings:**

```
JWT expiry limit: 1200 seconds (20 minutes)
Refresh token expiry: 604800 seconds (7 days)
```

**Why two different expiry times?**

- **JWT expiry (20 min)**: Access token expires after inactivity
- **Refresh token (7 days)**: Allows automatic token refresh if user returns within 7 days

### Frontend Configuration

In `.env.local`:

```bash
# Session will expire after this duration (in seconds)
# Default: 1200 seconds (20 minutes)
NEXT_PUBLIC_SESSION_TIMEOUT_DURATION=1200

# Warning duration before session expires (in seconds)
# Default: 120 seconds (2 minutes)
NEXT_PUBLIC_SESSION_TIMEOUT_WARNING=120
```

In `apps/web/src/pages/home.tsx` (or any protected page):

```typescript
const timeoutDuration =
  Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_DURATION) || 1200;
const warningDuration =
  Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_WARNING) || 120;

const { resetTimer } = useSessionTimeout({
  timeoutDuration, // 20 minutes total
  warningDuration, // 2 minutes warning before timeout
  onWarning: () => {
    // Show warning modal
  },
  onTimeout: () => {
    // User is logged out automatically
  },
});
```

---

## Security Features

### ✅ Implemented

1. **Automatic Token Refresh**
   - Tokens are refreshed before expiration
   - Configured in `lib/supabase/client.ts`

2. **Fixed Session Duration**
   - Session expires after 20 minutes from login
   - Timer runs independently of user activity
   - Predictable timeout behavior

3. **Graceful Warning**
   - 2-minute warning before logout
   - User can extend session with one click
   - Countdown timer shows remaining time

4. **Automatic Logout**
   - Session ends after timeout
   - Tokens are revoked via `signOut()`
   - User redirected to login page

5. **Auth State Synchronization**
   - Listens to Supabase auth events
   - Clears timers on logout
   - Single timer instance per session

### 🔒 Security Benefits

- **Prevents session hijacking**: Inactive sessions expire automatically
- **Reduces attack window**: 20-minute limit vs unlimited sessions
- **Token security**: Tokens refresh automatically while active
- **User awareness**: Warning gives users control

---

## Usage in Components

### Basic Usage (Protected Page)

```typescript
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function ProtectedPage() {
  useSessionTimeout({
    timeoutDuration: 1200, // 20 minutes
    warningDuration: 120,  // 2 minute warning
  });

  return <div>Protected Content</div>;
}
```

### With Warning Modal

```typescript
import { useState } from "react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";

export default function ProtectedPage() {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);

  const { resetTimer } = useSessionTimeout({
    timeoutDuration: 1200,
    warningDuration: 120,
    onWarning: () => {
      setShowWarning(true);
      setRemainingSeconds(120);

      // Optional: Countdown timer
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => prev <= 1 ? 0 : prev - 1);
      }, 1000);
    },
  });

  return (
    <>
      {showWarning && (
        <SessionTimeoutWarning
          remainingSeconds={remainingSeconds}
          onExtendSession={() => {
            setShowWarning(false);
            resetTimer();
          }}
          onLogout={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
        />
      )}
      <div>Protected Content</div>
    </>
  );
}
```

---

## Customization

### Change Timeout Duration

```typescript
useSessionTimeout({
  timeoutDuration: 600, // 10 minutes
  warningDuration: 60, // 1 minute warning
});
```

### Custom Warning Callback

```typescript
useSessionTimeout({
  onWarning: () => {
    console.log("Session expiring soon!");
    // Show toast notification
    // Play sound
    // etc.
  },
});
```

### Custom Timeout Behavior

```typescript
useSessionTimeout({
  onTimeout: () => {
    // Custom logout logic
    analytics.track("Session Expired");
    // Show modal explaining why they were logged out
  },
  redirectPath: "/session-expired", // Custom redirect
});
```

---

## Testing

### Manual Testing

1. **Test Inactivity Timeout:**
   - Log in to the app
   - Wait 18 minutes without any activity
   - Warning modal should appear
   - Wait 2 more minutes → automatic logout

2. **Test Activity Reset:**
   - Log in to the app
   - After 10 minutes, click anywhere
   - Timer should reset
   - No warning should appear

3. **Test Session Extension:**
   - Wait for warning modal
   - Click "Extend Session"
   - Modal should close
   - Timer resets to 20 minutes

### Automated Testing

```bash
npm test -- src/hooks/useSessionTimeout/index.test.ts
npm test -- src/components/SessionTimeoutWarning/index.test.tsx
```

---

## Troubleshooting

### Issue: Tokens expire too quickly

**Solution:** Check Supabase Dashboard JWT settings:

- Ensure JWT expiry is set to desired duration (1200s for 20 min)
- Verify `autoRefreshToken: true` in `client.ts`

### Issue: Warning doesn't appear

**Solution:** Verify:

- `onWarning` callback is provided
- Warning component is rendered conditionally
- State management is correct

### Issue: User logged out while active

**Solution:** Check:

- Activity events are being captured
- Throttling isn't too aggressive
- Timer reset is working correctly

### Issue: Session persists after timeout

**Solution:** Ensure:

- `supabase.auth.signOut()` is called on timeout
- Browser localStorage is being cleared
- No cached tokens remain

---

## Best Practices

### ✅ Do's

- Use session timeout on **all** protected pages
- Show clear warning with countdown
- Allow users to extend session easily
- Log timeout events for analytics
- Test with realistic timeout durations

### ❌ Don'ts

- Don't set timeout too short (< 5 minutes)
- Don't show warning without giving extension option
- Don't logout without warning
- Don't forget to clear timers on unmount
- Don't hardcode timeout values (use config)

---

## Future Enhancements

- [ ] Remember me: Longer sessions with explicit opt-in
- [ ] Activity heatmap: Track which actions reset timer
- [ ] Smart timeout: Adjust based on user behavior
- [ ] Multiple device detection: Logout on all devices
- [ ] Session history: Show users their session activity

---

## Security Considerations

### Industry Standards

- **OWASP**: Recommends 15-30 minute timeout for sensitive apps
- **NIST**: Requires timeout for elevated privilege sessions
- **PCI DSS**: Mandates session timeout after 15 minutes

### Our Implementation

- ✅ 20-minute timeout (within OWASP guidelines)
- ✅ Warning before expiration (user-friendly)
- ✅ Activity-based reset (reduces false positives)
- ✅ Automatic token refresh (seamless experience)
- ✅ Secure logout (revokes tokens)

---

## Compliance & Regulations

- **GDPR**: Session timeout helps minimize data exposure
- **HIPAA**: Short sessions reduce unauthorized access risk
- **SOC 2**: Demonstrates access control measures

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Session Management](https://owasp.org/www-community/controls/Session_Management_Cheat_Sheet)
