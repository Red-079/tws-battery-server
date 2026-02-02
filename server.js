const express = require("express");
const app = express();

app.use(express.json());

let logs = [];

app.post("/battery-log", (req, res) => {
  logs.unshift({
    ...req.body,
    timestamp: new Date().toISOString()
  });
  res.send({ success: true });
});

app.get("/battery-log", (req, res) => {
  res.json(logs);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on", PORT));
