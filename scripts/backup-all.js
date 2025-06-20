const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const backupAll = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  const backupPath = path.join(backupDir, `full-backup-${timestamp}`);
  
  // Tạo thư mục backup
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  console.log(`🔄 Starting full backup: ${timestamp}`);
  
  try {
    // Backup database
    const dbPath = path.join(__dirname, '../backend/db/elderly.db');
    const dbBackupPath = path.join(backupPath, 'database');
    
    if (!fs.existsSync(dbBackupPath)) {
      fs.mkdirSync(dbBackupPath, { recursive: true });
    }
    
    if (fs.existsSync(dbPath)) {
      const dbBackupFile = path.join(dbBackupPath, 'elderly.db');
      fs.copyFileSync(dbPath, dbBackupFile);
      console.log('✅ Database backed up');
      
      // Export data as JSON
      const db = new sqlite3.Database(dbPath);
      const jsonFile = path.join(dbBackupPath, 'elderly-data.json');
      
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
          console.log(`✅ Database data exported (${rows.length} records)`);
        }
        db.close();
      });
    } else {
      console.log('⚠️  Database file not found');
    }
    
    // Backup images
    const uploadsPath = path.join(__dirname, '../backend/uploads');
    const imagesBackupPath = path.join(backupPath, 'images');
    
    if (fs.existsSync(uploadsPath)) {
      if (!fs.existsSync(imagesBackupPath)) {
        fs.mkdirSync(imagesBackupPath, { recursive: true });
      }
      
      const files = fs.readdirSync(uploadsPath);
      let copiedCount = 0;
      let totalSize = 0;
      
      files.forEach(file => {
        const sourceFile = path.join(uploadsPath, file);
        const destFile = path.join(imagesBackupPath, file);
        
        if (fs.statSync(sourceFile).isFile()) {
          fs.copyFileSync(sourceFile, destFile);
          copiedCount++;
          totalSize += fs.statSync(sourceFile).size;
        }
      });
      
      console.log(`✅ ${copiedCount} images backed up (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log('⚠️  Uploads directory not found');
    }
    
    // Tạo file manifest tổng hợp
    const manifest = {
      backupType: 'full',
      backupDate: new Date().toISOString(),
      database: {
        exists: fs.existsSync(dbPath),
        records: fs.existsSync(dbPath) ? 'See elderly-data.json' : 0
      },
      images: {
        exists: fs.existsSync(uploadsPath),
        count: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath).length : 0
      },
      backupLocation: backupPath,
      files: [
        'database/elderly.db',
        'database/elderly-data.json',
        'images/*'
      ]
    };
    
    const manifestPath = path.join(backupPath, 'backup-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Full backup completed at: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Error creating full backup:', error);
  }
};

backupAll(); 