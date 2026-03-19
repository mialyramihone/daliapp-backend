const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const result = await pool.query('SELECT * FROM categories WHERE user_id=$1', [req.user.id]);
  res.json(result.rows);
});

router.post('/', auth, async (req, res) => {
  const { name, color } = req.body;
  const result = await pool.query(
    'INSERT INTO categories (user_id, name, color) VALUES ($1,$2,$3) RETURNING *',
    [req.user.id, name, color]
  );
  res.status(201).json(result.rows[0]);
});

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ message: 'Catégorie supprimée' });
});

module.exports = router;