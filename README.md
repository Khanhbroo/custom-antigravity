# Custom Antigravity 2.0

Bộ tùy biến giao diện cho **Antigravity 2.0** (Desktop App + IDE):
- **Font:** `JetBrains Mono` (`14px`), tối ưu CSS dùng kế thừa tự nhiên (không dùng `*` selector để tránh lag khi chat dài).
- **Smooth Caret Animation:** Con trỏ lướt mượt (`translate3d` trên GPU), nhấp nháy kiểu `expand` (`scaleY`), tự lấy màu `caret-color` hiện tại, hỗ trợ paste đoạn dài & scroll.
- **Tương thích:** Chạy cùng mod nền sao `ascii-wallpapers` và tự động tạo backup `app.asar.font-backup`.

---

## Cài đặt nhanh trên máy mới

### Yêu cầu
- Đã cài font **JetBrains Mono** trên hệ điều hành (`~/Library/Fonts` trên macOS hoặc Fonts trên Windows).
- Đã cài **Node.js** (v18+).

### Các bước áp dụng cho Antigravity 2.0 App
```bash
git clone https://github.com/Khanhbroo/custom-antigravity.git
cd custom-antigravity
npm install
npm run apply
```
Sau khi chạy xong, thoát hẳn Antigravity (`Cmd + Q` trên macOS) rồi mở lại.

> Nếu `app.asar` nằm ở đường dẫn khác mặc định, truyền thêm `AGY_ASAR_PATH=/path/to/app.asar npm run apply`.

### Gỡ bỏ (Revert về bản trước khi patch)
```bash
npm run revert
```

### Tùy chỉnh CSS / Font
- Sửa file `~/.antigravity-custom-font.css` (hoặc `custom-font.css` trong repo nếu chưa có file ở home), sau đó chạy lại `npm run apply` và khởi động lại app.

---

## Cấu hình cho Antigravity IDE (`settings.json`)
File [ide-settings.json](./ide-settings.json) chứa các thiết lập chuẩn cho phần IDE (Editor & Terminal dùng `JetBrains Mono`, `cursorSmoothCaretAnimation: "on"`, `cursorBlinking: "expand"`, `animations.UseCursorColorForCursorAnimation: true`). Anh chỉ cần copy nội dung trong file này dán vào `User/settings.json` của Antigravity IDE trên máy mới.
