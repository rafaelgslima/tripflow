# Getting Your Supabase Anon Key

To use Supabase Auth in this project, you need to add your Supabase anon (public) key to the `.env.local` file.

## Steps

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/acaulwtzxgbkjzyyajrd

2. Click on the **Settings** icon in the left sidebar (gear icon at the bottom)

3. Click on **API** in the settings menu

4. Find the **Project API keys** section

5. Copy the **anon/public** key (NOT the service_role key)

6. Open `/apps/web/.env.local` in your editor

7. Replace `your-anon-key-here` with your actual anon key:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://acaulwtzxgbkjzyyajrd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

8. Save the file

9. Restart your dev server (`pnpm dev`)

## Security Note

- The anon key is safe to use in client-side code
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Never use the `service_role` key in client-side code
