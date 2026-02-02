// ===============================
// TWS BATTERY SERVER (FINAL)
// ===============================

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const ExcelJS = require("exceljs");

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = "logs.json";

app.use(cors());
app.use(express.json());

// ===============================
// LOAD / SAVE LOGS
// ===============================

let logs = [];

if (fs.existsSync(DATA_FILE)) {
  logs = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveLogs() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
}

// ===============================
// ROUTES
// ===============================

// Health check
app.get("/", (req, res) => {
  res.send("TWS Battery Server is alive");
});

// Receive battery log from app
app.post("/battery-log", (req, res) => {
  const entry = {
    timestamp: new Date().toISOString(),
    deviceName: req.body.deviceName || "Unknown",
    deviceAddress: req.body.deviceAddress || "Unknown",
    left: req.body.left ?? null,
    right: req.body.right ?? null,
    case: req.body.case ?? null
  };

  logs.push(entry);
  saveLogs();

  console.log("📥 Log stored:", entry);
  res.json({ status: "stored" });
});

// Get all logs (used by phone + browser)
app.get("/battery-log", (req, res) => {
  res.json(logs);
});

// Debug endpoint
app.get("/debug", (req, res) => {
  res.json({
    message: "Debug OK",
    totalLogs: logs.length,
    logs: logs
  });
});

// ===============================
// DOWNLOAD AS JSON
// ===============================
app.get("/download/json", (req, res) => {
  res.download(DATA_FILE);
});

// ===============================
// DOWNLOAD AS EXCEL (.xlsx)
// ===============================
app.get("/download/excel", async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Battery Logs");

  sheet.columns = [
    { header: "Time", key: "time", width: 30 },
    { header: "Device Name", key: "name", width: 25 },
    { header: "Device Address", key: "addr", width: 25 },
    { header: "Left (%)", key: "left", width: 15 },
    { header: "Right (%)", key: "right", width: 15 },
    { header: "Case (%)", key: "case", width: 15 }
  ];

  logs.forEach(log => {
    sheet.addRow({
      time: log.timestamp,
      name: log.deviceName,
      addr: log.deviceAddress,
      left: log.left ?? "",
      right: log.right ?? "",
      case: log.case ?? ""
    });
  });

  sheet.getRow(1).font = { bold: true };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=tws_battery_logs.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
