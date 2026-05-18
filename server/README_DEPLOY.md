Deploying the Express backend (quick guide)

Recommended quick hosting: Render or Railway (both support Node servers out of the box).

Required environment variables

- MONGO_URI: Your MongoDB connection string
- BASE_URL: The backend base URL (e.g. https://api.example.com)
- CLIENT_URL: The frontend URL (e.g. https://your-frontend.vercel.app)
- SECRET: Auth0 session secret (random string)
- CLIENT_ID: Auth0 client id (if using Auth0)
- ISSUER_BASE_URL: Auth0 issuer base URL (if using Auth0)
- COOKIE_DOMAIN: optional - cookie domain for production

Render (quick steps)

1. Create a new Web Service on Render.
2. Connect your GitHub repo and pick the `server` folder as the root (or create a separate repo just for the server).
3. Build and Start commands:
   - Build command: leave empty (no build)
   - Start command: `npm start`
4. Add the environment variables listed above in the Render dashboard.
5. Deploy. The service will expose a public URL; use that as your backend URL.

Vercel frontend configuration

1. In your Vercel project settings, set the environment variable `NEXT_PUBLIC_API_URL` to your backend URL (e.g. `https://your-backend.onrender.com`).
2. Add any other envs required by the frontend.
3. Trigger a redeploy of the frontend.

Notes

- This Express server expects to run as a long-lived Node process. If you want everything on Vercel, you'll need to refactor endpoints into serverless functions.
- Ensure `CLIENT_URL` is added to the CORS `origin` list in `server.js` (it's already included but verify the exact domain).
- If Auth0 is configured in production, set `BASE_URL`, `CLIENT_ID`, `ISSUER_BASE_URL`, and `SECRET` properly to enable real auth; otherwise the server uses a mock auth for development.

Testing after deploy

- POST /api/v1/jobs with valid JSON body (see `test_post.js`) should return 201 and created job.
- GET /api/v1/jobs should return job list.

If you want, I can prepare a Render `service.yaml` or a Dockerfile next. Paste the deployed backend URL here after you deploy and I will update the frontend envs and verify end-to-end posting.