import 'dotenv/config';
import { validateEnv } from './src/utils/validateEnv.js';
import app from './src/app.js';
import http from 'http';

// Best Practice: Validate environment before starting
validateEnv();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const start = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`\n Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(` Listening on http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error(' Error starting server:', error.message);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err) => {
  console.error(' Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
