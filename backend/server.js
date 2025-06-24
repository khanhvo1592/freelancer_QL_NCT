const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const elderlyRoutes = require('./routes/elderly');
const path = require('path');
const fs = require('fs');
const db = require('./db/database');
const backupRoutes = require('./routes/backup');

const app = express();
const PORT = process.env.PORT || 5000;

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/elderly', elderlyRoutes);
app.use('/api/backups', backupRoutes);

// Thêm endpoint health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // Initial database connection
  db.getInstance();
  // Tell the parent process (Electron) that we are ready
  if (process.send) {
      process.send({ type: 'status', message: 'ready' });
  }
});

const runInitialization = async () => {
    const database = db.getInstance();
    
    const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
        database.run(sql, params, (err) => (err ? reject(err) : resolve()));
    });

    try {
        console.log('[Backend] Starting data initialization...');
        
        await dbRun('DELETE FROM elderly;');
        console.log('[Backend] Cleared elderly table.');
        
        await dbRun("DELETE FROM sqlite_sequence WHERE name='elderly';");
        console.log('[Backend] Reset elderly sequence.');

        const uploadsPath = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsPath)) {
            const files = fs.readdirSync(uploadsPath);
            for (const file of files) {
                fs.unlinkSync(path.join(uploadsPath, file));
            }
            console.log('[Backend] Cleared uploads directory.');
        }

        if (process.send) {
            process.send({ type: 'init-complete' });
        }
    } catch (err) {
        console.error('[Backend] Error during data initialization:', err);
        if (process.send) {
            process.send({ type: 'init-failed', error: err.message });
        }
    }
};

const gracefulShutdown = async () => {
    console.log('Received kill signal, shutting down gracefully.');
    server.close(async () => {
        console.log('Closed out remaining connections.');
        try {
            await db.close();
            process.exit(0);
        } catch (err) {
            console.error('Error during database shutdown:', err);
            process.exit(1);
        }
    });

    // Force shutdown after a timeout
    setTimeout(async () => {
        console.error('Could not close connections in time, forcefully shutting down.');
        try {
            await db.close();
        } catch (err) {
            // Ignore error on forceful shutdown, we are exiting anyway
        }
        process.exit(1);
    }, 5000); // 5 seconds
};

// listen for TERM signal .e.g. kill 
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);

// Listen for IPC messages from the parent process (Electron)
process.on('message', (msg) => {
    if (msg === 'shutdown') {
        console.log('[Backend] Received "shutdown" message via IPC. Initiating graceful shutdown.');
        gracefulShutdown();
    }
    if (msg === 'initialize-data') {
        console.log('[Backend] Received "initialize-data" message.');
        runInitialization();
    }
});