const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

let config;
try {
    config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
} catch (error) {
    console.error('Error loading config.json:', error);
    process.exit(1);
}

const app = express();
const port = config.port;

const db = new sqlite3.Database('pixels.db', (err) => {
    if (err) {
        console.error('Error opening the database:', err.message);
    } else {
        db.run('CREATE TABLE IF NOT EXISTS pixels (coordinate TEXT PRIMARY KEY, color TEXT)', (err) => {
            if (err) console.error('Error creating the table:', err.message);
        });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/pixels', (req, res) => {
    db.all('SELECT coordinate, color FROM pixels', [], (err, rows) => {
        if (err) {
            console.error('Error fetching pixels:', err.message);
            res.status(500).send('Database error');
            return;
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://${config.ip}:${port}`);
});

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('A client connected');

    db.all('SELECT coordinate, color FROM pixels', [], (err, rows) => {
        if (err) {
            console.error('Error fetching pixels:', err.message);
            return;
        }
        ws.send(JSON.stringify(rows));
    });

    ws.on('message', (message) => {
        try {
            const { x, y, color } = JSON.parse(message);
            const coordinate = `${x};${y}`;

            db.run('INSERT OR REPLACE INTO pixels (coordinate, color) VALUES (?, ?)', [coordinate, color], (err) => {
                if (err) {
                    console.error('Error saving the pixel:', err.message);
                } else {
                    console.log(`Pixel placed at (${x}, ${y}) with color "${color}"`);
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify([{ coordinate, color }]));
                        }
                    });
                }
            });
        } catch (err) {
            console.error('Error processing message:', err.message);
        }
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});
