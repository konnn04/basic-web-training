# Thiết kế các Form HTML cơ bản

Bài thực hành này yêu cầu bạn xây dựng 3 trang web chứa các biểu mẫu (form) nhập liệu thông dụng: Đăng Nhập, Đăng Ký và Cài Đặt Thông Tin Cá Nhân.

---

## Phần 1: Trang Đăng Nhập (`login.html`)

Tạo trang đăng nhập với giao diện đơn giản, gồm các trường dữ liệu được mô tả trong bảng dưới đây:

### Đặc tả các trường dữ liệu (Form Fields)

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 1 | Email | `email` | `type="email"` | ✅ required | placeholder: `vidu@email.com` |
| 2 | Mật khẩu | `password` | `type="password"` | ✅ required | minlength = `6` |
| 3 | Ghi nhớ đăng nhập | `remember` | `type="checkbox"` | Không | mặc định checked sẵn, `value="1"` |
| 4 | Loại form | `formType` | `type="hidden"` | — | mặc định `value="login"` |

### Yêu cầu về Giao diện & Trải nghiệm (UI/UX)
- **Tiêu đề chính**: Dùng thẻ `<h1>` với nội dung **"Đăng Nhập"**.
- **Mô tả ngắn**: Thêm đoạn mô tả bên dưới tiêu đề: *"Vui lòng nhập thông tin tài khoản của bạn để đăng nhập vào hệ thống."*
- **Điều hướng**: 
  - Thêm một liên kết chuyển hướng sang trang đăng ký: *"Chưa có tài khoản? Đăng ký ngay"*
  - Thêm một liên kết quên mật khẩu: *"Quên mật khẩu?"* (đặt `href="#"`).
- **Nút gửi form**: Tạo nút submit (`type="submit"`) có nội dung **"Đăng Nhập"**.

---

## Phần 2: Trang Đăng Ký (`register.html`)

Tạo trang đăng ký tài khoản mới. Form đăng ký cần được gom nhóm và phân vùng rõ ràng thành 2 nhóm thông tin bằng thẻ `<section>` với tiêu đề `<h2>` tương ứng:

### Nhóm 1: Thông tin cá nhân
*Tiêu đề `<h2>`: "Thông tin cá nhân"*

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 1 | Họ | `lastname` | `type="text"` | ✅ required | placeholder: `Nguyễn` |
| 2 | Tên | `firstname` | `type="text"` | ✅ required | placeholder: `Văn A` |
| 3 | Ngày sinh | `birthdate` | `type="date"` | ✅ required | |
| 4 | Giới tính | `gender` | `type="radio"` | ✅ required | Gồm 3 lựa chọn: Nam (`male`), Nữ (`female`), Khác (`other`) |
| 5 | Số điện thoại | `phone` | `type="tel"` | ✅ required | Kiểm tra định dạng Regex bằng thuộc tính `pattern="[0-9]{10,11}"` |

### Nhóm 2: Thông tin tài khoản
*Tiêu đề `<h2>`: "Thông tin tài khoản"*

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 6 | Email | `email` | `type="email"` | ✅ required | |
| 7 | Mật khẩu | `password` | `type="password"` | ✅ required | minlength = `8` |
| 8 | Xác nhận mật khẩu | `confirmPassword` | `type="password"` | ✅ required | minlength = `8` |

### Các trường chung & Nút bên ngoài nhóm

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 9 | Đồng ý điều khoản | `agree` | `type="checkbox"` | ✅ required | `value="1"` |
| 10| Loại form | `formType` | `type="hidden"` | — | mặc định `value="register"` |

### Yêu cầu về Giao diện & Trải nghiệm (UI/UX)
- **Tiêu đề chính**: Dùng thẻ `<h1>` với nội dung **"Đăng Ký Tài Khoản"**.
- **Mô tả ngắn**: Thêm đoạn mô tả: *"Điền đầy đủ thông tin bên dưới để tạo tài khoản mới."*
- **Hệ thống nút bấm**: 
  - Tạo 2 nút: **Nhập Lại** (`type="reset"`) và **Đăng Ký** (`type="submit"`) xếp ngang hàng nhau.
- **Điều hướng**: 
  - Một liên kết dẫn về trang đăng nhập: *"Đã có tài khoản? Đăng nhập tại đây"*.

---

## Phần 3: Trang Cài Đặt Thông Tin Cá Nhân (`settings.html`)

