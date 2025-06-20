const fs = require('fs');
const path = require('path');

const backupImages = () => {
  const uploadsPath = path.join(__dirname, '../backend/uploads');
  const backupDir = path.join(__dirname, '../backups');
  
  // Tạo thư mục backup nếu chưa tồn tại
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `images-backup-${timestamp}`);
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      console.log('❌ Uploads directory not found');
      return;
    }
    
    const files = fs.readdirSync(uploadsPath);
    let copiedCount = 0;
    let totalSize = 0;
    
    files.forEach(file => {
      const sourceFile = path.join(uploadsPath, file);
      const destFile = path.join(backupPath, file);
      
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, destFile);
        copiedCount++;
        totalSize += fs.statSync(sourceFile).size;
      }
    });
    
    console.log(`✅ Backed up ${copiedCount} images`);
    console.log(`📊 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Tạo file manifest
    const manifest = {
      backupType: 'images',
      backupDate: new Date().toISOString(),
      originalPath: uploadsPath,
      backupLocation: backupPath,
      totalImages: copiedCount,
      totalSize: totalSize,
      images: files
    };
    
    const manifestFile = path.join(backupPath, 'backup-manifest.json');
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Images backup completed at: ${backupPath}`);
    
  } catch (error) {
    console.error('❌ Error creating images backup:', error);
  }
};

backupImages(); 