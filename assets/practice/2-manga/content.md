# Tương tác RESTful API

Bài thực hành này yêu cầu bạn sử dụng ngôn ngữ JavaScript (phương thức `fetch` hoặc các thư viện AJAX) để xây dựng ứng dụng Web đơn trang (SPA - Single Page Application) quản lý danh sách truyện tranh Manga, tương tác trực tiếp với API RESTful của hệ thống.

---

## Yêu cầu chức năng của ứng dụng (`manga.html`)

Bạn cần xây dựng một giao diện quản lý truyện tranh gồm các tính năng chính sau:

### 1. Hiển thị danh sách Manga
- Khi vừa tải trang (`onload` hoặc `DOMContentLoaded`), ứng dụng tự động gửi yêu cầu `GET /api/manga` để lấy toàn bộ danh sách manga từ hệ thống.
- Hiển thị danh sách manga dưới dạng lưới (grid cards) hoặc bảng (table) đẹp mắt. Mỗi bộ truyện hiển thị đầy đủ:
  - **Ảnh bìa** (`cover`): Thẻ `<img>` hiển thị ảnh đại diện của truyện.
  - **Tên truyện** (`title`), **Tác giả** (`author`), **Giá tiền** (`price` - định dạng VNĐ), **Thể loại** (`category`) và **Mô tả ngắn** (`description`).
  - Hai nút chức năng: **Sửa** (Edit) và **Xóa** (Delete) cho từng bộ truyện.

### 2. Tìm kiếm và Lọc danh sách Manga
- Tạo một ô nhập liệu (input search) để tìm kiếm. Khi người dùng gõ từ khóa, gửi yêu cầu API kèm query parameter `q` (Ví dụ: `/api/manga?q=sololeveling`).
- Tạo một dropdown `<select>` danh sách thể loại truyện. Khi người dùng thay đổi thể loại, lọc truyện tương ứng qua query parameter `category` (Ví dụ: `/api/manga?category=Action`).

### 3. Thêm truyện Manga mới
- Thiết kế biểu mẫu nhập liệu (hoặc Modal Popup) gồm các trường:
  - **Tên truyện** (`title`), **Tác giả** (`author`), **Giá tiền** (`price` - dạng số), **Thể loại** (`category`), **Ảnh bìa URL** (`cover` - dạng text link) và **Mô tả ngắn** (`description`).
- Khi nhấn nút "Thêm", gửi yêu cầu `POST /api/manga` với payload dạng JSON. Cập nhật lại danh sách hiển thị sau khi thêm thành công.

### 4. Cập nhật thông tin Manga
- Khi nhấn nút **Sửa** ở một bộ truyện, tự động đổ dữ liệu cũ của bộ truyện đó vào biểu mẫu nhập liệu.
- Khi nhấn nút "Lưu thay đổi", gửi yêu cầu `PUT /api/manga/[id]` với payload JSON chứa thông tin cập nhật mới. Cập nhật lại danh sách hiển thị.

### 5. Xóa Manga
- Khi nhấn nút **Xóa**, hiển thị hộp thoại xác nhận (Ví dụ: `confirm()`).
- Nếu người dùng chọn Đồng ý, gửi yêu cầu `DELETE /api/manga/[id]`. Cập nhật lại danh sách hiển thị.

---

## Hướng dẫn kết nối API & Cổng Endpoint

Hệ thống cung cấp sẵn các endpoint API RESTful dành cho bạn tại địa chỉ:
- Endpoint gốc: `http://localhost:3000/api/manga`
- Endpoint theo ID: `http://localhost:3000/api/manga/[id]`

> [!NOTE]
> **Cơ chế lưu trữ RAM phân tách theo IP**:
> - Hệ thống tự động phân biệt dữ liệu manga theo địa chỉ IP của bạn. Các thao tác thêm, sửa, xóa sẽ chỉ tác động đến cơ sở dữ liệu ảo của riêng bạn mà không ảnh hưởng đến người khác.
> - Dữ liệu được lưu trữ trực tiếp trên bộ nhớ RAM và tự động dọn dẹp (reset về trạng thái mặc định) sau **30 phút** nếu bạn không thực hiện bất kỳ hoạt động tương tác API nào.

### Kiểm thử trực tiếp
Bạn có thể sử dụng **Trình kiểm thử Live Database** và xem tài liệu chi tiết của từng endpoint ở bảng điều khiển bên cạnh để kiểm tra dữ liệu thực tế đang có trong phiên làm việc của mình!
