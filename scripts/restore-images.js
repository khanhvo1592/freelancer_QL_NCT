const fs = require('fs');
const path = require('path');

const restoreImages = (backupPath) => {
  const uploadsPath = path.join(__dirname, '../backend/uploads');
  const backupDir = path.join(__dirname, '../backups');
  
  try {
    // Nếu không chỉ định backup path, tìm backup mới nhất
    if (!backupPath) {
      if (!fs.existsSync(backupDir)) {
        console.log('❌ No backups found');
        return;
      }
      
      const backups = fs.readdirSync(backupDir)
        .filter(dir => dir.startsWith('images-backup-'))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        console.log('❌ No images backups found');
        return;
      }
      
      backupPath = path.join(backupDir, backups[0]);
      console.log(`📁 Using latest backup: ${backups[0]}`);
    }
    
    const manifestFile = path.join(backupPath, 'backup-manifest.json');
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Backup directory not found');
      return;
    }
    
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
    const files = fs.readdirSync(backupPath);
    let restoredCount = 0;
    let totalSize = 0;
    
    files.forEach(file => {
      if (file !== 'backup-manifest.json') { // Bỏ qua file manifest
        const sourceFile = path.join(backupPath, file);
        const destFile = path.join(uploadsPath, file);
        
        if (fs.statSync(sourceFile).isFile()) {
          fs.copyFileSync(sourceFile, destFile);
          restoredCount++;
          totalSize += fs.statSync(sourceFile).size;
        }
      }
    });
    
    console.log(`✅ Restored ${restoredCount} images`);
    console.log(`📊 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Hiển thị thông tin manifest nếu có
    if (fs.existsSync(manifestFile)) {
      const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      console.log(`📋 Backup info: ${manifest.backupDate}`);
    }
    
  } catch (error) {
    console.error('❌ Error restoring images:', error);
  }
};

// Sử dụng: node scripts/restore-images.js [backup-path]
const backupPath = process.argv[2];
restoreImages(backupPath); 