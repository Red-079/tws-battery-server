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
let clients = [];

/* =========================
   HELPER: BROADCAST EVENTS (SSE)
========================= */
function broadcastUpdate() {
    clients.forEach(res => {
        res.write(`data: update\n\n`);
    });
}

/* =========================
   ROOT (DEPLOYMENT CHECK)
========================= */
app.get("/", (req, res) => {
    res.send("SERVER CODE VERSION: EVENT_DRIVEN_V1");
});

/* =========================
   SERVER-SENT EVENTS (LIVE UPDATES)
========================= */
app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();
    clients.push(res);

    req.on("close", () => {
        clients = clients.filter(c => c !== res);
    });
});

/* =========================
   POST: EVENT FROM ANDROID
========================= */
app.post("/battery-log", (req, res) => {
    const { deviceName, deviceAddress, battery, status } = req.body;

    if (!deviceName || !deviceAddress || status == null) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const timestamp = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
    });

    const entry = {
        deviceName,
        deviceAddress,
        battery: battery >= 0 ? battery : null,
        status,
        timestamp
    };

    logs.push(entry);
    console.log("EVENT LOGGED:", entry);

    broadcastUpdate(); // 🔥 instant update
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
    const rows = logs.map(l => `
        <tr>
            <td>${l.timestamp}</td>
            <td>${l.deviceName}</td>
            <td>${l.deviceAddress}</td>
            <td>${l.battery !== null ? l.battery + "%" : "N/A"}</td>
            <td>${l.status}</td>
        </tr>
    `).join("");

    res.send(`
        <html>
        <head>
            <title>TWS Logs</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #444; padding: 8px; text-align: center; }
                th { background: #eee; }
            </style>
        </head>
        <body>
            <h2>TWS Event Logs (Live)</h2>
            <table>
                <tr>
                    <th>Timestamp</th>
                    <th>Device</th>
                    <th>Address</th>
                    <th>Battery</th>
                    <th>Status</th>
                </tr>
                ${rows}
            </table>

            <script>
                const evt = new EventSource("/events");
                evt.onmessage = () => location.reload();
            </script>
        </body>
        </html>
    `);
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
