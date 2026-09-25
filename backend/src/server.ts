import express from "express";
import { getAllApplications, getApplicationByID, createApplication, updateApplication, deleteApplication } from "./db/applications";
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.send("Works fine");
});

app.get('/applications', async (req, res) => {
  try {
    const applications = await getAllApplications()
    res.status(200).json(applications)
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.get('/applications/:id', async (req, res) => {
  try {
    const application = await getApplicationByID(Number(req.params.id));
    if (application === undefined)
      res.status(404).json('id not found');
    else
      res.status(200).json(application);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.post('/applications', async (req, res) => {
  try {
    const createdApplication = await createApplication(req.body.company, req.body.role, req.body.status, req.body.dateApplied, req.body.link, req.body.salaryRange)
    res.status(201).json(createdApplication);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.put('/applications/:id', async (req, res) => {
  try {
    const updatedApplication = await updateApplication(Number(req.params.id), req.body.company, req.body.role, req.body.status, req.body.dateApplied, req.body.link, req.body.salaryRange);

    if (updatedApplication === undefined)
      res.status(404).json('id not found');
    else
      res.status(200).json(updatedApplication);
  }
  catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

app.delete('/applications/:id', async (req, res) => {
  try {
    const result = await deleteApplication(Number(req.params.id));
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

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
