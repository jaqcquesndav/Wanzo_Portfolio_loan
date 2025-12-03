import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the current directory (dist/)
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', app: 'Wanzo Portfolio' });
});

// Catch-all route for SPA - Must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Wanzo Portfolio app listening on port ${PORT}`);
});
