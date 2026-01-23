// 🔥 DEBUG: force add + return count
app.get("/__debug__", (req, res) => {
    logs.push({
        deviceName: "DEBUG_DEVICE",
        deviceAddress: "AA:BB:CC",
        battery: 99,
        status: "DEBUG",
        timestamp: new Date().toISOString()
    });

    res.json({
        message: "DEBUG route executed",
        logCount: logs.length,
        logs
    });
});
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* =========================
   In-memory storage
========================= */
let logs = [];
let lastState = null;

/* =========================
   POST: battery log (used by Android app)
========================= */
app.post("/battery-log", (req, res) => {
    const { deviceName, deviceAddress, battery, status } = req.body;

    if (!deviceName || !deviceAddress || battery === undefined || !status) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const currentState = { deviceName, deviceAddress, battery, status };

    // Log ONLY when something changes
    if (
        !lastState ||
        lastState.deviceAddress !== deviceAddress ||
        lastState.battery !== battery ||
        lastState.status !== status
    ) {
        const entry = {
            deviceName,
            deviceAddress,
            battery,
            status,
            timestamp: new Date().toISOString()
        };

        logs.push(entry);
        lastState = currentState;

        console.log("EVENT LOGGED:", entry);
    }

    res.json({ success: true });
});

/* =========================
   TEMP GET TEST ROUTE (browser-friendly)
   🔴 REMOVE AFTER TESTING
========================= */
app.get("/test-log", (req, res) => {
    const entry = {
        deviceName: "TEST_DEVICE",
        deviceAddress: "00:11:22:33",
        battery: 80,
        status: "ON",
        timestamp: new Date().toISOString()
    };

    logs.push(entry);
    lastState = entry;

    res.json({
        success: true,
        added: entry
    });
});

/* =========================
   GET: JSON logs (Android app)
========================= */
app.get("/logs", (req, res) => {
    res.json(logs);
});

/* =========================
   GET: Browser table view
========================= */
app.get("/logs-table", (req, res) => {

    const rows = logs.map(log => {
        const d = new Date(log.timestamp);
        return `
            <tr>
                <td>${d.toLocaleDateString()}</td>
                <td>${d.toLocaleTimeString()}</td>
                <td>${log.deviceName}</td>
                <td>${log.deviceAddress}</td>
                <td>${log.battery}%</td>
                <td>${log.status}</td>
            </tr>
        `;
    }).join("");

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TWS Battery Logs</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #333; padding: 8px; text-align: center; }
                th { background: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>TWS Battery Logs</h2>
            <table>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Device Name</th>
                    <th>Device Address</th>
                    <th>Battery</th>
                    <th>Status</th>
                </tr>
                ${rows}
            </table>
        </body>
        </html>
    `);
});

/* =========================
   Root check
========================= */
app.get("/", (req, res) => {
    res.send("TWS Battery Cloud Server is running");
});

/* =========================
   Start server (cloud-ready)
========================= */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
