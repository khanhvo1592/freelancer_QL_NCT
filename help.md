# HƯỚNG DẪN SỬ DỤNG PHẦN MỀM QUẢN LÝ NGƯỜI CAO TUỔI

## I. YÊU CẦU HỆ THỐNG
- **Hệ điều hành:** Windows
- **Dung lượng ổ đĩa trống:** Tối thiểu 500MB
- **Yêu cầu bản quyền:**
  - Cần có thư mục `D:\image`
  - Trong thư mục phải có ít nhất một file ảnh định dạng .jpg

## II. HƯỚNG DẪN CÀI ĐẶT
1. Chạy file cài đặt `Elder Manager Setup.exe`
2. Chọn thư mục cài đặt và làm theo hướng dẫn
3. Tạo thư mục `D:\image` và copy một file ảnh .jpg vào thư mục này
4. Khởi động ứng dụng từ shortcut trên Desktop hoặc Start Menu

## III. CÁC CHỨC NĂNG CHÍNH

### 1. Quản lý thông tin người cao tuổi
- Thêm mới người cao tuổi
- Cập nhật thông tin
- Xóa thông tin
- Tìm kiếm và lọc danh sách

### 2. Xuất báo cáo
- Xuất file Word với đầy đủ thông tin
- In phiếu thông tin
- Tạo báo cáo thống kê

### 3. Quản lý hình ảnh
- Upload ảnh người cao tuổi
- Xem và cập nhật ảnh
- Hỗ trợ định dạng ảnh phổ biến

### 4. Thống kê và Báo cáo
- Xem thống kê tổng quan
- Dự báo phân bố độ tuổi
- Xuất báo cáo Excel
- In báo cáo thống kê

## IV. HƯỚNG DẪN SỬ DỤNG CHI TIẾT

### 1. Thêm mới người cao tuổi
1. Click nút "Thêm mới"
2. Điền đầy đủ thông tin vào form
3. Upload ảnh (nếu có)
4. Nhấn "Lưu" để hoàn tất

### 2. Xuất file Word
1. Chọn người cao tuổi cần xuất thông tin
2. Click nút "Xuất Word"
3. Chọn vị trí lưu file
4. File sẽ được tạo với tên theo format: `Phieu_thong_tin_[Họ_tên].docx`

### 3. Tìm kiếm
- Sử dụng ô tìm kiếm phía trên danh sách
- Có thể lọc theo nhiều tiêu chí khác nhau
- Kết quả sẽ được hiển thị ngay lập tức

### 4. Sử dụng tính năng Thống kê

#### a. Xem thống kê tổng quan
- Vào mục "Thống kê người cao tuổi"
- Xem các thông tin:
  - Tổng số người cao tuổi
  - Phân bố theo nhóm tuổi (70-75, 75-80, 80-85, 85-90, 95-100, trên 100 tuổi)
  - Tỷ lệ còn sống/đã mất

#### b. Sử dụng tính năng dự báo
- Chọn năm dự báo từ danh sách (2025-2030)
- Xem biểu đồ phân bố độ tuổi theo năm
- Xem danh sách Top 5 người cao tuổi nhất
- Theo dõi xu hướng thay đổi qua các năm

#### c. Xuất báo cáo Excel
1. Click nút "Xuất Excel"
2. Chọn vị trí lưu file
3. File Excel sẽ bao gồm:
   - Thống kê tổng quan
   - Phân bố độ tuổi
   - Thống kê trạng thái
   - Top 5 người cao tuổi
   - Dự báo theo năm đã chọn

#### d. In báo cáo
1. Click nút "In báo cáo"
2. Chọn máy in và các tùy chọn in
3. Xem trước bản in trước khi in

#### e. Đọc biểu đồ thống kê
- **Biểu đồ tròn:** Hiển thị tỷ lệ phân bố độ tuổi
- **Biểu đồ cột:** Hiển thị Top 5 người cao tuổi
- **Biểu đồ đường:** Theo dõi xu hướng thay đổi
- **Biểu đồ vùng:** Xem dự báo phân bố độ tuổi

## V. XỬ LÝ SỰ CỐ

### 1. Ứng dụng không khởi động
- Kiểm tra thư mục `D:\image` đã tồn tại chưa
- Kiểm tra trong thư mục có file .jpg không
- Thử khởi động lại máy tính

### 2. Không xuất được file Word
- Kiểm tra quyền truy cập thư mục
- Đảm bảo đã điền đầy đủ thông tin cần thiết
- Kiểm tra dung lượng ổ đĩa

### 3. Lỗi kết nối
- Kiểm tra kết nối internet
- Thử khởi động lại ứng dụng
- Liên hệ support nếu vẫn gặp lỗi


