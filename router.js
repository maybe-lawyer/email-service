const router = require('express').Router();

router.post('/email', (req, res) => {
  res.status(200);
  res.send({ message: 'POST request received' });
});

router.use((_req, res) => {
  res.status(404);
  res.send();
});

module.exports = router;
