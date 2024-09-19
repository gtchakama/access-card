const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// In-memory storage for API keys and sample data
const apiKeys = new Map();
const sampleData = [
  { id: 1, name: 'Item 1', description: 'This is item 1' },
  { id: 2, name: 'Item 2', description: 'This is item 2' },
  { id: 3, name: 'Item 3', description: 'This is item 3' },
];

// Usage tracking
const usageStats = new Map();

// Generate a new API key
function generateApiKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Middleware to check API key validity
function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is missing' });
  }

  const keyData = apiKeys.get(apiKey);
  if (!keyData) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (Date.now() > keyData.expiresAt) {
    apiKeys.delete(apiKey);
    return res.status(401).json({ error: 'API key has expired' });
  }

  // Update usage stats
  if (!usageStats.has(apiKey)) {
    usageStats.set(apiKey, 0);
  }
  usageStats.set(apiKey, usageStats.get(apiKey) + 1);

  // Emit usage update event
  io.emit('usageUpdate', { apiKey, usage: usageStats.get(apiKey) });

  next();
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the data page
app.get('/view-data', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view-data.html'));
});

// Generate a new API key
app.post('/generate-key', (req, res) => {
  const apiKey = generateApiKey();
  const name = req.body.name || 'Unnamed Key';
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  apiKeys.set(apiKey, { name, expiresAt });
  usageStats.set(apiKey, 0);

  io.emit('apiKeyUpdate', { type: 'new', key: apiKey, name, expiresAt });
  res.json({ apiKey, name, expiresAt });
});

// Get all API keys
app.get('/api-keys', (req, res) => {
  const keys = Array.from(apiKeys.entries()).map(([key, value]) => ({
    key,
    name: value.name,
    expiresAt: value.expiresAt,
    usage: usageStats.get(key) || 0
  }));
  res.json(keys);
});

// Revoke an API key
app.post('/revoke-key', (req, res) => {
  const { apiKey } = req.body;
  if (apiKeys.has(apiKey)) {
    apiKeys.delete(apiKey);
    usageStats.delete(apiKey);
    io.emit('apiKeyUpdate', { type: 'revoke', key: apiKey });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'API key not found' });
  }
});

// Extend API key expiration
app.post('/extend-key', (req, res) => {
  const { apiKey, extensionTime } = req.body;
  if (apiKeys.has(apiKey)) {
    const keyData = apiKeys.get(apiKey);
    keyData.expiresAt = Math.max(keyData.expiresAt, Date.now()) + extensionTime;
    apiKeys.set(apiKey, keyData);
    io.emit('apiKeyUpdate', { type: 'extend', key: apiKey, expiresAt: keyData.expiresAt });
    res.json({ success: true, expiresAt: keyData.expiresAt });
  } else {
    res.status(404).json({ error: 'API key not found' });
  }
});

// Get sample data (protected by API key)
app.get('/data', checkApiKey, (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const keyData = apiKeys.get(apiKey);
  res.json({
    data: sampleData,
    expiresAt: keyData.expiresAt,
    usage: usageStats.get(apiKey)
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });
});

server.listen(port, () => {
  console.log(`Enhanced API key management app listening at http://localhost:${port}`);
});
