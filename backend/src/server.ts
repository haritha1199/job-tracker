import express = require("express");
const app = express();

app.get('/health', (req, res) => {
  res.send("Works fine");
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});