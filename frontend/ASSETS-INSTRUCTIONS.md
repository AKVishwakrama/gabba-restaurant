Place image assets in the `public/` folder (frontend/public). Recommended filenames:

- `logo.png` — site logo (recommended size ~160x48)
- `hero.jpg` — hero section image
- `shop1.jpg`, `shop2.jpg` — shop interior photos
- `burger.jpg` — featured burger photo
- `fries.jpg` — peri-peri fries photo

Google Sign-in setup:
1. Create OAuth 2.0 Client ID (Web) in Google Cloud Console.
2. Set the authorized origin to your frontend host (e.g. http://localhost:5173).
3. Copy the Client ID and set it in your environment: create `.env` in frontend root with:

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

Backend configuration:
- Optionally set `GOOGLE_CLIENT_ID` in backend `.env` to validate the id_token server-side.

Notes:
- The Google Sign-In flow will post the `id_token` to `/api/auth/google`. The backend verifies tokeninfo with Google and creates / returns a JWT.
- If you do not provide images, components fall back to Unsplash placeholders.
