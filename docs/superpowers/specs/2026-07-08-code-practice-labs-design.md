# Thiết kế: CSS Lab & JS Lab (code-practice) + trang tạo đề

## Bối cảnh

`/practice` hiện tại đã có một tính năng khác (form HTML nộp bài + API CRUD, đọc từ `assets/practice/*/content.md`). Tính năng mới này là một hệ thống độc lập, không đụng tới code cũ:

- `/practice/css-lab` — thực hành CSS
- `/practice/js-lab` — thực hành JS
- `/mod/create-practice-test` — trang nội bộ (truy cập bằng gõ tay URL, không có link trong menu) để tạo JSON đề bài, người dùng tự copy JSON dán vào `assets/code-practice/`.

Hai lab (CSS, JS) dùng chung component, chỉ khác tham số `mode`.

## Nguồn dữ liệu

`assets/code-practice/<lab-id>.json` — mỗi file là **1 bộ đề** (problem set). Ví dụ demo: `assets/code-practice/css-lab-demo.json`, `assets/code-practice/js-lab-demo.json`, mỗi file có 3 câu.

Route `/practice/css-lab` đọc tất cả file JSON trong thư mục có `mode: "css"`; `/practice/js-lab` đọc các file có `mode: "js"`. (Cho phép về sau thêm nhiều bộ đề mà không phải sửa code.)

### Schema JSON

```jsonc
{
  "id": "css-lab-demo",
  "mode": "css",              // "css" | "js" — quyết định lab nào hiển thị bộ đề này
  "title": "Thực hành CSS cơ bản",
  "description": "Bộ 3 bài luyện chọn selector và layout CSS.",
  "questions": [
    {
      "id": "q1",
      "title": "Đổi màu chữ tiêu đề",
      "description": "Viết một CSS selector để đổi màu chữ của thẻ có id `title` thành màu đỏ (#ff0000).",
      "points": 10,
      "files": {
        "html": "<h1 id=\"title\">Xin chào</h1>",
        "css": "",
        "js": ""
      },
      "editable": "css",
      "starter": "/* Viết CSS của bạn ở đây */\n",
      "checker": "const el = doc.getElementById('title'); if (!el) return {pass:false,message:'Không tìm thấy #title'}; const color = win.getComputedStyle(el).color; if (color === 'rgb(255, 0, 0)') return {pass:true,message:'Chính xác!'}; return {pass:false,message:'Màu chữ chưa đúng (#ff0000)'};"
    }
  ]
}
```

Ràng buộc:
- `files.html` bắt buộc có (tối thiểu). `files.css`/`files.js` có thể rỗng.
- `editable` phải khớp `mode` của bộ đề (css-lab chỉ chấp nhận `editable: "css"`, js-lab chỉ chấp nhận `editable: "js"`) — nếu sai, bỏ qua câu đó và log cảnh báo server side.
- `checker` là **thân hàm JS** (không phải cả hàm), được bọc bằng `new Function("doc", "win", "code", checkerBody)`. Trả về `{ pass: boolean, message: string }`. Được chạy trong try/catch — lỗi runtime = `{pass:false, message:"Checker lỗi: ..."}`.

## Kiến trúc trang Lab

```
app/practice/css-lab/page.tsx        (server: đọc JSON từ assets/code-practice, mode=css)
app/practice/js-lab/page.tsx         (server: đọc JSON từ assets/code-practice, mode=js)
app/practice/_components/lab/
  LabClient.tsx        - state: bộ đề đang chọn, câu đang chọn, code hiện tại, kết quả checker
  QuestionListPanel.tsx - danh sách bộ đề + câu hỏi (mô tả markdown, điểm, badge Pass/Fail)
  EditorPreviewPanel.tsx - nửa trái: PreviewFrame (trên) + CodeEditor (dưới), resizable dọc
  PreviewFrame.tsx     - dựng srcDoc từ files+code hiện tại, expose onLoad để chạy checker
  CodeEditor.tsx        - wrapper CodeMirror 6 (lang css hoặc javascript theo mode)
app/practice/preview/page.tsx         - trang xem preview full màn hình (đọc localStorage theo ?key=)
app/api/... : KHÔNG cần API route mới — mọi thứ đọc file lúc build/request qua fs (giống app/practice/page.tsx hiện có), chấm điểm hoàn toàn client-side.
```

