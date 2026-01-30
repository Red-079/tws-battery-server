const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ======================
// IN-MEMORY STORAGE
// ======================
const userLogs = {};

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.json({ status: "SERVER_ALIVE" });
});

// ======================
// RECEIVE LOG FROM APP
// ======================
app.post("/battery-log", (req, res) => {
  const {
    userId,
    deviceName,
    deviceAddress,
    battery,
    status
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const entry = {
    deviceName,
    deviceAddress,
    battery,
    status,
    timestamp: new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    })
  };

  if (!userLogs[userId]) {
    userLogs[userId] = [];
  }

  userLogs[userId].push(entry);

  res.json({ success: true });
});

// ======================
// USER LOGS (PRIVATE)
// ======================
app.get("/logs/my", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  res.json(userLogs[userId] || []);
});

// ======================
// ADMIN LOGS (ALL USERS)
// ======================
const ADMIN_KEY = "dev-secret-123";

app.get("/admin/logs", (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  res.json(userLogs);
});

// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
