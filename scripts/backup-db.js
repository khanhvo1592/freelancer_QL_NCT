const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const backupDatabase = () => {
  const dbPath = path.join(__dirname, '../backend/db/elderly.db');
  const backupDir = path.join(__dirname, '../backups');
  
  // Tạo thư mục backup nếu chưa tồn tại
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `db-backup-${timestamp}`);
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  try {
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file not found');
      return;
    }
    
    // Copy database file
    const dbBackupFile = path.join(backupPath, 'elderly.db');
    fs.copyFileSync(dbPath, dbBackupFile);
    console.log('✅ Database file backed up');
    
    // Export data as JSON
    const db = new sqlite3.Database(dbPath);
    const jsonFile = path.join(backupPath, 'elderly-data.json');
    
    db.all("SELECT * FROM elderly", [], (err, rows) => {
      if (err) {
        console.error('❌ Error reading database:', err);
      } else {
        const data = {
          backupDate: new Date().toISOString(),
          totalRecords: rows.length,
          data: rows
        };
        fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
        console.log(`✅ Database data exported as JSON (${rows.length} records)`);
      }
      db.close();
    });
    
    // Tạo file manifest
    const manifest = {
      backupType: 'database',
      backupDate: new Date().toISOString(),
      originalFile: dbPath,
      backupLocation: backupPath,
      files: ['elderly.db', 'elderly-data.json']
    };
    
    const manifestFile = path.join(backupPath, 'backup-manifest.json');
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Database backup completed at: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Error creating database backup:', error);
  }
};

backupDatabase(); 