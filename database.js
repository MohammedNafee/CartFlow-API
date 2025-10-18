// database.js
const dotenv = require('dotenv');

// Load environment variables from .env.test if in test mode, otherwise from .env
const env = process.env.NODE_ENV || process.argv.includes('--env test') ? 'test' : 'development';

// Load the appropriate .env file based on the environment
if (env === 'test') {
  dotenv.config({ path: '.env.test' });
  console.log('Using test database configuration');
} else {
  dotenv.config(); // Default to .env
  console.log('Using development database configuration');
}

module.exports = {
  development: {
    driver: 'pg',
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },
  test: {
    driver: 'pg',
    host: process.env.TEST_POSTGRES_HOST,
    database: process.env.TEST_POSTGRES_DB,
    user: process.env.TEST_POSTGRES_USER,
    password: process.env.TEST_POSTGRES_PASSWORD,
  }
};