# HƯỚNG DẪN SỬ DỤNG PHẦN MỀM QUẢN LÝ HỘI VIÊN NGƯỜI CAO TUỔI

---

## 1. Giới thiệu

Phần mềm được thiết kế để giúp các cấp Hội Người cao tuổi quản lý thông tin hội viên một cách hiệu quả, khoa học và tiện lợi. Các chức năng chính bao gồm: quản lý danh sách hội viên, thống kê, in ấn, và sao lưu/phục hồi dữ liệu an toàn.

## 2. Khởi động phần mềm

- **Đối với người dùng cuối**: Chạy file `PhanMemQuanLyHoiVienNCT.exe` đã được cung cấp.
- **Đối với lập trình viên**:
  - Mở một cửa sổ dòng lệnh (Terminal/Command Prompt) tại thư mục gốc của dự án.
  - Chạy lệnh: `npm run dev`.
  - Ứng dụng sẽ tự động khởi động.

## 3. Giao diện chính

Giao diện chính gồm có 2 phần:

1.  **Thanh Menu trên cùng**: Chứa các chức năng hệ thống quan trọng.
    *   **Dữ liệu**: Dùng để Sao lưu, Khôi phục và Khởi tạo lại toàn bộ dữ liệu.
    *   **Trợ giúp**: Hiển thị thông tin về phần mềm và đơn vị phát triển.
2.  **Khu vực làm việc chính**: Hiển thị các trang chức năng như Trang chủ, Danh sách người cao tuổi, và Thống kê.

## 4. Hướng dẫn các chức năng chính

### 4.1. Quản lý Hội viên

Đây là chức năng cốt lõi của phần mềm, cho phép bạn xem, thêm, sửa và tìm kiếm thông tin hội viên.

#### a. Xem danh sách
- Mặc định, màn hình chính sẽ hiển thị danh sách toàn bộ hội viên dưới dạng lưới hình ảnh (gallery) hoặc bảng (table).
- Bạn có thể chuyển đổi giữa hai chế độ xem này bằng các nút bấm ở góc trên bên phải.
- Các hội viên đã mất sẽ được làm mờ và có dấu hiệu riêng để dễ phân biệt.

#### b. Thêm hội viên mới
1.  Nhấn nút **"Thêm mới"** màu xanh ở góc trên bên phải.
2.  Một cửa sổ mới sẽ hiện ra. Điền đầy đủ các thông tin cần thiết:
    *   **Họ và tên, Ngày sinh, Địa chỉ**: Là các thông tin bắt buộc.
    *   **Ảnh đại diện**: Nhấn vào biểu tượng máy ảnh trên ảnh đại diện mặc định để tải lên ảnh từ máy tính.
    *   **Thông tin khác**: Quê quán, Số điện thoại, Ngày tham gia, Số thẻ...
3.  Sau khi điền xong, nhấn nút **"Lưu"**. Hội viên mới sẽ được thêm vào danh sách.

#### c. Xem và Chỉnh sửa thông tin chi tiết
1.  Nhấn vào tên hoặc ảnh của một hội viên trong danh sách.
2.  Cửa sổ chi tiết thông tin sẽ hiện ra, hiển thị đầy đủ thông tin của hội viên đó.
3.  Để chỉnh sửa, nhấn vào nút **"Chỉnh sửa"** (biểu tượng cây bút).
4.  Các ô thông tin sẽ trở nên có thể thay đổi. Bạn có thể cập nhật lại thông tin hoặc thay đổi ảnh đại diện.
5.  Để cập nhật tình trạng hội viên (ví dụ: từ "còn sống" sang "đã mất"), gạt công tắc **"Đã mất"** và chọn ngày mất.
6.  Sau khi sửa xong, nhấn nút **"Lưu"**.

#### d. Tìm kiếm và Lọc
- Sử dụng ô **"Tìm kiếm theo tên..."** ở đầu danh sách để nhanh chóng tìm một hội viên.
- Sử dụng các bộ lọc để thu hẹp danh sách theo các tiêu chí như:
    *   **Tình trạng**: Còn sống / Đã mất.
    *   **Độ tuổi**: Lọc theo các khoảng tuổi (ví dụ: 70-75 tuổi, trên 80 tuổi...).
    *   **Giới tính**: Nam / Nữ.

