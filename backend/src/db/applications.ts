import pool from "./pool";

export async function getAllApplications(userId: number) {
  const result = await pool.query('SELECT * FROM applications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}

export async function getApplicationByID(userId: number, id: number) {
  const result = await pool.query('SELECT * FROM applications WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rows[0];
}

export async function createApplication(
  userId: number,
  company: string,
  role: string,
  status: string,
  dateApplied: string,
  link: string,
  salaryRange: string
) {
  const result = await pool.query('INSERT INTO applications (user_id, company, role, status, date_applied, link, salary_range) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [userId, company, role, status, dateApplied, link, salaryRange]);
  return result.rows[0];
}

export async function updateApplication(
  userId: number,
  id: number,
  company: string,
  role: string,
  status: string,
  dateApplied: string,
  link: string,
  salaryRange: string
) {
  const result = await pool.query('UPDATE applications SET company = $1, role =$2, status=$3, date_applied = $4, link = $5, salary_range = $6 WHERE id = $7 AND user_id = $8 RETURNING *', [company, role, status, dateApplied, link, salaryRange, id, userId]);
  return result.rows[0];
}

export async function deleteApplication (userId: number, id: number) {
  const result = await pool.query('DELETE FROM applications WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount;
}

export async function updateResumePath(userId: number, id:number, resumePath: string) {
  const result = await pool.query('UPDATE applications SET resume_path =$1 WHERE id = $2 AND user_id = $3 RETURNING *', [resumePath, id, userId]);
  return result.rows[0];
}