## VI. LƯU Ý QUAN TRỌNG
1. Luôn sao lưu dữ liệu định kỳ
2. Không xóa thư mục `D:\image` khi đang sử dụng phần mềm

---
*Lưu ý: Hướng dẫn này được cập nhật theo phiên bản mới nhất của phần mềm.*

# BUILD

Tôi sẽ hướng dẫn bạn từng bước để build ứng dụng Windows:

1. **Trước khi build**, cập nhật lại `package.json` trong thư mục gốc:
```json:package.json
{
  "build": {
    "appId": "com.elder-manager.app",
    "productName": "Phần mềm quản lý hội viên hội người cao tuổi",
    "files": [
      "main.js",
      "elder-manager/build/**/*",
      "elder-manager/node_modules/**/*",
      "elder-mgmt-be/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "elder-manager/public",
      "output": "dist"
    },
    "win": {
      "target": "nsis",
      "icon": "elder-manager/public/app.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "installerIcon": "elder-manager/public/app.ico",
      "uninstallerIcon": "elder-manager/public/app.ico",
      "installerHeaderIcon": "elder-manager/public/app.ico",
      "installerSidebar": "elder-manager/public/installer-sidebar.bmp",
      "uninstallerSidebar": "elder-manager/public/installer-sidebar.bmp"
    }
  }
}
```

2. **Cập nhật main.js** để chạy ở chế độ production:
```javascript:main.js
// ... existing code ...
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        icon: path.join(__dirname, 'elder-manager/public/app.ico'),
        title: 'Phần mềm quản lý hội viên hội người cao tuổi'
    });

    // Trong production, load file từ thư mục build
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'elder-manager/build/index.html'));
        // Khởi động backend server
        startBackend();
    }
}
```

3. **Các bước build**:

```bash
# 1. Dừng tất cả các process đang chạy

# 2. Xóa các thư mục build cũ
rm -rf dist/
rm -rf elder-manager/build/

# 3. Install dependencies
npm install
cd elder-manager && npm install
cd ../elder-mgmt-be && npm install
cd ..

# 4. Build React app
cd elder-manager
npm run build
cd ..

# 5. Build ứng dụng Electron
npm run electron-pack
```

4. **Kiểm tra kết quả**:
- Sau khi build xong, vào thư mục `dist` sẽ thấy:
  - Thư mục `win-unpacked`: chứa ứng dụng portable
  - File `.exe`: file cài đặt

5. **Cấu trúc thư mục sau khi build**:
```
dist/
├── win-unpacked/
│   ├── Phần mềm quản lý hội viên hội người cao tuổi.exe
│   ├── resources/
│   │   ├── app/
│   │   │   ├── main.js
│   │   │   │   └── build/
│   │   │   └── elder-mgmt-be/
│   │   └── ...
│   └── ...
└── Phần mềm quản lý hội viên hội người cao tuổi Setup.exe
```

6. **Lưu ý quan trọng**:
- Đảm bảo file `app.ico` tồn tại trong `elder-manager/public/`
- Kiểm tra đường dẫn trong `main.js` đã chính xác
- Kiểm tra tất cả dependencies đã được cài đặt
- Đảm bảo database SQLite được khởi tạo đúng cách trong production

7. **Để test ứng dụng đã build**:
- Chạy file `Phần mềm quản lý hội viên hội người cao tuổi Setup.exe` trong thư mục `dist`
- Hoặc vào thư mục `dist/win-unpacked` và chạy file `.exe` để test phiên bản portable

Nếu gặp lỗi trong quá trình build, hãy kiểm tra:
1. Log lỗi trong terminal
2. Đảm bảo tất cả đường dẫn trong code đều sử dụng `path.join()`
3. Kiểm tra cấu hình trong `package.json`
4. Xem có file nào bị thiếu trong `files` của cấu hình build không

# Hướng dẫn sử dụng tính năng quản lý dữ liệu

## Tổng quan

Phần mềm quản lý hội viên hội người cao tuổi đã được tích hợp 3 tính năng quản lý dữ liệu quan trọng:

1. **Sao lưu tất cả dữ liệu** - Tạo bản sao lưu hoàn chỉnh
2. **Khôi phục dữ liệu** - Khôi phục từ bản sao lưu
3. **Khởi tạo dữ liệu mới** - Tạo database mới

## 1. Sao lưu tất cả dữ liệu

### Cách sử dụng:
- **Menu**: Dữ liệu → Sao lưu tất cả dữ liệu
- **Phím tắt**: Ctrl + B

### Chức năng:
- Sao lưu toàn bộ database SQLite
- Sao lưu tất cả hình ảnh trong thư mục uploads
- Tạo file JSON chứa dữ liệu database
- Tạo file manifest mô tả bản sao lưu
- Lưu trong thư mục `backups/full-backup-[timestamp]`

