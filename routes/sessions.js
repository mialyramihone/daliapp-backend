const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');


router.post('/start', auth, async (req, res) => {
  const { task_id, session_type } = req.body;
  const result = await pool.query(
    'INSERT INTO time_sessions (task_id, user_id, start_time, session_type) VALUES ($1,$2,NOW(),$3) RETURNING *',
    [task_id, req.user.id, session_type || 'work']
  );
  res.status(201).json(result.rows[0]);
});


router.put('/stop/:id', auth, async (req, res) => {
  const result = await pool.query(
    `UPDATE time_sessions SET end_time=NOW(),
     duration=EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER
     WHERE id=$1 RETURNING *`,
    [req.params.id]
  );
  res.json(result.rows[0]);
});


router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT ts.*, t.title FROM time_sessions ts JOIN tasks t ON ts.task_id=t.id WHERE ts.user_id=$1 ORDER BY start_time DESC',
    [req.user.id]
  );
  res.json(result.rows);
});

module.exports = router;