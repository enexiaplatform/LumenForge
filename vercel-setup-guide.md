# Cấu hình Backend LumenForge trên Vercel

Hệ thống LumenForge sử dụng hai dịch vụ bên thứ ba cho Backend:
1. **Supabase**: Quản lý Authentication (Đăng nhập/Đăng ký) và Database (Lưu trữ khóa học đã mua).
2. **PayOS**: Cổng thanh toán quét mã VietQR tự động.

Để hệ thống hoạt động trên Vercel, bạn cần cấu hình các biến môi trường (Environment Variables) này.

## Cách 1: Thiết lập qua Vercel Dashboard (Dễ nhất)

1. Đăng nhập vào [Vercel](https://vercel.com/) và chọn project `lumenforge`.
2. Chuyển sang tab **Settings** -> **Environment Variables**.
3. Thêm các biến sau (lấy từ tài khoản Supabase và PayOS của bạn):

**Supabase Variables:**
- `SUPABASE_URL`: (VD: `https://xxxxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY`: (Secret key dùng cho các lệnh admin - *Tuyệt đối không cấp quyền public*)

**PayOS Variables:**
- `PAYOS_CLIENT_ID`: Client ID của project trên PayOS.
- `PAYOS_API_KEY`: API Key bảo mật.
- `PAYOS_CHECKSUM_KEY`: Checksum key dùng để verify webhook.

4. Nhấn **Save** và thực hiện **Redeploy** project để các biến có hiệu lực.

## Cách 2: Thiết lập qua Vercel CLI

Nếu bạn đã cài Vercel CLI trên máy (`npm i -g vercel`), bạn có thể chạy các lệnh sau trong terminal:

```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add PAYOS_CLIENT_ID
vercel env add PAYOS_API_KEY
vercel env add PAYOS_CHECKSUM_KEY
```
CLI sẽ hỏi bạn muốn áp dụng cho môi trường nào (Development, Preview, Production). Hãy chọn tất cả (hoặc phím Space để chọn/bỏ chọn, Enter để xác nhận).

---

## Lưu ý về Webhook PayOS
Sau khi deploy, bạn cần copy URL gốc của ứng dụng trên Vercel (VD: `https://lumenforge.vercel.app`) và vào màn hình quản lý PayOS để cài đặt Webhook URL thành:
`https://lumenforge.vercel.app/api/payos-webhook`

Điều này đảm bảo khi khách hàng quét mã QR chuyển khoản, PayOS sẽ "gọi" về hệ thống LumenForge để tự động mở khóa (unlock) khóa học.
