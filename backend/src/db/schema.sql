CREATE TABLE applications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT CHECK (status IN ('applied', 'interviewing', 'rejected', 'offer')) NOT NULL,
  date_applied DATE,
  link TEXT,
  salary_range TEXT,
  created_at TIMESTAMP DEFAULT now()
)