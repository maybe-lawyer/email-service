const router = require('express').Router();

const { emailServiceHandler } = require('./emailHandlers');

router.post('/email', emailServiceHandler);

router.use((_req, res) => {
  res.status(404);
  res.send();
});

module.exports = router;
