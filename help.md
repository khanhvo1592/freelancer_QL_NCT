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
│   │   │   ├── elder-manager/
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