### 4.2. Quản lý Dữ liệu (Menu "Dữ liệu")

Đây là các chức năng rất quan trọng để đảm bảo an toàn cho dữ liệu của bạn.

#### a. Sao lưu tất cả dữ liệu
- **Chức năng**: Tạo một bản sao lưu hoàn chỉnh, bao gồm toàn bộ thông tin hội viên và tất cả hình ảnh đã tải lên.
- **Cách dùng**:
  1.  Vào menu **Dữ liệu** -> **Sao lưu tất cả dữ liệu** (Hoặc nhấn `Ctrl+B`).
  2.  Xác nhận yêu cầu.
  3.  Phần mềm sẽ tạo một thư mục sao lưu mới trong thư mục `backups`.
- **Lưu ý**: Nên thực hiện thao tác này định kỳ (ví dụ: cuối mỗi tháng) để phòng trường hợp máy tính gặp sự cố.

#### b. Khôi phục dữ liệu
- **Chức năng**: Lấy lại toàn bộ dữ liệu từ một bản sao lưu trước đó. Thao tác này sẽ **ghi đè** toàn bộ dữ liệu hiện tại.
- **Cách dùng**:
  1.  Vào menu **Dữ liệu** -> **Khôi phục dữ liệu** (Hoặc nhấn `Ctrl+R`).
  2.  Xác nhận yêu cầu. Phần mềm sẽ tự động tìm bản sao lưu mới nhất và phục hồi.
- **Cảnh báo**: Chỉ sử dụng chức năng này khi bạn chắc chắn muốn quay lại trạng thái dữ liệu cũ.

#### c. Khởi tạo dữ liệu mới
- **Chức năng**: Xóa **toàn bộ** dữ liệu hội viên và hình ảnh hiện có, đưa phần mềm về trạng thái trống như lúc mới cài đặt. Thao tác này rất hữu ích khi bạn muốn bắt đầu sử dụng cho một đơn vị mới.
- **Cách dùng**:
  1.  Vào menu **Dữ liệu** -> **Khởi tạo dữ liệu mới** (Hoặc nhấn `Ctrl+N`).
  2.  Đọc kỹ cảnh báo và xác nhận.
- **Cảnh báo**: Thao tác này không thể hoàn tác. Hãy chắc chắn bạn đã sao lưu dữ liệu quan trọng trước khi thực hiện.

### 4.3. In ấn và Xuất file

- **In thông tin cá nhân**: Trong cửa sổ chi tiết hội viên, nhấn nút **"In"** (biểu tượng máy in) để tạo một biểu mẫu thông tin sẵn sàng để in ra giấy.
- **Xuất danh sách ra Excel**: Ở màn hình danh sách, nhấn nút **"Xuất Excel"** để tải về một file Excel chứa thông tin của tất cả hội viên đang hiển thị trong danh sách.

### 4.4. Thống kê
- Truy cập trang "Thống kê" từ menu bên trái để xem các biểu đồ trực quan về cơ cấu hội viên theo độ tuổi, giới tính...

## 5. Xử lý sự cố thường gặp

- **Menu "Dữ liệu" bị mờ, không nhấn được**:
  - **Nguyên nhân**: Backend (phần xử lý dữ liệu) chưa khởi động xong hoặc đã gặp lỗi.
  - **Khắc phục**: Vui lòng đợi khoảng 15 giây. Nếu menu vẫn bị mờ, hãy tắt hẳn phần mềm và khởi động lại.
- **Hình ảnh không hiển thị**:
  - **Nguyên nhân**: File ảnh có thể đã bị xóa hoặc di chuyển.
  - **Khắc phục**: Vào phần chỉnh sửa thông tin hội viên và tải lại ảnh đại diện.
- **Lỗi khi Sao lưu/Khôi phục**:
  - **Khắc phục**: Đảm bảo bạn không tắt phần mềm giữa chừng khi đang thực hiện các tác vụ này. Khởi động lại phần mềm và thử lại.

## 6. Thông tin liên hệ

Mọi thắc mắc và yêu cầu hỗ trợ, vui lòng liên hệ:
- **Công ty TNHH công nghệ số Đức Minh**
- **Điện thoại**: 0963.762.379

--- 