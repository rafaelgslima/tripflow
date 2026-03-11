# Supabase Auth Integration

This document describes how the signup form integrates with Supabase Auth.

## Overview

The signup form (`SignupForm` component) uses the `useSignupForm` hook which integrates directly with Supabase Auth to create new user accounts.

## Flow

1. User fills out the signup form with:
   - Full Name
   - Email
   - Password
   - Password Confirmation
   - Terms acceptance

2. Client-side validation runs (all fields validated in real-time)

3. On submission, if validation passes:
   - `supabase.auth.signUp()` is called with email and password
   - User's name is stored in the user metadata
   - On success, the optional `onSuccess` callback is triggered
   - On error, a general error message is displayed above the submit button

## Database Integration

When a user signs up via Supabase Auth:

1. Supabase creates the user in `auth.users`
2. Our database trigger (`auto_create_profile`) automatically creates a profile record in the `profile` table
3. The trigger extracts the name from `auth.users.raw_user_meta_data` and populates the profile

## Error Handling

The form handles three types of errors:

1. **Validation errors**: Field-specific errors shown below each input
2. **Auth errors**: Errors from Supabase (e.g., "User already registered")
3. **Network errors**: Generic error message for unexpected failures

All errors are displayed accessibly with ARIA attributes for screen readers.

## Environment Setup

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing

The Supabase integration can be tested by:

1. Setting up `.env.local` with your Supabase credentials
2. Running `pnpm dev`
3. Navigating to `/signup`
4. Filling out and submitting the form
5. Checking the Supabase dashboard to confirm the user was created

## Next Steps

- [ ] Add email verification flow
- [ ] Redirect to home/profile page after successful signup
- [ ] Add loading state animations
- [ ] Implement rate limiting for signup attempts
