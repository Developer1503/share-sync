# ShareSync - Deployment Guide

## 🚀 Deploy to Vercel

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Vercel will automatically detect the configuration from `vercel.json`.

---

## ⚠️ Important: Socket.IO on Vercel

**Note:** Vercel uses serverless functions which have limitations with WebSocket connections:
- WebSocket connections may drop after some time
- Connections will use **polling transport** instead of WebSocket
- This is normal for Vercel's architecture

**What this means:**
- ✅ Your app will still work
- ✅ Messages will sync in real-time
- ⚠️ Connection might drop occasionally (will auto-reconnect)
- ⚠️ Using polling instead of WebSocket (slightly slower but reliable)

---

## 🧪 Local Testing

```bash
# Start the server
npm start

# Open in browser
# Go to: http://localhost:3000
# Or open: public/index.html directly
```

---

## 📝 How It Works

| Environment | Frontend | Backend | Connection |
|-------------|----------|---------|------------|
| **Local** | public/index.html | localhost:3000 | ✅ WebSocket |
| **Vercel** | Static files | Serverless function | ⚠️ Polling (more reliable) |

---

## 🔧 Troubleshooting

### Connection Issues on Vercel

If you see connection errors after deploying:

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors

2. **Connection Drops**
   - This is expected on Vercel's free tier
   - App will auto-reconnect
   - Consider upgrading to Vercel Pro for better stability

3. **Messages Not Syncing**
   - Refresh both devices
   - Check browser console for errors
   - Ensure both are using the same room code

---

## 💡 Alternative: Better WebSocket Support

If you need **stable WebSocket connections** without drops:

**Option 1: Deploy backend separately**
- Use Render.com, Railway.app, or Fly.io for backend
- Keep frontend on Vercel
- Update `BACKEND_URL` in `public/app.js`

**Option 2: Deploy everything to Render**
- Deploy both frontend + backend to Render
- Better for real-time apps
- Free tier available

---

## 📊 Current Configuration

- ✅ Socket.IO client loaded from CDN
- ✅ Auto-detects local vs production
- ✅ Connection status indicator
- ✅ Auto-reconnect enabled
- ✅ Works with Vercel serverless

---

**Ready to deploy?** Just push to GitHub and import to Vercel!
