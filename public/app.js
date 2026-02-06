// Initialize Socket.io connection
// Connect to same server (works for both local and Vercel deployment)
const BACKEND_URL = window.location.protocol === 'file:'
    ? 'http://localhost:3000'  // Local file opening
    : window.location.origin;   // Same server (localhost or Vercel URL)

// Connection configuration optimized for persistent server
const socket = io(BACKEND_URL, {
    // WebSocket-first for better performance on persistent servers
    transports: ['websocket', 'polling'],
    // Reconnection settings
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    // Timeout settings
    timeout: 20000,
    // Auto-connect
    autoConnect: true,
    // Query parameters for debugging
    query: {
        clientTime: Date.now()
    }
});

// Connection state tracking
let connectionAttempts = 0;
let isConnected = false;
let connectionStatusIndicator = null;

// Create connection status indicator
function createConnectionStatusIndicator() {
    if (!connectionStatusIndicator) {
        connectionStatusIndicator = document.createElement('div');
        connectionStatusIndicator.id = 'connection-status';
        connectionStatusIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
        document.body.appendChild(connectionStatusIndicator);
    }
    return connectionStatusIndicator;
}

// Update connection status UI
function updateConnectionStatus(status, message) {
    const indicator = createConnectionStatusIndicator();

    const statusConfig = {
        connecting: {
            bg: '#FFA500',
            color: '#ffffff',
            icon: '🔄',
            text: message || 'Connecting...'
        },
        connected: {
            bg: '#10b981',
            color: '#ffffff',
            icon: '✓',
            text: 'Connected'
        },
        disconnected: {
            bg: '#ef4444',
            color: '#ffffff',
            icon: '✗',
            text: message || 'Disconnected'
        },
        error: {
            bg: '#ef4444',
            color: '#ffffff',
            icon: '⚠',
            text: message || 'Connection Error'
        }
    };

    const config = statusConfig[status];
    if (config) {
        indicator.style.backgroundColor = config.bg;
        indicator.style.color = config.color;
        indicator.innerHTML = `<span>${config.icon}</span><span>${config.text}</span>`;

        // Auto-hide "connected" status after 3 seconds
        if (status === 'connected') {
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 300);
            }, 3000);
        } else {
            indicator.style.opacity = '1';
            indicator.style.display = 'flex';
        }
    }
}

// DOM Elements - Join Screen
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const roomCodeInput = document.getElementById('room-code-input');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const generatedCodeContainer = document.getElementById('generated-code-container');
const generatedCodeDisplay = document.getElementById('generated-code-display');
const copyCodeBtn = document.getElementById('copy-code-btn');

// DOM Elements - Chat Screen
const leaveRoomBtn = document.getElementById('leave-room-btn');
const currentRoomCode = document.getElementById('current-room-code');
const userCount = document.getElementById('user-count');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const toast = document.getElementById('toast');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// State
let currentRoom = null;
let generatedCode = null;

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        // Reset generated code display when switching tabs
        if (tabName === 'create') {
            generatedCodeContainer.style.display = 'none';
            createRoomBtn.textContent = '';
            createRoomBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M21 3V7M21 7H17M21 7L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Generate Room Code
      `;
            generatedCode = null;
        }

        // Focus appropriate input
        if (tabName === 'join') {
            setTimeout(() => roomCodeInput.focus(), 100);
        }
    });
});

// Generate random room code
function generateRoomCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Switch screens
function showScreen(screen) {
    joinScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    screen.classList.add('active');
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('✓ Copied to clipboard');
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('✓ Copied to clipboard');
        } catch (e) {
            showToast('✗ Failed to copy');
        }
        document.body.removeChild(textarea);
    }
}

// Add message to UI (Replaces current message)
function addMessage(message, timestamp) {
    // Clear container completely to only show ONE item
    messagesContainer.innerHTML = '';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message active-display';

    // Detect if it's a link
    const isUrl = /^(https?:\/\/[^\s]+)$/i.test(message.trim());

    let contentHtml = `<div class="message-text">${escapeHtml(message)}</div>`;

    if (isUrl) {
        contentHtml = `
            <div class="link-preview">
                <div class="link-icon">🔗</div>
                <a href="${escapeHtml(message)}" target="_blank" class="shared-link">${escapeHtml(message)}</a>
                <p class="link-hint">Click to open link in new tab</p>
            </div>
        `;
    }

    messageDiv.innerHTML = `
    <div class="message-content">
      ${contentHtml}
      <div class="message-footer">
        <span class="message-time">Last updated: ${formatTime(timestamp)}</span>
        <button class="btn-copy" onclick="copyMessage(this)">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Copy Content
        </button>
      </div>
    </div>
  `;

    messagesContainer.appendChild(messageDiv);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy message (global function for onclick)
window.copyMessage = function (button) {
    const messageText = button.closest('.message-content').querySelector('.message-text').textContent;
    copyToClipboard(messageText);
};

// Auto-resize textarea
messageInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Create Room - Generate code and show it
createRoomBtn.addEventListener('click', () => {
    if (!generatedCode) {
        // Generate new code
        generatedCode = generateRoomCode();
        generatedCodeDisplay.textContent = generatedCode;
        generatedCodeContainer.style.display = 'block';

        // Update button to "Join This Room"
        createRoomBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Join This Room
    `;

        console.log('Generated room code:', generatedCode);
        showToast('Room code generated!');
    } else {
        // Join the generated room
        console.log('🚀 Joining generated room:', generatedCode);
        currentRoom = generatedCode;
        socket.emit('join-room', generatedCode);
    }
});

