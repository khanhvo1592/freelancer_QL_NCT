# Backup và Restore Scripts

Các script này giúp backup và restore dữ liệu cho ứng dụng Quản lý Hội viên NCT.

## Các Script Có Sẵn

### 1. Backup Scripts

#### `backup-db.js` - Backup Database
```bash
# Sử dụng npm script
npm run backup:db

# Hoặc chạy trực tiếp
node scripts/backup-db.js
```
- Tạo backup database SQLite
- Export dữ liệu dưới dạng JSON
- Lưu trong thư mục `backups/db-backup-[timestamp]`

#### `backup-images.js` - Backup Images
```bash
# Sử dụng npm script
npm run backup:images

# Hoặc chạy trực tiếp
node scripts/backup-images.js
```
- Backup tất cả images từ thư mục `backend/uploads`
- Lưu trong thư mục `backups/images-backup-[timestamp]`

#### `backup-all.js` - Backup Toàn bộ
```bash
# Sử dụng npm script
npm run backup:all

# Hoặc chạy trực tiếp
node scripts/backup-all.js
```
- Backup cả database và images
- Lưu trong thư mục `backups/full-backup-[timestamp]`

### 2. Restore Scripts

#### `restore-db.js` - Restore Database
```bash
# Restore từ backup mới nhất
npm run restore:db

# Restore từ backup cụ thể
npm run restore:db backups/db-backup-2024-01-15T10-30-00-000Z

# Hoặc chạy trực tiếp
node scripts/restore-db.js [backup-path]
```

#### `restore-images.js` - Restore Images
```bash
# Restore từ backup mới nhất
npm run restore:images

# Restore từ backup cụ thể
npm run restore:images backups/images-backup-2024-01-15T10-30-00-000Z

# Hoặc chạy trực tiếp
node scripts/restore-images.js [backup-path]
```

#### `restore-all.js` - Restore Toàn bộ
```bash
# Restore từ backup mới nhất
npm run restore:all

# Restore từ backup cụ thể
npm run restore:all backups/full-backup-2024-01-15T10-30-00-000Z

# Hoặc chạy trực tiếp
node scripts/restore-all.js [backup-path]
```

### 3. Utility Scripts

#### `list-backups.js` - Liệt kê Backups
```bash
# Sử dụng npm script
npm run list:backups

# Hoặc chạy trực tiếp
node scripts/list-backups.js
```
- Hiển thị tất cả backups có sẵn
- Phân loại theo loại backup (full, database, images)
- Hiển thị thông tin chi tiết về mỗi backup

## Cấu trúc Thư mục Backup

```
backups/
├── full-backup-2024-01-15T10-30-00-000Z/
│   ├── database/
│   │   ├── elderly.db
│   │   └── elderly-data.json
│   ├── images/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   └── backup-manifest.json
├── db-backup-2024-01-15T10-30-00-000Z/
│   ├── elderly.db
│   ├── elderly-data.json
│   └── backup-manifest.json
└── images-backup-2024-01-15T10-30-00-000Z/
    ├── image1.jpg
    ├── image2.jpg
    ├── ...
    └── backup-manifest.json
```

## Tính năng Bảo mật

- **Auto-backup trước khi restore**: Tự động tạo backup của dữ liệu hiện tại trước khi restore
- **Verification**: Kiểm tra tính toàn vẹn dữ liệu sau khi restore
- **Manifest files**: Lưu thông tin chi tiết về mỗi backup
- **Timestamp**: Mỗi backup có timestamp duy nhất

## Ví dụ Sử dụng

### Backup hàng ngày
```bash
# Tạo backup toàn bộ
npm run backup:all
```

### Restore khi có sự cố
```bash
# Xem danh sách backups
npm run list:backups

# Restore từ backup mới nhất
npm run restore:all
```

### Backup riêng lẻ
```bash
# Chỉ backup database
npm run backup:db

# Chỉ backup images
npm run backup:images
```

## Lưu ý

1. **Dừng ứng dụng**: Nên dừng ứng dụng trước khi restore để tránh xung đột
2. **Kiểm tra backup**: Luôn kiểm tra backup trước khi xóa dữ liệu gốc
3. **Sao lưu thường xuyên**: Nên tạo backup định kỳ để bảo vệ dữ liệu
4. **Kiểm tra dung lượng**: Đảm bảo đủ dung lượng ổ đĩa cho backup

## Troubleshooting

### Lỗi "Database file not found"
- Kiểm tra đường dẫn `backend/db/elderly.db`
- Đảm bảo database đã được tạo

### Lỗi "Uploads directory not found"
- Kiểm tra thư mục `backend/uploads`
- Tạo thư mục nếu chưa tồn tại

### Lỗi "No backups found"
- Kiểm tra thư mục `backups`
- Tạo backup trước khi restore 