Layout: `react-resizable-panels` chia ngang 2 cột (trái 60% / phải 40%, resizable), cột trái chia dọc 2 phần (preview trên, editor dưới, cũng resizable).

## Cơ chế chấm điểm realtime

1. Người gõ trong CodeEditor → `onChange` cập nhật state `code` ngay (để UI mượt) nhưng việc build preview + chạy checker được debounce 500ms.
2. Sau debounce: ghép `files.html/css/js` với `code` hiện tại (thay thế phần ứng với `editable`) thành 1 HTML document đầy đủ, gán vào `iframe.srcDoc`.
3. iframe dùng `sandbox="allow-scripts allow-same-origin"` (chấp nhận rủi ro tối thiểu vì đây là công cụ luyện tập nội bộ, không phải nền tảng đa người dùng public) — cho phép JS chạy và cho phép truy cập `contentDocument`/`contentWindow` từ parent.
4. `iframe.onLoad` → chạy `checker(doc, win, code)` → cập nhật badge Pass/Fail + điểm câu hỏi trong `QuestionListPanel`.
5. Kết quả (`pass` + `code` đã gõ) lưu vào `localStorage` theo key `practice:<setId>:<questionId>` để giữ tiến độ khi tải lại trang.

## Nút "Mở tab mới xem to hơn"

- Khi bấm: lưu object `{html, css, js}` (bản build hiện tại, đã ghép `editable`) vào `localStorage["practice-preview:" + setId + ":" + questionId]`.
- Mở `window.open("/practice/preview?key=practice-preview:<setId>:<questionId>")`.
- `app/practice/preview/page.tsx` (client component) đọc `key` từ query string, lấy JSON từ `localStorage`, dựng iframe full-viewport hiển thị kết quả — không chấm điểm ở trang này, chỉ xem to.

## Trang `/mod/create-practice-test`

- `app/mod/create-practice-test/page.tsx` — client component, không liên quan lab reader.
- Form: tiêu đề bộ đề, mô tả, mode (css/js), rồi danh sách câu hỏi có thể Thêm/Xóa — mỗi câu: title, description, points, html/css/js context, `editable` (khoá theo mode), starter code, checker body (textarea).
- Nút "Xuất JSON": render JSON theo schema ở trên vào một khối `<pre>` + nút Copy vào clipboard. Không ghi file, không gọi API — người dùng tự tải/copy rồi dán vào `assets/code-practice/`.
- Trang không có link điều hướng từ menu/navbar — chỉ truy cập bằng gõ URL trực tiếp.

## Dữ liệu demo

Tạo 2 file, mỗi file 3 câu:
- `assets/code-practice/css-lab-demo.json` (mode css): (1) đổi màu chữ qua selector id, (2) dùng class để bôi nền, (3) dùng flexbox để căn giữa các phần tử `.item` trong `.container` (checker kiểm `getComputedStyle(container).display === 'flex'` và `justifyContent`/`alignItems` phù hợp).
- `assets/code-practice/js-lab-demo.json` (mode js): (1) viết hàm đổi text một phần tử khi load, (2) bắt sự kiện click nút để tăng biến đếm hiển thị, (3) dùng `Array.prototype.filter/map` để lọc & render danh sách từ mảng cho trước (kiểm DOM con `.list-item` sau khi chạy).

## Thư viện thêm mới

`@uiw/react-codemirror`, `@codemirror/lang-css`, `@codemirror/lang-javascript`, `@codemirror/lang-html` (dùng chung cho phần preview không editable hiển thị read-only nếu cần).

## Ngoài phạm vi (out of scope)

- Không có backend lưu điểm theo user/tài khoản — chỉ localStorage trình duyệt.
- Không kiểm tra hợp lệ JSON khi server đọc ngoài try/catch bỏ qua file lỗi (giống pattern `app/practice/page.tsx` hiện tại).
- `/mod/create-practice-test` không ghi trực tiếp vào `assets/code-practice` (an toàn, tránh ghi file từ input người dùng không kiểm soát).
