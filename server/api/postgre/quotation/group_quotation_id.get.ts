import { neon } from "@netlify/neon";
import { defineEventHandler, getQuery } from "h3"; // Or directly from 'nitropack/dist/runtime/utils'

export default defineEventHandler(async (event) => {
  const { table } = getQuery(event);
  // console.log('table ', table)
  const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL
  try {
    const query = `SELECT quotation_id, work_order_id
      FROM ${table}
      GROUP BY quotation_id, work_order_id
      ORDER BY quotation_id DESC`;
    const data = await sql(query);
    // console.log('data ', data)

    return { data };
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch ${table}`,
    });
  }
});
