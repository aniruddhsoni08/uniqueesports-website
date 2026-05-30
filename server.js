const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const pool = require('./db');
const bcryptjs = require('bcryptjs');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Session storage
const sessions = {};

// Health check for Railway
app.get('/health', (req, res) => res.status(200).send('OK'));

// ==================== API ROUTES ====================

app.get('/api/tournaments', async (req, res) => {
  try {
    const [tournaments] = await pool.query('SELECT * FROM tournaments ORDER BY start_date DESC');
    res.json(tournaments);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const [tournament] = await pool.query('SELECT * FROM tournaments WHERE id = ?', [req.params.id]);
    if (tournament.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(tournament[0]);
  } catch (err) {
    res.status(500).json({ error: 'Query failed' });
  }
});

app.post('/api/register', async (req, res) => {
  const { tournament_id, team_name, email, phone, players_count, additional_info } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO registrations (tournament_id, team_name, email, phone, players_count, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
      [tournament_id, team_name, email, phone, players_count, additional_info || null]
    );
    res.json({ success: true, registration_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid user' });

    const user = users[0];
    const match = await bcryptjs.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Wrong password' });

    const sessionId = Math.random().toString(36).substr(2, 9);
    sessions[sessionId] = { userId: user.id, username: user.username, timestamp: Date.now() };
    res.json({ success: true, sessionId });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

const checkAdminAuth = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query['x-session-id'];
  if (!sessionId || !sessions[sessionId]) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

app.get('/api/admin/tournaments', checkAdminAuth, async (req, res) => {
  try {
    const [tournaments] = await pool.query('SELECT * FROM tournaments ORDER BY start_date DESC');
    res.json(tournaments);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/admin/tournaments', checkAdminAuth, async (req, res) => {
  const { name, game_type, start_date, end_date, prize_pool, status } = req.body;
  try {
    await pool.query(
      'INSERT INTO tournaments (name, game_type, start_date, end_date, prize_pool, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, game_type, start_date, end_date, prize_pool || null, status || 'upcoming']
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Create failed' }); }
});

app.put('/api/admin/tournaments/:id', checkAdminAuth, async (req, res) => {
  const { name, status, prize_pool, youtube_link } = req.body;
  try {
    await pool.query(
      'UPDATE tournaments SET name=?, status=?, prize_pool=?, youtube_link=? WHERE id=?',
      [name, status, prize_pool, youtube_link, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

app.delete('/api/admin/tournaments/:id', checkAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tournaments WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.get('/api/admin/registrations/:tournament_id', checkAdminAuth, async (req, res) => {
  try {
    const [regs] = await pool.query('SELECT * FROM registrations WHERE tournament_id=? ORDER BY created_at DESC', [req.params.tournament_id]);
    res.json(regs);
  } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
});

app.post('/api/admin/export', checkAdminAuth, async (req, res) => {
  const { tournament_id } = req.body;
  try {
    const [tournaments] = await pool.query('SELECT name FROM tournaments WHERE id = ?', [tournament_id]);
    const [registrations] = await pool.query('SELECT team_name, email, phone, players_count, created_at FROM registrations WHERE tournament_id = ?', [tournament_id]);
    
    if (tournaments.length === 0 || registrations.length === 0) return res.status(400).json({ error: 'No data' });

    const ws = XLSX.utils.json_to_sheet(registrations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    const fileName = `export_${Date.now()}.xlsx`;
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir);

    const filePath = path.join(exportsDir, fileName);
    XLSX.writeFile(wb, filePath);
    res.json({ success: true, fileName });
  } catch (err) { res.status(500).json({ error: 'Export failed' }); }
});

app.get('/api/admin/download/:fileName', checkAdminAuth, (req, res) => {
  const filePath = path.join(__dirname, 'exports', req.params.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.download(filePath);
});

// Serve HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Start listening immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Server is LIVE on port ${PORT}`);
});
