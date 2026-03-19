const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');


router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY scheduled_date ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.post('/', auth, async (req, res) => {
  const { title, description, category_id, priority, estimated_duration, scheduled_date, scheduled_time } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, category_id, title, description, priority, estimated_duration, scheduled_date, scheduled_time)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id, category_id, title, description, priority, estimated_duration, scheduled_date, scheduled_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.put('/:id', auth, async (req, res) => {
  const { title, description, priority, status, estimated_duration, scheduled_date, scheduled_time } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, priority=$3, status=$4,
       estimated_duration=$5, scheduled_date=$6, scheduled_time=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [title, description, priority, status, estimated_duration, scheduled_date, scheduled_time, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;