// Copy generated code
copyCodeBtn.addEventListener('click', () => {
    if (generatedCode) {
        copyToClipboard(generatedCode);
    }
});

// Join room with manual code
joinRoomBtn.addEventListener('click', () => {
    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (!roomCode) {
        showToast('Please enter a room code');
        return;
    }

    if (roomCode.length < 4) {
        showToast('Room code must be at least 4 characters');
        return;
    }

    console.log('🚀 Attempting to join room:', roomCode, 'Length:', roomCode.length);
    currentRoom = roomCode;
    socket.emit('join-room', roomCode);
});

// Allow Enter key to join room
roomCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        joinRoomBtn.click();
    }
});

// Send message
function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    if (!currentRoom) {
        showToast('Not connected to a room');
        return;
    }

    const timestamp = Date.now();

    console.log('📤 Sending message to room:', currentRoom, '| Message:', message);

    socket.emit('send-message', {
        roomCode: currentRoom,
        message: message,
        timestamp: timestamp
    });

    messageInput.value = '';
    messageInput.style.height = 'auto';
    messageInput.focus();
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Leave room
leaveRoomBtn.addEventListener('click', () => {
    if (currentRoom) {
        console.log('👋 Leaving room:', currentRoom);
        socket.emit('leave-room', currentRoom); // Properly leave current room
        currentRoom = null;
    }

    // Reset the join screen
    generatedCode = null;
    generatedCodeContainer.style.display = 'none';
    roomCodeInput.value = '';
    createRoomBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M21 3V7M21 7H17M21 7L15 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Generate Room Code
  `;

    messagesContainer.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p>No messages yet</p>
      <span>Send a message to get started</span>
    </div>
  `;

    showScreen(joinScreen);
    showToast('Left room');
});

// Socket event listeners
socket.on('room-joined', ({ roomCode, currentData }) => {
    console.log('✅ Successfully joined room:', roomCode);
    currentRoomCode.textContent = roomCode;
    showScreen(chatScreen);
    messageInput.focus();
    showToast('✓ Joined room: ' + roomCode);

    // If there's already data in the room, show it
    if (currentData) {
        addMessage(currentData.message, currentData.timestamp);
    }
});

socket.on('receive-message', ({ message, timestamp, socketId }) => {
    console.log('📨 Received message from socket', socketId, ':', message);
    addMessage(message, timestamp);
});

socket.on('room-users-update', (count) => {
    console.log('👥 Room users updated. Total devices:', count);
    const deviceText = count === 1 ? 'device' : 'devices';
    userCount.textContent = `${count} ${deviceText} connected`;
});

socket.on('connect', () => {
    isConnected = true;
    connectionAttempts = 0;
    console.log('🔌 Connected to server with socket ID:', socket.id);
    console.log('   Transport:', socket.io.engine.transport.name);
    updateConnectionStatus('connected');

    // If user was in a room, rejoin after reconnection
    if (currentRoom) {
        console.log('🔄 Rejoining room after reconnection:', currentRoom);
        socket.emit('join-room', currentRoom);
    }
});

socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log('🔌 Disconnected from server. Reason:', reason);
    updateConnectionStatus('disconnected', 'Connection lost');
    showToast('Disconnected from server. Reconnecting...');

    // Don't immediately leave room - allow reconnection
    if (currentRoom && reason === 'io server disconnect') {
        // Server disconnected us - return to join screen after delay
        setTimeout(() => {
            if (!isConnected) {
                showScreen(joinScreen);
                currentRoom = null;
            }
        }, 5000);
    }
});

// Handle connection errors
socket.on('connect_error', (error) => {
    connectionAttempts++;
    console.error('❌ Connection error:', error.message);
    console.log('   Attempt:', connectionAttempts);
    updateConnectionStatus('error', `Connection error (attempt ${connectionAttempts})`);

    if (connectionAttempts > 5) {
        showToast('⚠ Connection issues. Please check your internet.');
    }
});

// Handle reconnection attempts
socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt:', attemptNumber);
    updateConnectionStatus('connecting', `Reconnecting (${attemptNumber})...`);
});

// Handle successful reconnection
socket.on('reconnect', (attemptNumber) => {
    console.log('✅ Reconnected after', attemptNumber, 'attempts');
    connectionAttempts = 0;
    isConnected = true;
    updateConnectionStatus('connected', 'Reconnected!');
    showToast('✓ Reconnected to server');
});

// Handle reconnection failure
socket.on('reconnect_failed', () => {
    console.error('❌ Reconnection failed');
    updateConnectionStatus('error', 'Cannot connect to server');
    showToast('✗ Cannot connect to server. Please refresh the page.');

    if (currentRoom) {
        setTimeout(() => {
            showScreen(joinScreen);
            currentRoom = null;
        }, 3000);
    }
});

// Initial focus - create tab is active by default
console.log('🎯 ShareSync loaded. Open browser console to see debug logs.');
console.log('🌐 Backend URL:', BACKEND_URL);
console.log('🔧 Socket.IO Transports:', socket.io.opts.transports);

// Show initial connection status
updateConnectionStatus('connecting', 'Connecting to server...');