Tạo trang cấu hình Profile và Bảo mật cá nhân. Giao diện trang này phức tạp hơn, yêu cầu áp dụng **bố cục 2 cột** bằng CSS Grid hoặc Flexbox và chia thành 4 nhóm thông tin (mỗi nhóm dùng thẻ `<section>` với tiêu đề `<h2>`):

### Cột trái (Column 1)

#### Nhóm 1: Thông tin cá nhân
*Tiêu đề `<h2>`: "Thông tin cá nhân"*

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 1 | Ảnh đại diện | `avatar` | `type="file"` | Không | Chỉ nhận file ảnh: `accept="image/*"` |
| 2 | Họ | `lastname` | `type="text"` | ✅ required | đặt sẵn giá trị mặc định `value="Nguyễn"` |
| 3 | Tên | `firstname` | `type="text"` | ✅ required | đặt sẵn giá trị mặc định `value="Văn A"` |
| 4 | Ngày sinh | `birthdate` | `type="date"` | Không | |
| 5 | Giới tính | `gender` | `type="radio"` | Không | Gồm 2 lựa chọn: Nam (`male`), Nữ (`female`) |

#### Nhóm 2: Đổi mật khẩu
*Tiêu đề `<h2>`: "Bảo mật & Đổi mật khẩu"*

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 11| Mật khẩu hiện tại | `currentPassword` | `type="password"` | Không | |
| 12| Mật khẩu mới | `newPassword` | `type="password"` | Không | minlength = `8` |
| 13| Xác nhận mật khẩu mới | `confirmNewPassword` | `type="password"` | Không | minlength = `8` |

### Cột phải (Column 2)

#### Nhóm 3: Thông tin liên hệ
*Tiêu đề `<h2>`: "Thông tin liên lạc"*

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 6 | Email | `email` | `type="email"` | Không | Đặt thuộc tính `readonly` (chỉ đọc), gán sẵn email mẫu |
| 7 | Số điện thoại | `phone` | `type="tel"` | Không | `pattern="[0-9]{10,11}"` |
| 8 | Địa chỉ | `address` | `type="text"` | Không | placeholder nhập địa chỉ nhà |
| 9 | Tỉnh / Thành phố | `city` | Thẻ `<select>` | Không | 3 thẻ `<option>`: `Hà Nội`, `TP.HCM`, `Đà Nẵng` |
| 10| Website cá nhân | `website` | `type="url"` | Không | placeholder bắt đầu bằng `http://` hoặc `https://` |

#### Nhóm 4: Cài đặt thông báo qua email
*Tiêu đề `<h2>`: "Tùy chọn nhận thông báo"*

| # | Tên trường | Thuộc tính `name` | Loại input | Bắt buộc? | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|-----------|----------------------------|
| 14| Nhận thông báo | `emailNotif` | `type="checkbox"` | Không | mặc định checked sẵn, `value="1"` |
| 15| Giờ gửi báo cáo | `notifTime` | `type="time"` | Không | gán mặc định `value="08:00"` |
| 16| Tần suất báo cáo | `notifFreq` | `type="range"` | Không | min=`1` max=`7` mặc định `value="3"`. Bổ sung hiển thị số ngày bằng thẻ `<output>` hoặc JS |

### Các trường ẩn & Nút gửi (Bố cục chung)

| # | Tên trường | Thuộc tính `name` | Loại input | Ghi chú / Yêu cầu đặc biệt |
|---|-----------|-------------------|------------|----------------------------|
| 17| Loại form | `formType` | `type="hidden"` | mặc định `value="settings"` |
| 18| Mã định danh | `userId` | `type="hidden"` | mặc định `value="12345"` |

### Yêu cầu đặc biệt về Giao diện & Bố cục
- **Bố cục CSS**: Cần có container sử dụng CSS Grid hoặc Flexbox chia thành 2 cột hiển thị cân đối trên màn hình Desktop: cột trái chứa nhóm 1 & 2; cột phải chứa nhóm 3 & 4.
- **Truyền tải file**: Do form có trường tải file ảnh đại diện (`avatar`), bạn bắt buộc phải bổ sung thuộc tính **`enctype="multipart/form-data"`** vào thẻ `<form>`.
- **Hệ thống nút bấm**: 
  - Đặt phía dưới cùng của form, gồm 2 nút: **Hoàn Tác** (`type="reset"`) và **Lưu Thay Đổi** (`type="submit"`) xếp ngang hàng.
