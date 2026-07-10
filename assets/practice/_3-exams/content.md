# Bài 3: Xây dựng ứng dụng trắc nghiệm (Quiz App) qua API

Bài thực hành này yêu cầu bạn sử dụng JavaScript và các API đề thi của hệ thống để xây dựng một ứng dụng trắc nghiệm trực tuyến hoàn chỉnh, cho phép người dùng lựa chọn đề thi, làm bài thi có tính giờ, và xem kết quả giải thích chi tiết sau khi nộp bài.

---

## Các yêu cầu chức năng của ứng dụng trắc nghiệm (`quiz.html`)

Ứng dụng trắc nghiệm của bạn cần triển khai 3 phân cảnh (hoặc 3 màn hình giao diện) chính sau:

### 1. Màn hình chọn đề thi (Home Screen)
- Gửi yêu cầu `GET /api/exams` để lấy danh sách tất cả đề thi hiện có trên hệ thống.
- Hiển thị danh sách đề thi dưới dạng các thẻ (cards). Trên mỗi thẻ hiển thị rõ:
  - **Tiêu đề đề thi** (`title`)
  - **Mô tả ngắn** (`description`)
  - **Thời gian làm bài** (`duration` - tính bằng phút)
  - **Số lượng câu hỏi** (`questionCount`)
- Có nút **"Bắt đầu làm bài"** cho từng đề thi. Khi click, chuyển người dùng sang màn hình làm bài thi.

### 2. Màn hình làm bài thi (Quiz Screen)
- Gửi yêu cầu `GET /api/exams/[id]` (với `[id]` là mã đề thi đã chọn, ví dụ: `test-1.1`) để tải dữ liệu chi tiết của bài thi bao gồm danh sách câu hỏi.
- Giao diện làm bài thi cần có:
  - **Thời gian đếm ngược (Countdown Timer)**: Tính giờ từ thời gian giới hạn của đề thi. Ví dụ đề thi `30` phút thì đếm ngược từ `30:00` về `00:00`. Khi thời gian đếm ngược kết thúc, ứng dụng tự động thực hiện nộp bài.
  - **Danh sách câu hỏi**: Hiển thị nội dung câu hỏi (hỗ trợ hiển thị ảnh nếu câu hỏi có chứa đường dẫn ảnh trong mảng `images`) và các phương án lựa chọn dưới dạng các nút radio hoặc checkbox (đối với câu hỏi có nhiều đáp án).
  - Nút **"Nộp bài"** (Submit) để kết thúc bài thi chủ động.

### 3. Màn hình kết quả làm bài (Result Screen)
Khi nộp bài thi (hoặc khi hết giờ làm bài), ứng dụng tự động chấm điểm và hiển thị kết quả:
- **Thông tin tổng quan**: Hiển thị số lượng câu trả lời đúng, số câu sai, điểm số (ví dụ trên thang điểm 10) và thời gian hoàn thành bài thi.
- **Xem lại đáp án (Review)**: Hiển thị lại toàn bộ danh sách câu hỏi đã làm, đánh dấu rõ:
  - Phương án người dùng đã chọn.
  - Đáp án đúng của hệ thống (so khớp với trường `answer` nhận về từ API).
  - Phân biệt màu sắc trực quan (Xanh lá cho câu trả lời đúng, Đỏ cho câu trả lời sai).
  - Hiển thị nội dung giải thích chi tiết câu hỏi (`explanation` có sẵn trong dữ liệu câu hỏi từ API) để người học tự ôn tập lại kiến thức.

---

## Hướng dẫn kết nối API & Cổng Endpoint

Hệ thống cung cấp sẵn các endpoint API phục vụ cho đề thi tại địa chỉ:
- Lấy danh sách đề thi: `http://localhost:3000/api/exams`
- Chi tiết câu hỏi đề thi: `http://localhost:3000/api/exams/[id]` (ví dụ: `test-1.1`, `test-1.2`, `test-1.3`)

### Tài liệu Đặc tả API tích hợp
Bạn có thể tham khảo bảng **Tài liệu Hướng dẫn gọi API** được tích hợp ngay phía dưới màn hình này để xem cấu trúc JSON trả về chi tiết của từng API để phục vụ lập trình ứng dụng!
