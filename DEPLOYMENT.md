# Deployment Guide - Split Architecture

## 🏗️ Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  Frontend       │         │  Backend         │
│  (Vercel)       │ ──────► │  (Render.com)    │
│  Static HTML/JS │  CORS   │  Socket.IO       │
└─────────────────┘         └──────────────────┘
```

**Why this architecture?**
- Frontend: Static files work great on Vercel
- Backend: Socket.IO needs persistent server (Render provides this)
- No more connection drops or SSL errors!

---

## 🚀 Step 1: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repo: `share` (or whatever you named it)

3. **Configure Service**
   ```
   Name:             sharesync-backend
   Region:           Any (choose closest to your users)
   Branch:           main
   Root Directory:   (leave blank or set to project folder)
   Environment:      Node
   Build Command:    npm install
   Start Command:    npm start
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Copy your service URL: `https://sharesync-backend.onrender.com`

### Option B: Using render.yaml (Auto-deploy)

The `render.yaml` file is already created. Just:
1. Push your code to GitHub
2. In Render dashboard, select "Blueprint"
3. Connect your repo
4. Render will auto-configure from `render.yaml`

---

## 🌐 Step 2: Update Frontend URL

After Render deployment completes:

1. **Get your Render backend URL**
   - Example: `https://sharesync-backend.onrender.com`

2. **Update `public/app.js`**
   - Find line: `const BACKEND_URL = ...`
   - Replace the URL:
   ```javascript
   const BACKEND_URL = window.location.hostname === 'localhost' 
     ? 'http://localhost:3000'
     : 'https://YOUR-RENDER-URL.onrender.com'; // ← Update this
   ```

3. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Update backend URL to Render"
   git push
   ```

---

## 📦 Step 3: Deploy Frontend to Vercel

### Update Vercel Configuration

The `vercel.json` needs to be simplified for frontend-only:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### Deploy to Vercel

**Option A: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Deploy (it will use the `vercel.json` config)

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel
```

---

## ✅ Step 4: Test the Deployment

1. **Open your Vercel frontend URL**
   - Example: `https://sharesync.vercel.app`

2. **Check Connection Indicator**
   - Top-right corner should show:
   - 🔄 Orange "Connecting..." → ✓ Green "Connected"

3. **Open Browser Console (F12)**
   - Should see:
   ```
   🎯 ShareSync loaded
   🌐 Backend URL: https://sharesync-backend.onrender.com
   🔌 Connected to server with socket ID: xyz123
      Transport: websocket
   ```

4. **Test Functionality**
   - Create a room
   - Open in another browser/device
   - Send messages
   - Verify real-time sync works!

---

## 🔍 Troubleshooting

### Backend Issues

**"Service Unavailable" on Render:**
- Check Render logs (Dashboard → Your Service → Logs)
- Verify `npm start` command is correct
- Check if PORT is set (Render auto-sets PORT=10000)

**CORS Errors:**
- Verify `cors: { origin: "*" }` in `server.js`
- Or restrict to your Vercel domain: `origin: "https://sharesync.vercel.app"`

### Frontend Issues

**Cannot connect to backend:**
- Verify `BACKEND_URL` points to correct Render URL
- Check browser console for errors
- Verify Render service is running (check Render dashboard)

**WebSocket upgrade fails:**
- This is normal! It will fallback to polling
- Both transports work on persistent servers

---

## 💰 Cost

- **Render Free Tier**: Good for development and small projects
  - Sleeps after 15 min of inactivity
  - Wakes up on first request (2-3 second delay)
  
- **Render Paid ($7/mo)**: For production
  - Always-on (no sleep)
  - Better performance
  - Free SSL

- **Vercel**: Free tier is perfect for static frontend

---

## 🎯 Local Development

```bash
# Terminal 1 - Backend
cd c:\project web dev\share
npm start
# Runs on http://localhost:3000

# Terminal 2 - Frontend (optional: serve static files)
cd c:\project web dev\share\public
python -m http.server 8000
# Or just open public/index.html directly
```

The frontend will auto-detect localhost and connect to local backend.

---

## 📝 Quick Reference

| Environment | Frontend URL | Backend URL |
|-------------|--------------|-------------|
| **Local** | `file:///...` or localhost:8000 | `http://localhost:3000` |
| **Production** | `https://sharesync.vercel.app` | `https://sharesync-backend.onrender.com` |

---

## ✨ Benefits of This Setup

✅ **No more connection drops** - Persistent server handles WebSocket correctly  
✅ **No SSL errors** - Proper WebSocket upgrade support  
✅ **Free hosting** - Both Vercel and Render have free tiers  
✅ **Scalable** - Each service scales independently  
✅ **Better performance** - WebSocket-first instead of polling  

---

**Ready to deploy?** Start with Step 1 (Backend to Render) above! 🚀
