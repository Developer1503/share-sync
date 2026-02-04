# ShareSync - Real-Time Text Sharing

![ShareSync Logo](https://img.shields.io/badge/ShareSync-Real--Time-7c3aed?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

**Share text and links instantly across devices using simple room codes. No login required.**

## ✨ Features

- 🚀 **Real-Time Sync** - Messages appear instantly on all devices
- 🔐 **Room-Based Isolation** - Private rooms with unique codes
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- 🔄 **Easy to Use** - Create or join rooms in seconds
- 📋 **Copy to Clipboard** - One-click message copying
- 🚫 **No Database** - In-memory storage, no persistence
- 🔒 **No Login Required** - Zero friction, just share and go

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/sharesync.git

# Navigate to project directory
cd sharesync

# Install dependencies
npm install

# Start the server
npm start
```

The application will be running at `http://localhost:3000`

## 💻 Usage

### Creating a Room
1. Click on the **"Create Room"** tab
2. Click **"Generate Room Code"**
3. Share the 6-character code with others
4. Click **"Join This Room"** to enter

### Joining a Room
1. Click on the **"Join Room"** tab
2. Enter the room code you received
3. Click **"Join Room"**
4. Start sharing text instantly!

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Real-Time Communication**: Socket.io
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with modern design patterns

## 📁 Project Structure

```
sharesync/
├── server.js              # Express + Socket.io server
├── package.json           # Project dependencies
├── public/
│   ├── index.html        # Main HTML structure
│   ├── style.css         # Modern styling
│   └── app.js            # Client-side logic
└── README.md             # This file
```

## 🔧 Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 🌐 Deployment

This app can be deployed to:
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Heroku](https://heroku.com)
- [Vercel](https://vercel.com) (with serverless functions)

### Deploy to Render (Recommended)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎯 Future Enhancements

- [ ] File sharing support
- [ ] Message encryption
- [ ] Room passwords
- [ ] Message history (optional)
- [ ] Dark/Light theme toggle
- [ ] Custom room names
- [ ] User avatars

## 🐛 Known Issues

- Room codes must match exactly (case-insensitive but must be same length)
- Messages are not persisted after all users leave

## 👨‍💻 Author

Built with ❤️ using Socket.io

---

**⭐ Star this repo if you find it useful!**
