import express from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { getAllApplications, getApplicationByID, createApplication, updateApplication, deleteApplication, updateResumePath } from "./db/applications";
import { requireAuth } from "./middleware/auth";
import { createUser, findUserByEmail } from "./db/users";
import { upload } from "./middleware/upload";
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json("Works fine");
});

app.get('/applications', requireAuth, async (req, res) => {
  try {
    const applications = await getAllApplications(req.user!.id)
    res.status(200).json(applications)
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get('/applications/:id', requireAuth, async (req, res) => {
  try {
    const application = await getApplicationByID(req.user!.id, Number(req.params.id));
    if (application === undefined)
      res.status(404).json('id not found');
    else
      res.status(200).json(application);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/applications', requireAuth, async (req, res) => {
  try {
    const createdApplication = await createApplication(req.user!.id, req.body.company, req.body.role, req.body.status, req.body.dateApplied, req.body.link, req.body.salaryRange)
    res.status(201).json(createdApplication);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.put('/applications/:id', requireAuth, async (req, res) => {
  try {
    const updatedApplication = await updateApplication(req.user!.id, Number(req.params.id), req.body.company, req.body.role, req.body.status, req.body.dateApplied, req.body.link, req.body.salaryRange);

    if (updatedApplication === undefined)
      res.status(404).json('id not found');
    else
      res.status(200).json(updatedApplication);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/applications/:id/resume', requireAuth, upload.single('resume'), async(req, res) =>{
  try {
    if (!req.file)
      return res.status(400).json('resume path not found');
    const updatedApplication = await updateResumePath(req.user!.id, Number(req.params.id), req.file.path);
  
  if (updatedApplication === undefined)
      res.status(404).json('id not found');
  else
      res.status(200).json(updatedApplication);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.delete('/applications/:id', requireAuth, async (req, res) => {
  try {
    const result = await deleteApplication(req.user!.id, Number(req.params.id));
    if (result === 1) {
      res.status(200).send('deleted successfully');
    } else if (result === 0) {
      res.status(404).send('application not found');
    } else {
      res.status(400).send('delete failed');
    }
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const {email, password} = req.body;
    const hash = await bcrypt.hash(password, 10);
    const createdUser = await createUser(email, hash);
    const {password_hash, ...safeUser} = createdUser;
    res.status(201).json(safeUser);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await findUserByEmail(email);

    if(user === undefined)
      res.status(401).json('invalid credentials');
    else {
      if(! await bcrypt.compare(password, user.password_hash)) {
        res.status(401).json('invalid credentials');
      }
      else {
        const token = jwt.sign(
          {id: user.id, email: user.email},
          process.env.JWT_SECRET!,
          {expiresIn: '1h'}
        );
        res.status(200).json({token});
      }
    }
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
})

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
