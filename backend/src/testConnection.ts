import pool from './db/pool'

async function test () {
  const result = await pool.query('SELECT NOW()');const resp = result.rows[0];
  console.log(resp);
  pool.end();
}
test();