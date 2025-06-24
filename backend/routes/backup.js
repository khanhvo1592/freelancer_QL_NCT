const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const router = express.Router();

// Lấy danh sách backup
router.get('/list', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) return res.json([]);
    const backups = fs.readdirSync(backupDir)
      .filter(dir => dir.startsWith('full-backup-'))
      .map(dir => {
        const backupPath = path.join(backupDir, dir);
        const manifestFile = path.join(backupPath, 'backup-manifest.json');
        let manifest = null;
        if (fs.existsSync(manifestFile)) {
          try {
            manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
          } catch {}
        }
        return {
          name: dir,
          path: backupPath,
          type: manifest?.backupType || 'full',
          date: manifest?.backupDate || '',
          manifest
        };
      });
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy danh sách backup' });
  }
});

// Tạo backup mới
router.post('/create', async (req, res) => {
  const { type, customPath } = req.body;
  let script = 'node scripts/backup-all.js';
  // Nếu muốn phân loại type, có thể mở rộng ở đây
  // Nếu customPath, truyền biến môi trường
  const env = { ...process.env };
  if (customPath) env.BACKUP_CUSTOM_PATH = customPath;
  exec(script, { cwd: path.join(__dirname, '../../'), env }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Lỗi khi tạo backup', detail: stderr });
    }
    res.json({ success: true, stdout });
  });
});

// Khôi phục backup
router.post('/restore', async (req, res) => {
  const { backupPath } = req.body;
  if (!backupPath) return res.status(400).json({ error: 'Thiếu đường dẫn backup' });
  const script = `node scripts/restore-all.js "${backupPath}"`;
  exec(script, { cwd: path.join(__dirname, '../../') }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Lỗi khi khôi phục backup', detail: stderr });
    }
    res.json({ success: true, stdout });
  });
});

// Xóa backup
router.delete('/delete', async (req, res) => {
  const { backupPath } = req.body;
  if (!backupPath) return res.status(400).json({ error: 'Thiếu đường dẫn backup' });
  try {
    fs.rmSync(backupPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa backup' });
  }
});

module.exports = router; 