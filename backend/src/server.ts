import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { getAllApplications, getApplicationByID, createApplication, updateApplication, deleteApplication, updateResumePath, getFollowUps } from "./db/applications";
import { requireAuth } from "./middleware/auth";
import { createUser, findUserByEmail } from "./db/users";
import { upload } from "./middleware/upload";
import { autoCheck } from "./jobs/followUps";
const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean) as string[],
}));
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

app.get('/applications/follow-ups', requireAuth, async(req, res) => {
  try {
    const result = await getFollowUps(req.user!.id);
    res.status(200).json(result);
  }
  catch(err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
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

app.get('/applications/:id/resume', requireAuth, async(req, res) => {
  try {
    const application = await getApplicationByID(req.user!.id, Number(req.params.id));

    if(application === undefined)
      return res.status(404).json('application not found');
    if(application.resume_path === null)
      return res.status(404).json('resume not uploaded');
    return res.download(application.resume_path);
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
    if(!email || !password)
      return res.status(400).json({error : 'Email and password required'})
    const hash = await bcrypt.hash(password, 10);
    const createdUser = await createUser(email, hash);
    const {password_hash, ...safeUser} = createdUser;
    res.status(201).json(safeUser);
  }
  catch (err) {
    if( typeof err === 'object' && err!== null && 'code' in err && err.code === '23505')
      return res.status(409).json({error: 'Email already registered'});
    
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
          {expiresIn: '24h'}
        );
        res.status(200).json({token});
      }
    }
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

autoCheck();

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
