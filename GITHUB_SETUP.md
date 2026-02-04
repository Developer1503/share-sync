# GitHub Setup Guide for ShareSync

## ✅ Local Git Repository Created!

Your code has been committed locally with the following files:
- `.gitignore`
- `README.md`
- `TESTING_GUIDE.md`
- `package.json` & `package-lock.json`
- `server.js`
- `public/app.js`
- `public/index.html`
- `public/style.css`

**Commit**: `Initial commit: ShareSync real-time text sharing app with tabbed UI`

---

## 🚀 Next Steps: Push to GitHub

### Option 1: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop** (if you haven't): https://desktop.github.com
2. Open GitHub Desktop
3. Click **File → Add Local Repository**
4. Select folder: `c:\project web dev\share`
5. Click **Publish repository** button
6. Choose a name (e.g., "sharesync" or "text-sharing-app")
7. Add description: "Real-time text sharing application with WebSocket"
8. Choose **Public** or **Private**
9. Click **Publish repository**

Done! Your code is now on GitHub.

### Option 2: Using Command Line

#### Step 1: Create a Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `sharesync` (or your preferred name)
3. Description: "Real-time text sharing application"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (you already have one)
6. Click **Create repository**

#### Step 2: Link and Push

Run these commands in your terminal:

```bash
cd "c:\project web dev\share"

# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (GitHub default)
git branch -M main

# Push your code
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/vedantshinde/sharesync.git
git branch -M main
git push -u origin main
```

You'll be prompted to sign in to GitHub if needed.

---

## 🔄 Future Updates

After initial push, to commit new changes:

```bash
# Add all changed files
git add .

# Commit with message
git commit -m "Your descriptive message here"

# Push to GitHub
git push
```

---

## 📝 Update README

After pushing, don't forget to update the README.md clone URL:

Change this line in README.md:
```bash
git clone https://github.com/YOUR_USERNAME/sharesync.git
```

To your actual GitHub URL.

---

## 🎯 What's Next?

Once on GitHub, you can:
1. ✅ **Share your project** with others
2. ✅ **Deploy to production** (Render, Railway, Heroku)
3. ✅ **Enable Issues** for bug reports
4. ✅ **Add topics/tags** for discoverability
5. ✅ **Create a live demo** and add the link to README

---

## 🌐 Quick Deploy to Render

After pushing to GitHub:

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click **New → Web Service**
4. Select your repository
5. Settings:
   - **Name**: sharesync
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **Create Web Service**

You'll get a live URL like: `https://sharesync.onrender.com` 🎉

---

Need help? Let me know!
