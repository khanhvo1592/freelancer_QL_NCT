const fs = require('fs');
const path = require('path');

const listBackups = () => {
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ No backups directory found');
    return;
  }
  
  const backups = fs.readdirSync(backupDir);
  
  if (backups.length === 0) {
    console.log('❌ No backups found');
    return;
  }
  
  console.log('📋 Available Backups:\n');
  
  const fullBackups = [];
  const dbBackups = [];
  const imageBackups = [];
  
  backups.forEach(backup => {
    const backupPath = path.join(backupDir, backup);
    const manifestFile = path.join(backupPath, 'backup-manifest.json');
    
    if (fs.existsSync(manifestFile)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
        
        const backupInfo = {
          name: backup,
          type: manifest.backupType,
          date: manifest.backupDate,
          path: backupPath,
          manifest: manifest
        };
        
        switch (manifest.backupType) {
          case 'full':
            fullBackups.push(backupInfo);
            break;
          case 'database':
            dbBackups.push(backupInfo);
            break;
          case 'images':
            imageBackups.push(backupInfo);
            break;
        }
      } catch (error) {
        console.log(`⚠️  ${backup} - Invalid manifest file`);
      }
    } else {
      console.log(`⚠️  ${backup} - No manifest file`);
    }
  });
  
  // Hiển thị full backups
  if (fullBackups.length > 0) {
    console.log('🔄 Full Backups:');
    fullBackups.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(backup => {
      const date = new Date(backup.date).toLocaleString('vi-VN');
      console.log(`  📁 ${backup.name}`);
      console.log(`     📅 ${date}`);
      console.log(`     📊 Database: ${backup.manifest.database.exists ? 'Yes' : 'No'}`);
      console.log(`     🖼️  Images: ${backup.manifest.images.count} files`);
      console.log('');
    });
  }
  
  // Hiển thị database backups
  if (dbBackups.length > 0) {
    console.log('🗄️  Database Backups:');
    dbBackups.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(backup => {
      const date = new Date(backup.date).toLocaleString('vi-VN');
      console.log(`  📁 ${backup.name}`);
      console.log(`     📅 ${date}`);
      console.log(`     📊 Records: ${backup.manifest.totalRecords || 'Unknown'}`);
      console.log('');
    });
  }
  
  // Hiển thị image backups
  if (imageBackups.length > 0) {
    console.log('🖼️  Image Backups:');
    imageBackups.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(backup => {
      const date = new Date(backup.date).toLocaleString('vi-VN');
      const size = backup.manifest.totalSize ? 
        `${(backup.manifest.totalSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
      console.log(`  📁 ${backup.name}`);
      console.log(`     📅 ${date}`);
      console.log(`     📊 Images: ${backup.manifest.totalImages} files`);
      console.log(`     💾 Size: ${size}`);
      console.log('');
    });
  }
  
  console.log(`📈 Total backups: ${backups.length}`);
};

listBackups(); 