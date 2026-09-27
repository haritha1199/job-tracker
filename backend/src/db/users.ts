import pool from "./pool";

export async function createUser(
  email:string,
  passwordHash: string
) {
  const result = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *', [email, passwordHash]);
  return result.rows[0];
}

export async function findUserByEmail(email : string) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}