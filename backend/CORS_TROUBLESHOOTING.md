# CORS Troubleshooting Guide

## Quick Fix for Production CORS Issues

### Problem: CORS errors in production

**Symptoms:**
- Login fails with "Failed to fetch"
- Browser console shows CORS policy error
- Backend logs show "CORS BLOCKED REQUEST"

### Solution

1. **Check backend logs** - Look for this message:
   ```
   ❌ CORS BLOCKED REQUEST
      Origin: https://your-frontend.com
      💡 Fix: Add "https://your-frontend.com" to FRONTEND_URL env var
   ```

2. **Update Render environment variable:**
   - Go to Render Dashboard → Backend Service → Environment
   - Set or update `FRONTEND_URL`:
     ```
     FRONTEND_URL=https://gnn-hf-frontend.onrender.com
     ```
   - For multiple origins (dev + production):
     ```
     FRONTEND_URL=https://gnn-hf-frontend.onrender.com,http://localhost:8080
     ```

3. **Redeploy** (if auto-deploy is off):
   - Render → Backend Service → Manual Deploy → Deploy Latest Commit

4. **Verify** using the diagnostic endpoint:
   ```bash
   curl https://gnn-hf-backend.onrender.com/api/cors-check
   ```

---

## How CORS Works in This App

### Configuration (server.js)

```javascript
// ✅ CORRECT: Returns false on rejection
callback(null, false);

// ❌ WRONG: Throws error (crashes request)
callback(new Error("Not allowed"));
```

### Features

1. **Automatic trailing slash removal** - `https://example.com/` → `https://example.com`
2. **URL validation at startup** - Invalid URLs prevent server from starting
3. **Detailed error logging** - Shows exactly what to add to FRONTEND_URL
4. **Diagnostic endpoint** - `/api/cors-check` helps debug issues
5. **Health check includes CORS info** - `/health` shows configured origins

---

## Diagnostic Tools

### 1. Health Check
```bash
curl https://gnn-hf-backend.onrender.com/health
```

Returns CORS configuration:
```json
{
  "cors": {
    "configured": true,
    "allowedOrigins": ["https://gnn-hf-frontend.onrender.com"],
    "originCount": 1
  }
}
```

### 2. CORS Check
```bash
curl https://gnn-hf-backend.onrender.com/api/cors-check
```

Returns:
```json
{
  "status": "success",
  "requestOrigin": "your-origin",
  "isAllowed": true,
  "configuredOrigins": [...],
  "tip": "✅ Your origin is allowed"
}
```

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Use trailing slashes in FRONTEND_URL: `https://example.com/`
- Throw errors in CORS callback
- Use wildcard `*` in production
- Forget to redeploy after env var changes

✅ **DO:**
- Remove trailing slashes: `https://example.com`
- Return `false` to reject CORS requests
- Use specific origins in allowlist
- Check backend logs for detailed CORS errors

---

## Testing Locally

### Backend (.env)
```env
FRONTEND_URL=http://localhost:8080,http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start both servers and verify login works.

---

## Emergency Debugging

If CORS issues persist:

1. Check backend logs on Render:
   ```
   Render → Backend Service → Logs
   ```

2. Look for these lines on startup:
   ```
   ✅ CORS allowed origins: [ 'https://...' ]
   ```

3. Try the diagnostic endpoint from the frontend origin:
   ```javascript
   fetch('https://gnn-hf-backend.onrender.com/api/cors-check')
     .then(r => r.json())
     .then(console.log);
   ```

4. Verify environment variables are set:
   ```
   Render → Backend Service → Environment
   ```

---

## Contact

If issues persist after following this guide, check:
- Backend logs for detailed error messages
- Frontend network tab for exact error
- `/api/cors-check` response for configuration mismatch
