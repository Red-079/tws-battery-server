// ===== TWS BATTERY SERVER (FINAL STABLE) =====
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let batteryLogs = [];

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("Server is alive");
});

// DEBUG ROUTE
app.get("/debug", (req, res) => {
  res.json({
    message: "Debug OK",
    logCount: batteryLogs.length,
    logs: batteryLogs
  });
});

// POST BATTERY DATA
app.post("/battery-log", (req, res) => {
  const data = req.body;

  const logEntry = {
    deviceName: data.deviceName || "Unknown",
    deviceAddress: data.deviceAddress || "Unknown",
    left: data.left ?? null,
    right: data.right ?? null,
    case: data.case ?? null,
    timestamp: Date.now(),
    receivedAt: new Date().toISOString()
  };

  batteryLogs.push(logEntry);

  console.log("📥 Battery log received:", logEntry);
  res.json({ status: "ok" });
});

// GET BATTERY LOGS
app.get("/battery-log", (req, res) => {
  res.json(batteryLogs);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
