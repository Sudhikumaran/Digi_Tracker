const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./utils/helpers');

const app = express();

const corsOptions = {
  origin(origin, callback) {
    // Allow Flutter web / Vite dev servers on any localhost port in development
    if (config.env === 'development') {
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    const allowed = config.cors.origin;
    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/reports', express.static(path.join(__dirname, '../reports')));

app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
