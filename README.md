# Phần mềm quản lý hội viên hội người cao tuổi

Ứng dụng desktop được xây dựng bằng Electron, React và Node.js để quản lý thông tin hội viên hội người cao tuổi.

## Tính năng chính

### Quản lý dữ liệu
- **Sao lưu tất cả dữ liệu** (Ctrl+B): Tạo bản sao lưu hoàn chỉnh của database và tất cả hình ảnh
- **Khôi phục dữ liệu** (Ctrl+R): Khôi phục dữ liệu từ bản sao lưu mới nhất
- **Khởi tạo dữ liệu mới** (Ctrl+N): Tạo database mới và xóa tất cả dữ liệu hiện tại

### Quản lý hội viên
- Thêm, sửa, xóa thông tin hội viên
- Upload và quản lý hình ảnh hội viên
- Tìm kiếm và lọc hội viên
- In thông tin hội viên
- Xuất dữ liệu ra Excel

### Thống kê
- Thống kê theo độ tuổi, giới tính
- Thống kê theo địa chỉ, quê quán
- Biểu đồ trực quan

### Quản lý Process
- Tự động kill tất cả process Node.js khi đóng ứng dụng
- Xử lý graceful shutdown cho backend server
- Cleanup resources khi ứng dụng crash

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+ 
- Windows 10/11

### Cài đặt
```bash
npm install
```

### Chạy trong môi trường development
```bash
npm run dev
```

### Build ứng dụng
```bash
npm run build
```

## Cấu trúc thư mục

```
├── electron/          # Ứng dụng Electron chính
├── frontend/          # React frontend
├── backend/           # Node.js backend API
├── scripts/           # Scripts backup/restore
├── backups/           # Thư mục chứa bản sao lưu
├── kill-node-processes.bat  # Script kill process (Windows)
└── dist/              # Thư mục build
```

## Hướng dẫn sử dụng

### Sao lưu dữ liệu
1. Mở menu "Dữ liệu" → "Sao lưu tất cả dữ liệu" (hoặc nhấn Ctrl+B)
2. Xác nhận sao lưu trong hộp thoại
3. Bản sao lưu sẽ được tạo trong thư mục `backups/`

### Khôi phục dữ liệu
1. Mở menu "Dữ liệu" → "Khôi phục dữ liệu" (hoặc nhấn Ctrl+R)
2. Xác nhận khôi phục trong hộp thoại
3. Dữ liệu sẽ được khôi phục từ bản sao lưu mới nhất

### Khởi tạo dữ liệu mới
1. Mở menu "Dữ liệu" → "Khởi tạo dữ liệu mới" (hoặc nhấn Ctrl+N)
2. Xác nhận khởi tạo trong hộp thoại
3. Tất cả dữ liệu hiện tại sẽ bị xóa và tạo database mới

### Quản lý Process
- Ứng dụng tự động kill tất cả process Node.js khi đóng
- Nếu có process "zombie", chạy file `kill-node-processes.bat`
- Backend server sẽ được shutdown gracefully

## Lưu ý quan trọng

⚠️ **Cảnh báo**: 
- Quá trình khôi phục và khởi tạo dữ liệu mới sẽ ghi đè dữ liệu hiện tại
- Luôn sao lưu dữ liệu trước khi thực hiện các thao tác quan trọng
- Bản sao lưu được lưu trong thư mục `backups/` với timestamp

🔄 **Quản lý Process**:
- Ứng dụng tự động cleanup khi đóng
- Nếu gặp lỗi "port already in use", chạy `kill-node-processes.bat`
- Backend server được quản lý tự động bởi Electron

## Khắc phục sự cố

### Process không đóng được:
1. Chạy file `kill-node-processes.bat` để force kill
2. Kiểm tra Task Manager xem còn process nào không
3. Restart máy tính nếu cần

### Port đã được sử dụng:
1. Chạy `kill-node-processes.bat`
2. Đợi 5 giây rồi chạy lại ứng dụng
3. Kiểm tra firewall settings

## Hỗ trợ

Công ty TNHH công nghệ số Đức minh
- Điện thoại: 0963 762 379

## License

© 2024 Công ty TNHH công nghệ số Đức minh