### Cấu trúc bản sao lưu:
```
backups/
└── full-backup-2024-01-15T10-30-45-123Z/
    ├── backup-manifest.json
    ├── database/
    │   ├── elderly.db
    │   └── elderly-data.json
    └── images/
        ├── 1745674526354.jpg
        ├── 1745762913401.jpg
        └── ...
```

### Thông tin hiển thị sau khi sao lưu:
- Số lượng bản ghi database
- Số lượng file hình ảnh
- Kích thước tổng cộng
- Vị trí lưu bản sao lưu

## 2. Khôi phục dữ liệu

### Cách sử dụng:
- **Menu**: Dữ liệu → Khôi phục dữ liệu
- **Phím tắt**: Ctrl + R

### Chức năng:
- Tự động tìm bản sao lưu mới nhất
- Tạo backup của dữ liệu hiện tại trước khi khôi phục
- Khôi phục database từ bản sao lưu
- Khôi phục tất cả hình ảnh
- Xác minh tính toàn vẹn dữ liệu

### Quy trình an toàn:
1. Tạo backup của database hiện tại → `elderly-pre-restore.db`
2. Tạo backup của hình ảnh hiện tại → `uploads-pre-restore/`
3. Khôi phục dữ liệu từ bản sao lưu
4. Xác minh số lượng bản ghi

### Thông tin hiển thị sau khi khôi phục:
- Số lượng bản ghi đã khôi phục
- Số lượng hình ảnh đã khôi phục
- Kích thước dữ liệu đã khôi phục

## 3. Khởi tạo dữ liệu mới

### Cách sử dụng:
- **Menu**: Dữ liệu → Khởi tạo dữ liệu mới
- **Phím tắt**: Ctrl + N

### Chức năng:
- Xóa database hiện tại
- Tạo database mới với cấu trúc bảng chuẩn
- Xóa tất cả hình ảnh trong thư mục uploads
- Tạo thư mục uploads mới nếu chưa tồn tại

### Cấu trúc bảng được tạo:
```sql
CREATE TABLE elderly (
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
)
```

## Lưu ý quan trọng

### ⚠️ Cảnh báo bảo mật:
- **Khôi phục dữ liệu** sẽ ghi đè hoàn toàn dữ liệu hiện tại
- **Khởi tạo dữ liệu mới** sẽ xóa vĩnh viễn tất cả dữ liệu
- Luôn sao lưu trước khi thực hiện các thao tác quan trọng

### 🔄 Backup tự động:
- Khi khôi phục, hệ thống tự động tạo backup của dữ liệu hiện tại
- Backup được lưu với tên `elderly-pre-restore.db` và `uploads-pre-restore/`
- Có thể sử dụng để khôi phục lại nếu cần

### 📁 Quản lý bản sao lưu:
- Tất cả bản sao lưu được lưu trong thư mục `backups/`
- Mỗi bản sao lưu có timestamp riêng
- Có thể xóa thủ công các bản sao lưu cũ để tiết kiệm dung lượng

### 🛠️ Xử lý lỗi:
- Nếu database bị hỏng, sử dụng tính năng khôi phục
- Nếu hình ảnh bị mất, khôi phục từ bản sao lưu
- Nếu cần bắt đầu lại hoàn toàn, sử dụng khởi tạo dữ liệu mới

## Phím tắt

| Tính năng | Phím tắt |
|-----------|----------|
| Sao lưu tất cả dữ liệu | Ctrl + B |
| Khôi phục dữ liệu | Ctrl + R |
| Khởi tạo dữ liệu mới | Ctrl + N |

## Khắc phục sự cố

### Lỗi "Database file not found":
- Kiểm tra file `backend/db/elderly.db` có tồn tại không
- Sử dụng tính năng khởi tạo dữ liệu mới để tạo database

### Lỗi "No backups found":
- Kiểm tra thư mục `backups/` có tồn tại không
- Đảm bảo đã thực hiện sao lưu ít nhất một lần

### Lỗi "Backup directory not found":
- Kiểm tra đường dẫn đến thư mục backup
- Đảm bảo quyền truy cập vào thư mục

### Lỗi khi khôi phục:
- Kiểm tra bản sao lưu có đầy đủ không
- Thử khôi phục từ bản sao lưu khác
- Kiểm tra dung lượng ổ đĩa còn trống

## Liên hệ hỗ trợ

Nếu gặp vấn đề với các tính năng quản lý dữ liệu, vui lòng liên hệ:

**Công ty TNHH công nghệ số Đức minh**
- Điện thoại: 0963 762 379
- Email: support@ducminh.com.vn
