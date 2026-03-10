const express = require('express');
const path = require('path');
const authRouter = require('./authRouter');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api/auth', authRouter);

  return app;
}

module.exports = { createApp };
