const express = require("express");
const cors = require("cors");

const app = express();

/* ==============================
   CONFIG
================================ */
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ==============================
   IN-MEMORY STORAGE
================================ */
let logs = [];
let lastState = null;

/* ==============================
   POST: CHANGE-BASED LOGGING
   (Called by Android app)
================================ */
app.post("/battery-log", (req, res) => {
    const { deviceName, deviceAddress, battery, status } = req.body;

    if (!deviceName || !deviceAddress || battery === undefined || !status) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    const currentState = {
        deviceName,
        deviceAddress,
        battery,
        status
    };

    // Log ONLY if something changed
    if (
        !lastState ||
        lastState.deviceAddress !== deviceAddress ||
        lastState.battery !== battery ||
        lastState.status !== status
    ) {
        const logEntry = {
            deviceName,
            deviceAddress,
            battery,
            status,
            timestamp: new Date().toISOString()
        };

        logs.push(logEntry);
        lastState = currentState;

        console.log("EVENT LOGGED:", logEntry);
    }

    res.json({ success: true });
});

/* ==============================
   GET: JSON LOGS (Android app)
================================ */
app.get("/logs", (req, res) => {
    res.json(logs);
});

/* ==============================
   GET: BROWSER TABLE VIEW
================================ */
app.get("/logs-table", (req, res) => {

    const rows = logs.map(log => {
        const date = new Date(log.timestamp);

        return `
            <tr>
                <td>${date.toLocaleDateString()}</td>
                <td>${date.toLocaleTimeString()}</td>
                <td>${log.deviceName}</td>
                <td>${log.deviceAddress}</td>
                <td>${log.battery}%</td>
                <td>${log.status}</td>
            </tr>
        `;
    }).join("");

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>TWS Battery Logs</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 8px;
                    text-align: center;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                    background-color: #fafafa;
                }
            </style>
        </head>
        <body>
            <h2>TWS Battery Event Logs</h2>
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
    `;

    res.send(html);
});

/* ==============================
   ROOT HEALTH CHECK
================================ */
app.get("/", (req, res) => {
    res.send("TWS Battery Cloud Server is running");
});

/* ==============================
   START SERVER (CLOUD)
================================ */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
