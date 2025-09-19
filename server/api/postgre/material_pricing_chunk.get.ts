import { neon } from '@netlify/neon'
import { defineEventHandler, getQuery, createError } from 'h3'

const sql = neon()

export default defineEventHandler(async (event) => {
  const { table, isDesc, page, limit, search } = getQuery(event)

  const _page = parseInt((page as string) || '1')
  const _limit = parseInt((limit as string) || '100')
  const offset = (_page - 1) * _limit

  const searchTerm = (search as string)?.trim()
  const params: any[] = []

  // --- Build WHERE clause + params
  let whereClause = ''
  if (searchTerm) {
    params.push(`%${searchTerm}%`) // $1
    whereClause = `WHERE name ILIKE $1::text OR description ILIKE $1::text`
  }

  try {
    // --- Paginated rows
    let rowsQuery = `
      SELECT id, name, cost, description
      FROM materials
      ${whereClause}
      ORDER BY id ${isDesc ? 'DESC' : 'ASC'}
      LIMIT ${searchTerm ? '$2' : '$1'} OFFSET ${searchTerm ? '$3' : '$2'}
    `
    const rowsParams = searchTerm
      ? [...params, _limit, offset]
      : [_limit, offset]

    const rows = await sql(rowsQuery, rowsParams)

    // --- Total count
    let countQuery = `
      SELECT COUNT(*) AS count
      FROM materials
      ${whereClause}
    `
    const [{ count }] = await sql(countQuery, params)

    return { data: rows, total: Number(count) }
  } catch (error) {
    console.error(`Error fetching ${table}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch ${table}`,
    })
  }
})
