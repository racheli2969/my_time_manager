# Quick Deployment Checklist for Render

## Pre-Deployment

- [ ] All code is committed to main branch
- [ ] No secrets are committed to git
- [ ] `.env` is in `.gitignore`
- [ ] Local testing works: `npm run dev`

## On Render Dashboard

### 1. Set Environment Variables
Go to your service → Environment tab

Required variables:
- [ ] `VITE_API_BASE_URL` - Your production API URL (e.g., `https://api.yourdomain.com/api`)
- [ ] `VITE_GOOGLE_CLIENT_ID` - Production Google OAuth Client ID
- [ ] `VITE_ENABLE_GOOGLE_AUTH` - `true` or `false`
- [ ] `VITE_ENABLE_PAYMENTS` - `true` or `false` 
- [ ] `VITE_STRIPE_PUBLIC_KEY` - Production Stripe public key (starts with `pk_live_`)

### 2. Backend Environment Variables
If using a backend service:
- [ ] Set backend-specific variables (database URL, etc.)

## Building & Deployment

- [ ] Push code to main branch
- [ ] Render automatically deploys on push (if auto-deploy enabled)
- [ ] Check build logs for: `✅ Loaded from system environment variables`
- [ ] Wait for deployment to complete

## Post-Deployment Testing

- [ ] Visit your deployed app URL
- [ ] Open browser console (F12)
- [ ] Check for any `❌ NOT SET` warnings
- [ ] Test API connectivity
- [ ] Test Google OAuth (if enabled)
- [ ] Test Stripe integration (if enabled)

## Troubleshooting

### Issue: Variables showing NOT SET in logs
**Solution**: 
- Go back to Render Environment tab
- Verify all variables are correctly entered
- Ensure variable names match exactly (case-sensitive): `VITE_*`
- Click "Save" and redeploy

### Issue: App connects to wrong API
**Solution**:
- Check `VITE_API_BASE_URL` is correct production URL
- Ensure no typos in the environment variable name

### Issue: Can't find Render Dashboard
**Solution**:
1. Go to https://dashboard.render.com/
2. Select your project/service
3. Look for "Environment" or "Environment variables" tab

## Important Notes

⚠️ **Do NOT**:
- Use test/dev keys in production (e.g., `pk_test_*` Stripe keys)
- Commit `.env` files to git
- Share Render dashboard credentials
- Hardcode API URLs in code

✅ **Do**:
- Use production keys/credentials
- Store all secrets in Render environment variables
- Keep your `.gitignore` updated
- Test in staging before production

## Support

If something goes wrong:
1. Check Render build logs for error messages
2. Verify all environment variables are set correctly
3. Check application logs on Render dashboard
4. Review `DEPLOYING_TO_RENDER.md` and `RENDER_ENV_FIX.md` documentation
