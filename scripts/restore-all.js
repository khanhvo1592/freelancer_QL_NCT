const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const restoreAll = (backupPath) => {
  const backupDir = path.join(__dirname, '../backups');
  
  try {
    // Nếu không chỉ định backup path, tìm backup mới nhất
    if (!backupPath) {
      if (!fs.existsSync(backupDir)) {
        console.log('❌ No backups found');
        return;
      }
      
      const backups = fs.readdirSync(backupDir)
        .filter(dir => dir.startsWith('full-backup-'))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.log('❌ No full backups found');
        return;
      }
      
      backupPath = path.join(backupDir, backups[0]);
      console.log(`📁 Using latest full backup: ${backups[0]}`);
    }
    
    const manifestFile = path.join(backupPath, 'backup-manifest.json');
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Backup directory not found');
      return;
    }
    
    console.log(`🔄 Starting full restore from: ${backupPath}`);
    
    // Restore database
    const dbPath = path.join(__dirname, '../backend/db/elderly.db');
    const dbBackupFile = path.join(backupPath, 'database/elderly.db');
    
    if (fs.existsSync(dbBackupFile)) {
      // Tạo backup của database hiện tại
      if (fs.existsSync(dbPath)) {
        const currentBackupPath = path.join(__dirname, '../backend/db/elderly-pre-restore.db');
        fs.copyFileSync(dbPath, currentBackupPath);
        console.log('✅ Created backup of current database');
      }
      
      // Restore database
      fs.copyFileSync(dbBackupFile, dbPath);
      console.log('✅ Database restored');
      
      // Verify database
      const db = new sqlite3.Database(dbPath);
      db.get("SELECT COUNT(*) as count FROM elderly", [], (err, row) => {
        if (err) {
          console.error('❌ Error verifying database:', err);
        } else {
          console.log(`✅ Database verified: ${row.count} records`);
        }
        db.close();
      });
    } else {
      console.log('⚠️  Database backup not found');
    }
    
    // Restore images
    const uploadsPath = path.join(__dirname, '../backend/uploads');
    const imagesBackupPath = path.join(backupPath, 'images');
    
    if (fs.existsSync(imagesBackupPath)) {
      // Tạo backup của images hiện tại
      if (fs.existsSync(uploadsPath) && fs.readdirSync(uploadsPath).length > 0) {
        const currentBackupPath = path.join(__dirname, '../backend/uploads-pre-restore');
        if (!fs.existsSync(currentBackupPath)) {
          fs.mkdirSync(currentBackupPath, { recursive: true });
        }
        
        const currentFiles = fs.readdirSync(uploadsPath);
        currentFiles.forEach(file => {
          const sourceFile = path.join(uploadsPath, file);
          const backupFile = path.join(currentBackupPath, file);
          fs.copyFileSync(sourceFile, backupFile);
        });
        console.log('✅ Created backup of current images');
      }
      
      // Tạo thư mục uploads nếu chưa tồn tại
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }
      
      // Restore images
      const files = fs.readdirSync(imagesBackupPath);
      let restoredCount = 0;
      let totalSize = 0;
      
      files.forEach(file => {
        const sourceFile = path.join(imagesBackupPath, file);
        const destFile = path.join(uploadsPath, file);
        
        if (fs.statSync(sourceFile).isFile()) {
          fs.copyFileSync(sourceFile, destFile);
          restoredCount++;
          totalSize += fs.statSync(sourceFile).size;
        }
      });
      
      console.log(`✅ ${restoredCount} images restored (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log('⚠️  Images backup not found');
    }
    
    // Hiển thị thông tin manifest
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      console.log(`📋 Backup info: ${manifest.backupDate}`);
    }
    
    console.log('✅ Full restore completed successfully');
    
  } catch (error) {
    console.error('❌ Error during full restore:', error);
  }
};

// Sử dụng: node scripts/restore-all.js [backup-path]
const backupPath = process.argv[2];
restoreAll(backupPath); 