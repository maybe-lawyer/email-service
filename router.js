const router = require('express').Router();

const { emailServiceHandler, emailStatusHandler } = require('./emailHandlers');

router.post('/email', emailServiceHandler);
router.get('/email/:id/status', emailStatusHandler)

router.use((_req, res) => {
  res.status(404);
  res.send();
});

module.exports = router;
