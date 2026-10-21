# Pixel Perfect Pixels

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/af314987-e79c-465c-94c3-2893f546df4e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
cp .env.example .env
npm run dev
```

## Authentication (Supabase)

The app uses [Supabase Auth](https://supabase.com/docs/guides/auth) for email/password and Google sign-in.

1. Create a project at [supabase.com](https://supabase.com) and copy **Project URL** and **anon public** key into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. In **Authentication → URL Configuration**, set **Site URL** to your app origin (for local: `http://localhost:8080` or whatever port Vite prints) and add `{origin}/auth/callback` under **Redirect URLs**.
3. In **Authentication → Providers → Google**, enable Google and paste the Client ID and Client Secret from Google Cloud.
4. In Google Cloud, add this **Authorized redirect URI**: `https://<project-ref>.supabase.co/auth/v1/callback`.
5. Restart `npm run dev` after changing `.env`.

If email confirmation is enabled in Supabase, new sign-ups must open the email link before they can log in. For local testing you can turn that off under **Authentication → Providers → Email**.
