// server/utils/mysql.ts (or server/plugins/mysql.ts for a plugin)
import mysql from 'mysql2/promise'; // Import the promise-based version
import { defineNitroPlugin } from 'nitropack/runtime/plugin';

let pool: mysql.Pool;

export default defineNitroPlugin((nitroApp) => {
  try {
    pool = mysql.createPool({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'hawkins_db',
      waitForConnections: true,
      connectionLimit: 10, // Adjust as needed
      queueLimit: 0
    });

    nitroApp.hooks.hook('request', (event) => {
      // Make the pool available on the event context
      (event.context as any).$db = pool;
    });

    // Optional: Log when the pool is created (for debugging)
    console.log('MySQL connection pool created successfully.');

  } catch (error) {
    console.error('Error creating MySQL pool:', error);
    throw new Error('Failed to initialize MySQL connection pool');
  }
});