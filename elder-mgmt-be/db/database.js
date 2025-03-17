const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'elderly.db'), (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Tạo bảng nếu chưa tồn tại
db.serialize(() => {

  
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
});

module.exports = db;