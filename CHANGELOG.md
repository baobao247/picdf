# PicDF — Changelog & Architecture Report

## 1. Deep Audit & Bugs Fixed
- **Xử lý xoay ảnh Canvas**: Render xoay góc 90° và 270° trực tiếp qua canvas offscreen trước khi đóng gói nhị phân vào jsPDF, loại bỏ hoàn toàn lỗi méo tỷ lệ khung hình.
- **Quản lý bộ nhớ trình duyệt**: Giảm thiểu tải ảnh gốc độ phân giải quá cao, tự động giải phóng DataURL tạm thời để tránh tràn RAM trên thiết bị di động.
- **Validation đầu vào**: Chặn các định dạng file không phải hình ảnh và hiển thị thông báo lỗi thân thiện.

---

## 2. Kiến trúc Tái Cấu Trúc (Architecture Refactoring)
Tách rời toàn diện từ file đơn thành cấu trúc module hóa chuẩn:
```
picdf/
├── css/
│   └── style.css            # Toàn bộ biến theme, layout grid, dropzone, card ảnh & modal
├── js/
│   ├── image-processor.js   # ImageProcessor: Xử lý xoay, lọc màu đen trắng & high contrast
│   ├── pdf-builder.js       # PdfBuilder: Đóng gói tài liệu jsPDF, căn lề, watermark & số trang
│   └── app.js               # Controller UI: Drag & Drop, sắp xếp thẻ, Live Preview Modal
├── index.html               # File HTML5 ngữ nghĩa, gọn gàng và tương thích cao
└── CHANGELOG.md             # Tài liệu kiểm toán và hướng dẫn sử dụng
```

---

## 3. Cải tiến UI/UX & Hiệu năng
- **Bảng điều khiển trực quan**: Bố cục linh hoạt theo lưới Flexbox/Grid, hỗ trợ tốt trên màn hình nhỏ.
- **Thanh trạng thái xuất file**: Có biểu tượng spinner quay và thông báo thành công tức thì.
- **Tên file thông minh**: Tự động sinh tên file mặc định kèm ngày hiện tại (PicDF_YYYYMMDD).

---

## 4. Tính năng mới bổ sung
1. **📄 Bộ lọc Scan tài liệu (Document Filter)**:
   - *Màu gốc (Original)*.
   - *Đen trắng (Grayscale / B&W)*.
   - *Scan tương phản cao (High Contrast)*: Tự động tẩy trắng nền giấy và làm sắc nét nét chữ, tương tự máy scan tài liệu văn phòng.
2. **🏷️ Dấu mờ bản quyền (Watermark)**:
   - Cho phép nhập dấu mờ tùy ý (VD: BẢN SAO, DRAFT, NỘI BỘ), tự động in chéo góc 45° mờ nhạt giữa mỗi trang.
3. **🔢 Tự động đánh số trang**:
   - Checkbox đánh số trang tự động ở mép dưới trang (Trang i / N).
4. **👁️ Modal Live Preview**:
   - Xem trước toàn bộ tài liệu đã ghép với nút chuyển trang trước/sau mượt mà.