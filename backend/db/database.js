const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'elderly.db');
let dbInstance = null;

const createDbInstance = () => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            // This is a critical error. The application cannot run without the database.
            // We log it and exit the process, which will be caught by Electron's 'close' handler.
            console.error('!!! FATAL DATABASE CONNECTION ERROR !!!');
            console.error('Could not connect to database at:', dbPath);
            console.error('Error Message:', err.message);
            console.error('The backend process will now exit.');
            process.exit(1); // Exit with a failure code
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS elderly (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        dateOfBirth TEXT,
        gender TEXT,
        address TEXT,
        hometown TEXT,
        phone TEXT,
        joinDate TEXT,
        cardNumber TEXT,
        cardIssueDate TEXT,
        photoUrl TEXT,
        status TEXT DEFAULT 'alive' CHECK(status IN ('alive', 'deceased')),
        deathDate TEXT
    )`);

    return db;
};

const getInstance = () => {
    if (!dbInstance) {
        console.log('Creating new database instance.');
        dbInstance = createDbInstance();
    }
    return dbInstance;
};

const close = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            console.log('Closing the database connection.');
            dbInstance.close((err) => {
                if (err) {
                    console.error('Error closing the database:', err.message);
                    return reject(err);
                }
                console.log('Database connection closed successfully.');
                dbInstance = null;
                resolve();
            });
        } else {
            // If there's no instance, there's nothing to close.
            resolve();
        }
    });
};

module.exports = {
    getInstance,
    close
};