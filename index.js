const express = require('express');
const { API_PORT } = require('./config');
const router = require('./router');

const app = express();

app.use(express.json())

app.use('/', router);

app.listen(API_PORT, () => {
  console.log('Server started');
});
