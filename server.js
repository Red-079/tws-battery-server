const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let logs = [];

/* Root check */
app.get("/", (req, res) => {
    res.send("SERVER IS ALIVE");
});

/* Receive data from app */
app.post("/battery-log", (req, res) => {
    const entry = {
        deviceName: req.body.deviceName,
        deviceAddress: req.body.deviceAddress,
        battery: req.body.battery,
        status: req.body.status,
        timestamp: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata"
        })
    };

    logs.push(entry);
    console.log("LOG RECEIVED:", entry);

    res.json({ success: true });
});

/* Return logs */
app.get("/logs", (req, res) => {
    res.json(logs);
});

/* Simple table view */
app.get("/logs-table", (req, res) => {
    const rows = logs.map(l => `
        <tr>
            <td>${l.timestamp}</td>
            <td>${l.deviceName}</td>
            <td>${l.deviceAddress}</td>
            <td>${l.battery}</td>
            <td>${l.status}</td>
        </tr>
    `).join("");

    res.send(`
        <html>
        <body>
            <h2>TWS Logs</h2>
            <table border="1">
                <tr>
                    <th>Time</th>
                    <th>Device</th>
                    <th>Address</th>
                    <th>Battery</th>
                    <th>Status</th>
                </tr>
                ${rows}
            </table>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
