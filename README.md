# Run and deploy your app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `pnpm install`
2. Set `VITE_API_BASE_URL` in the root `env` file to the backend host. The app appends `/api/v1` unless the value already ends in `/api` or `/api/v1`.
3. If using Gemini features, set `GEMINI_API_KEY` in Vite's environment file.
4. Restart the dev server after changing `env`, or rebuild and redeploy the app for production.
5. Run the app:
   `pnpm dev`