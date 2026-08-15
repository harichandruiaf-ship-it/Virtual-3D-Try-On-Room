# fal.ai – Get your real 3D model from photos

Follow these steps to use your fal.ai API key and get a **full 3D body mesh** (GLB) from uploaded images instead of the placeholder.

## 1. Add your API key

In the **project root** (same folder as `package.json`):

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
   (On Windows PowerShell you can copy manually or use `Copy-Item .env.example .env`.)

2. Open `.env` and set your fal.ai key:
   ```
   FAL_KEY=your_actual_fal_api_key_here
   ```
   Paste your key after the `=` with **no quotes and no spaces**.

## 2. Restart the app

Env vars load when the server starts, so restart the dev server:

- Stop the current process (Ctrl+C in the terminal).
- Start again:
  ```bash
  npm run dev
  ```

## 3. Create your 3D model again

1. Open **http://localhost:3000**
2. Click **Create my 3D model**
3. Upload a **full-body photo** (person clearly visible, front-facing works best; good lighting helps)
4. Enter your **height** (100–250 cm) and optional gender
5. Click **Generate my 3D model**

Processing usually takes **5–15 seconds**. When it finishes, you’re redirected to the try-on room and should see the **realistic 3D mesh** from fal.ai instead of the simple placeholder.

## If you still see the placeholder

- **Check the key:** In `.env`, the line must be exactly `FAL_KEY=...` with no typos. No `export`, no quotes.
- **Restart:** You must restart `npm run dev` after changing `.env`.
- **Check the terminal:** If fal.ai returns an error (e.g. invalid key, rate limit), it will be logged in the terminal where `npm run dev` is running.
- **Image:** Use a clear full-body image; very small or heavily cropped photos may fail.

## Cost

fal.ai SAM 3D Body is about **$0.02 per request**. You are charged by fal when the 3D model is generated.
