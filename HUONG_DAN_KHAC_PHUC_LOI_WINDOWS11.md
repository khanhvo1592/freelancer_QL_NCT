# Hướng dẫn khắc phục lỗi trên Windows 11

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi "Application failed to start" hoặc "Side-by-side configuration is incorrect"

**Nguyên nhân:** Thiếu Visual C++ Redistributable

**Cách khắc phục:**
1. Tải và cài đặt Visual C++ Redistributable từ: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Khởi động lại máy tính
3. Chạy lại ứng dụng

### 2. Lỗi "Access denied" hoặc "Permission denied"

**Nguyên nhân:** Windows 11 có các hạn chế bảo mật nghiêm ngặt

**Cách khắc phục:**
1. Chạy ứng dụng với quyền Administrator:
   - Chuột phải vào file exe → "Run as administrator"
2. Hoặc sử dụng file `run-app.bat` đã được tạo

### 3. Lỗi "Node.js not found" hoặc "Backend failed to start"

**Nguyên nhân:** Node.js chưa được cài đặt hoặc không có trong PATH

**Cách khắc phục:**
1. Cài đặt Node.js từ: https://nodejs.org
2. Chọn phiên bản LTS (Long Term Support)
3. Đảm bảo tích hợp "Add to PATH" trong quá trình cài đặt

### 4. Lỗi "Port 5000 is already in use"

**Nguyên nhân:** Port 5000 đang được sử dụng bởi ứng dụng khác

**Cách khắc phục:**
1. Mở Task Manager (Ctrl + Shift + Esc)
2. Tìm và kết thúc các process Node.js đang chạy
3. Hoặc chạy file `kill-node-processes.bat`

### 5. Lỗi "Windows Defender blocked this app"

**Nguyên nhân:** Windows Defender chặn ứng dụng không được ký số

**Cách khắc phục:**
1. Mở Windows Security
2. Vào "Virus & threat protection"
3. Chọn "Manage settings" trong "Virus & threat protection settings"
4. Thêm thư mục chứa ứng dụng vào "Exclusions"
5. Hoặc tạm thời tắt Real-time protection

### 6. Lỗi "Database connection failed"

**Nguyên nhân:** SQLite3 module không tương thích với Windows 11

**Cách khắc phục:**
1. Chạy script kiểm tra: `fix-windows11-issues.ps1`
2. Đảm bảo Visual C++ Redistributable đã được cài đặt
3. Rebuild ứng dụng: `npm run build`

## Các bước kiểm tra và khắc phục tự động

### Bước 1: Chạy script kiểm tra
```powershell
# Mở PowerShell với quyền Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\fix-windows11-issues.ps1
```

### Bước 2: Rebuild ứng dụng
```bash
# Xóa các file cũ
npm run clean

# Cài đặt lại dependencies
npm install

# Build lại ứng dụng
npm run build:all
```

### Bước 3: Chạy ứng dụng
```bash
# Sử dụng file batch
run-app.bat

# Hoặc chạy trực tiếp
dist\PhanMemQuanLyHoiVienNCT.exe
```

## Các yêu cầu hệ thống

- **Hệ điều hành:** Windows 10/11 (64-bit)
- **RAM:** Tối thiểu 4GB, khuyến nghị 8GB
- **Dung lượng:** Ít nhất 500MB trống
- **Phần mềm cần thiết:**
  - Visual C++ Redistributable 2015-2022
  - .NET Framework 4.8 hoặc mới hơn
  - Node.js 16.x hoặc mới hơn (nếu chạy từ source)

## Liên hệ hỗ trợ

Nếu vẫn gặp lỗi sau khi thực hiện các bước trên, vui lòng:

1. Chạy script `fix-windows11-issues.ps1` và gửi kết quả
2. Chụp màn hình thông báo lỗi
3. Gửi thông tin về phiên bản Windows và cấu hình máy

**Công ty TNHH công nghệ số Đức Minh**  
Điện thoại: 0963.762.379
