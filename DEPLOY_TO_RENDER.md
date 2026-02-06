# ShareSync - Split Deployment Guide

## 🎯 The Problem
Vercel's serverless functions **cannot** handle Socket.IO's persistent WebSocket connections. 
Your app needs a **real server** that stays alive.

## ✅ The Solution
- **Frontend**: Deploy to Vercel (static files work great)
- **Backend**: Deploy to Render.com (free tier, persistent server)

---

## 📦 Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 1.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name:             share-backend
   Region:           Oregon (US West) or closest to you
   Branch:           main
   Root Directory:   (leave empty)
   Environment:      Node
   Build Command:    npm install
   Start Command:    npm start
   ```
4. Click **"Create Web Service"**
5. Wait 2-3 minutes for deployment
6. **Copy your service URL**: `https://share-backend-xxxx.onrender.com`

---

## 🔧 Step 2: Update Frontend to Point to Render Backend

After Render deployment succeeds, update your frontend:

### 2.1 Edit `public/app.js`
Find line 3 and update the BACKEND_URL:

```javascript
const BACKEND_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:3000'  // Local file opening
    : 'https://YOUR-RENDER-URL.onrender.com';  // ← REPLACE WITH YOUR ACTUAL RENDER URL
```

**Example:**
```javascript
const BACKEND_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:3000'
    : 'https://share-backend-a1b2.onrender.com';  // Your actual Render URL
```

### 2.2 Commit and Push
```bash
git add public/app.js
git commit -m "Update backend URL to Render"
git push
```

---

## 🌐 Step 3: Deploy Frontend to Vercel

Your `vercel.json` is already configured for frontend-only deployment.

### 3.1 Push to GitHub (if not already done)
```bash
git add .
git commit -m "Split architecture: Backend on Render"
git push
```

### 3.2 Deploy to Vercel
**Option A: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Click **"Deploy"**

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel
```

---

## ✅ Step 4: Test the Deployment

1. **Open your Vercel URL**: `https://your-app.vercel.app`
2. **Check connection indicator** (top-right): 🔄 → ✓
3. **Open browser console** (F12):
   ```
   ✅ Connected to server
   Backend URL: https://share-backend-xxxx.onrender.com
   Transport: websocket
   ```
4. **Test functionality**:
   - Generate a room code
   - Join from another device
   - Share a link
   - Verify it updates in real-time

---

## 🎨 Architecture Overview

```
┌──────────────────┐         ┌────────────────────┐
│  Vercel          │         │  Render.com        │
│  (Frontend)      │ ──────► │  (Backend)         │
│  Static Files    │  WSS    │  Socket.IO Server  │
│  HTML/CSS/JS     │         │  Persistent Node   │
└──────────────────┘         └────────────────────┘
```

---

## 💰 Cost

- **Render Free Tier**:
  - ✅ Good for development and low traffic
  - ⚠️ Sleeps after 15 min of inactivity (2-3 sec wake-up time)
  - ✅ 750 hours/month free

- **Render Starter ($7/mo)**:
  - ✅ Always-on (no sleep)
  - ✅ Better for production

- **Vercel**:
  - ✅ Free forever for static sites
  - ✅ Perfect for your frontend

---

## 🔍 Troubleshooting

### Backend Issues

**"Application failed to respond"**:
- Check Render logs: Dashboard → Your Service → Logs
- Verify `npm start` command in Render settings
- Ensure `PORT` environment variable is set (Render auto-sets this)

**CORS Errors**:
- Verify `cors: { origin: "*" }` in `server.js`
- Or restrict to your Vercel domain: `origin: "https://your-app.vercel.app"`

### Frontend Issues

**"Cannot connect to backend"**:
- Verify `BACKEND_URL` points to correct Render URL
- Check browser console for errors
- Ensure Render service is running (check Render dashboard)

**WebSocket still failing**:
- ✅ This is normal! On Render it will work
- ❌ Only fails on Vercel due to serverless limitations

---

## 🚀 Local Development

```bash
# Terminal 1 - Backend
npm start
# Runs on http://localhost:3000

# Terminal 2 - Frontend (optional)
cd public
python -m http.server 8000
# Or just open public/index.html directly
```

The frontend will auto-detect localhost and connect to local backend.

---

## 📝 Summary

| What | Where | Why |
|------|-------|-----|
| **Frontend** | Vercel | ✅ Fast, free, global CDN |
| **Backend** | Render | ✅ Persistent server for Socket.IO |
| **Why not all on Vercel?** | N/A | ❌ Serverless = no persistent WebSocket |
| **Why not all on Render?** | Optional | ✅ You can! Deploy both on Render if you prefer |

---

**Ready to deploy?** Start with Step 1 and deploy your backend to Render! 🎉
