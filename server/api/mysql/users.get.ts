import { defineEventHandler } from 'h3'; // Or directly from 'nitropack/dist/runtime/utils'

export default defineEventHandler(async (event) => {
  const mysql = event.context.$db; // Access the pooled connection
  console.log('mysql ', mysql)

  try {
    const [rows] = await mysql.query('SELECT * FROM work_orders');
    return { users: rows };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users',
    });
  }
});