const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* =========================
   IN-MEMORY STORAGE
========================= */
let logs = [];

/* =========================
   ROOT ROUTE (VERY IMPORTANT)
========================= */

/* =========================
   TEST ROUTE (BROWSER-FRIENDLY)
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

    res.json({
        message: "TEST LOG ADDED",
        totalLogs: logs.length,
        entry
    });
});

/* =========================
   POST FROM ANDROID APP
========================= */
app.post("/battery-log", (req, res) => {
    const { deviceName, deviceAddress, battery, status } = req.body;

    if (!deviceName || !deviceAddress || battery === undefined || !status) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const entry = {
        deviceName,
        deviceAddress,
        battery,
        status,
        timestamp: new Date().toISOString()
    };

    logs.push(entry);
    console.log("LOG RECEIVED:", entry);

    res.json({ success: true });
});

/* =========================
   GET LOGS (JSON)
========================= */
app.get("/logs", (req, res) => {
    res.json(logs);
});

/* =========================
   GET LOGS (TABLE VIEW)
========================= */
app.get("/logs-table", (req, res) => {
    const rows = logs.map(l => {
        const d = new Date(l.timestamp);
        return `
            <tr>
                <td>${d.toLocaleDateString()}</td>
                <td>${d.toLocaleTimeString()}</td>
                <td>${l.deviceName}</td>
                <td>${l.deviceAddress}</td>
                <td>${l.battery}%</td>
                <td>${l.status}</td>
            </tr>
        `;
    }).join("");

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TWS Logs</title>
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
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
