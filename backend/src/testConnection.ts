import 'dotenv/config';
import {Pool} from 'pg';

const pool = new Pool({connectionString: process.env.DATABASE_URL});

async function test () {
  const result = await pool.query('SELECT NOW()');const resp = result.rows[0];
  console.log(resp);
  pool.end();
}
test();