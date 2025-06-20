const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Đường dẫn database và uploads
const dbPath = path.join(__dirname, '../backend/db/elderly.db');
const uploadsPath = path.join(__dirname, '../backend/uploads');

// 1. Xóa database cũ nếu có
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️ Đã xóa database cũ.');
}

// 2. Tạo database mới với cấu trúc bảng
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Không thể tạo database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Đã tạo database mới.');
  }
});

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
  )`, (err) => {
    if (err) {
      console.error('❌ Lỗi tạo bảng:', err.message);
    } else {
      console.log('✅ Đã tạo bảng elderly (không có dữ liệu).');
    }
    db.close();
  });
});

// 3. Xóa toàn bộ file trong uploads (nếu có)
if (fs.existsSync(uploadsPath)) {
  const files = fs.readdirSync(uploadsPath);
  files.forEach(file => {
    const filePath = path.join(uploadsPath, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });
  console.log('🗑️ Đã xóa toàn bộ hình ảnh trong uploads.');
} else {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Đã tạo thư mục uploads.');
}

console.log('🎉 Đã khởi tạo dữ liệu trắng cho đơn vị mới!'); 