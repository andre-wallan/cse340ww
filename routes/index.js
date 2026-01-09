/*const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'CSE Motors' });
});
router.get('/', (req, res) => {
  res.send('CSE Motors is rendering');
});

module.exports = router; */
app.get('/', (req, res) => {
  res.send('CSE Motors is running!');
});
