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

// Session storage (in-memory for demo, use Redis in production)
const sessions = {};

// ==================== API ROUTES ====================

// GET all tournaments (public)
app.get('/api/tournaments', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tournaments] = await connection.query('SELECT * FROM tournaments ORDER BY start_date DESC');
    connection.release();
    res.json(tournaments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// GET single tournament
app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tournament] = await connection.query('SELECT * FROM tournaments WHERE id = ?', [req.params.id]);
    connection.release();
    if (tournament.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// POST - Register for tournament
app.post('/api/register', async (req, res) => {
  const { tournament_id, team_name, email, phone, players_count, additional_info } = req.body;

  // Validation
  if (!tournament_id || !team_name || !email || !players_count) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Check if tournament exists
    const [tournament] = await connection.query('SELECT id FROM tournaments WHERE id = ?', [tournament_id]);
    if (tournament.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Insert registration
    const [result] = await connection.query(
      'INSERT INTO registrations (tournament_id, team_name, email, phone, players_count, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
      [tournament_id, team_name, email, phone, players_count, additional_info || null]
    );

    connection.release();
    res.json({ 
      success: true, 
      message: 'Registration successful!',
      registration_id: result.insertId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ==================== ADMIN ROUTES ====================

// POST - Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const match = await bcryptjs.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const sessionId = Math.random().toString(36).substr(2, 9);
    sessions[sessionId] = {
      userId: user.id,
      username: user.username,
      timestamp: Date.now()
    };

    res.json({ 
      success: true, 
      sessionId,
      message: 'Login successful'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware - Check admin session
const checkAdminAuth = (req, res, next) => {
  // Try to find session ID in headers, query string (for downloads), or authorization header
  const sessionId =
    req.headers['x-session-id'] ||
    req.query['x-session-id'] ||
    req.headers['authorization'] ||
    (req.headers['sec-websocket-protocol']); // Fallback check

  if (!sessionId || !sessions[sessionId]) {
    console.log(`Auth Failed: No session found for ID: ${sessionId}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if session expired (24 hours)
  if (Date.now() - sessions[sessionId].timestamp > 24 * 60 * 60 * 1000) {
    delete sessions[sessionId];
    return res.status(401).json({ error: 'Session expired' });
  }

  req.admin = sessions[sessionId];
  next();
};

// GET admin tournaments (for dashboard)
app.get('/api/admin/tournaments', checkAdminAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tournaments] = await connection.query('SELECT * FROM tournaments ORDER BY start_date DESC');
    connection.release();
    res.json(tournaments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// POST - Create tournament
app.post('/api/admin/tournaments', checkAdminAuth, async (req, res) => {
  const { name, game_type, description, start_date, end_date, prize_pool, status } = req.body;

  if (!name || !game_type || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO tournaments (name, game_type, description, start_date, end_date, prize_pool, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, game_type, description || null, start_date, end_date, prize_pool || null, status || 'upcoming']
    );
    connection.release();

    res.json({ 
      success: true, 
      message: 'Tournament created successfully',
      tournament_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// PUT - Update tournament
app.put('/api/admin/tournaments/:id', checkAdminAuth, async (req, res) => {
  const { name, game_type, description, start_date, end_date, prize_pool, status, youtube_link } = req.body;
  const tournamentId = req.params.id;

  try {
    const connection = await pool.getConnection();
    
    // Build dynamic update query
    let updateFields = [];
    let values = [];
    
    if (name !== undefined) { updateFields.push('name = ?'); values.push(name); }
    if (game_type !== undefined) { updateFields.push('game_type = ?'); values.push(game_type); }
    if (description !== undefined) { updateFields.push('description = ?'); values.push(description); }
    if (start_date !== undefined) { updateFields.push('start_date = ?'); values.push(start_date); }
    if (end_date !== undefined) { updateFields.push('end_date = ?'); values.push(end_date); }
    if (prize_pool !== undefined) { updateFields.push('prize_pool = ?'); values.push(prize_pool); }
    if (status !== undefined) { updateFields.push('status = ?'); values.push(status); }
    if (youtube_link !== undefined) { updateFields.push('youtube_link = ?'); values.push(youtube_link); }

    if (updateFields.length === 0) {
      connection.release();
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(tournamentId);
    const query = `UPDATE tournaments SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await connection.query(query, values);
    connection.release();

    res.json({ success: true, message: 'Tournament updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// DELETE - Delete tournament
app.delete('/api/admin/tournaments/:id', checkAdminAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM tournaments WHERE id = ?', [req.params.id]);
    connection.release();

    res.json({ success: true, message: 'Tournament deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

// GET - Registrations for a tournament
app.get('/api/admin/registrations/:tournament_id', checkAdminAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [registrations] = await connection.query(
      'SELECT * FROM registrations WHERE tournament_id = ? ORDER BY created_at DESC',
      [req.params.tournament_id]
    );
    connection.release();
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// POST - Export registrations to Excel
app.post('/api/admin/export', checkAdminAuth, async (req, res) => {
  const { tournament_id } = req.body;

  try {
    const connection = await pool.getConnection();
    
    // Get tournament details
    const [tournaments] = await connection.query('SELECT name FROM tournaments WHERE id = ?', [tournament_id]);
    const [registrations] = await connection.query(
      'SELECT team_name, email, phone, players_count, additional_info, created_at FROM registrations WHERE tournament_id = ? ORDER BY created_at DESC',
      [tournament_id]
    );
    connection.release();

    if (tournaments.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (registrations.length === 0) {
      return res.status(400).json({ error: 'No registrations found for this tournament' });
    }

    const tournamentName = tournaments[0].name;

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(registrations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    // Generate file
    const fileName = `${tournamentName.replace(/\s+/g, '_')}_registrations_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, 'exports', fileName);

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    XLSX.writeFile(wb, filePath);

    res.json({ 
      success: true, 
      message: 'Export successful',
      fileName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// GET - Download exported file
app.get('/api/admin/download/:fileName', checkAdminAuth, (req, res) => {
  const filePath = path.join(__dirname, 'exports', req.params.fileName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath);
});

// ==================== SERVE STATIC FILES ====================

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check for Railway
app.get('/health', (req, res) => res.send('OK'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Unique Esports Server is LIVE on port ${PORT}`);
});
