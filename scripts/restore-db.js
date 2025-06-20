const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const restoreDatabase = (backupPath) => {
  const dbPath = path.join(__dirname, '../backend/db/elderly.db');
  const backupDir = path.join(__dirname, '../backups');
  
  try {
    // Nếu không chỉ định backup path, tìm backup mới nhất
    if (!backupPath) {
      if (!fs.existsSync(backupDir)) {
        console.log('❌ No backups found');
        return;
      }
      
      const backups = fs.readdirSync(backupDir)
        .filter(dir => dir.startsWith('db-backup-'))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.log('❌ No database backups found');
        return;
      }
      
      backupPath = path.join(backupDir, backups[0]);
      console.log(`📁 Using latest backup: ${backups[0]}`);
    }
    
    const dbBackupFile = path.join(backupPath, 'elderly.db');
    const manifestFile = path.join(backupPath, 'backup-manifest.json');
    
    if (!fs.existsSync(dbBackupFile)) {
      console.log('❌ Database backup file not found');
      return;
    }
    
    // Tạo backup của database hiện tại
    if (fs.existsSync(dbPath)) {
      const currentBackupPath = path.join(__dirname, '../backend/db/elderly-pre-restore.db');
      fs.copyFileSync(dbPath, currentBackupPath);
      console.log('✅ Created backup of current database');
    }
    
    // Restore database
    fs.copyFileSync(dbBackupFile, dbPath);
    console.log('✅ Database restored successfully');
    
    // Verify restore
    const db = new sqlite3.Database(dbPath);
    db.get("SELECT COUNT(*) as count FROM elderly", [], (err, row) => {
      if (err) {
        console.error('❌ Error verifying restore:', err);
      } else {
        console.log(`✅ Restore verified: ${row.count} records found`);
      }
      db.close();
    });
    
    // Hiển thị thông tin manifest nếu có
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      console.log(`📋 Backup info: ${manifest.backupDate}`);
    }
    
  } catch (error) {
    console.error('❌ Error restoring database:', error);
  }
};

// Sử dụng: node scripts/restore-db.js [backup-path]
const backupPath = process.argv[2];
restoreDatabase(backupPath); 