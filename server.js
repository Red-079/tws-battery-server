const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory logs (Render restarts = clears logs)
let logs = [];

/**
 * Expected JSON from app:
 * {
 *   deviceName: string,
 *   deviceAddress: string,
 *   battery: number | null,
 *   status: "ON" | "OFF"
 * }
 */

// POST log
app.post("/battery-log", (req, res) => {
  const { deviceName, deviceAddress, battery, status } = req.body;

  if (!deviceAddress || !status) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const entry = {
    deviceName: deviceName || "Unknown",
    deviceAddress,
    battery: typeof battery === "number" ? battery : null,
    status,
    timestamp: new Date().toISOString()
  };

  // newest first
  logs.unshift(entry);

  res.json({ success: true });
});

// GET logs
app.get("/battery-log", (req, res) => {
  res.json(logs);
});

// Health check
app.get("/", (req, res) => {
  res.send("TWS Battery Server running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
