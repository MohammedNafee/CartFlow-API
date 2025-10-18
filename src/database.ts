import dotenv from 'dotenv';
import { Pool } from 'pg';

// Determine the environment and load the appropriate .env file
const env = process.env.NODE_ENV || 'development';

if (env === 'test') {
  dotenv.config({ path: '.env.test' });
  console.log('Using test database configuration');
} else {
  dotenv.config();
  console.log('Using development database configuration');
}

// setup connection parameters from environment variables
const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  TEST_POSTGRES_HOST,
  TEST_POSTGRES_DB,
  TEST_POSTGRES_USER,
  TEST_POSTGRES_PASSWORD
} = process.env;

// Create a new PostgreSQL connection pool
const pool = 
  env === 'test'
    ? new Pool({
        host: TEST_POSTGRES_HOST,
        database: TEST_POSTGRES_DB,
        user: TEST_POSTGRES_USER,
        password: TEST_POSTGRES_PASSWORD,
      })
    : new Pool({
        host: POSTGRES_HOST,
        database: POSTGRES_DB,
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
      });

export default pool;