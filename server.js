import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Database folder and file
const DB_DIR = path.join(__dirname, 'database');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper to read database
function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading DB:', err);
  }
  return null;
}

// Helper to write database safely (atomic write)
function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET state
app.get('/api/state', (req, res) => {
  const dbData = readDb();
  if (!dbData) {
    return res.status(404).json({ message: 'No stored state found' });
  }
  res.json(dbData);
});

// POST save whole state
app.post('/api/state', (req, res) => {
  const { departments, jobs, employees, auditLogs, activeTemplateKey } = req.body;
  if (!departments || !jobs || !employees) {
    return res.status(400).json({ error: 'Missing required state fields' });
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    departments,
    jobs,
    employees,
    auditLogs: auditLogs || [],
    activeTemplateKey: activeTemplateKey || 'pge-structure',
  };

  const ok = writeDb(payload);
  if (ok) {
    res.json({ success: true, updatedAt: payload.updatedAt });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// Reset endpoint
app.post('/api/reset', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  res.json({ success: true, message: 'Database reset' });
});

app.listen(PORT, () => {
  console.log(`[Database Backend] Running persistently on http://localhost:${PORT}`);
  console.log(`[Database Storage] File located at: ${DB_FILE}`);
});
