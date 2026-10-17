export type Application = {
  id: string,
  user_id: string,
  company: string,
  role: string,
  date_applied:  string|null, 
  created_at:  string,
  resume_path: string|null,
  status: 'applied'|'interviewing'|'rejected'|'offer',
  link: string|null,
  salary_range: string|null
}