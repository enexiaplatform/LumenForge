# Hướng Dẫn Cấu Hình Backend & Cổng Thanh Toán LumenForge

Hệ thống LumenForge hỗ trợ hai phương thức triển khai Backend cho thanh toán thương mại:
1. **Vercel Serverless Functions** (Dành cho việc deploy ứng dụng web trọn gói trên Vercel)
2. **Supabase Edge Functions** (Dành cho kiến trúc Serverless phi tập trung trực tiếp trên Supabase)

Dưới đây là hướng dẫn chi tiết cách cấu hình biến môi trường và triển khai cho từng cổng thanh toán (PayOS & Stripe).

---

## 1. Triển khai trên Vercel (Vercel Serverless Functions)

### Bước 1: Cấu hình biến môi trường (Environment Variables) trên Vercel Dashboard
Vào **Settings** -> **Environment Variables** trong dự án Vercel của bạn và thêm các biến sau:

**Cấu hình Database (Supabase):**
- `SUPABASE_URL`: URL dự án Supabase của bạn (VD: `https://xxxxxx.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Secret Key (Dùng để ghi đè RLS an toàn khi ghi nhận đơn hàng - *Tuyệt đối không để lộ ở client*).

**Cấu hình Cổng Thanh Toán (PayOS hoặc Stripe):**
- `LIVE_GATEWAY_PROVIDER`: Đặt là `payos` hoặc `stripe` tùy thuộc cổng thanh toán chính của bạn.

**Nếu dùng PayOS:**
- `PAYOS_CLIENT_ID`: Client ID từ kênh tích hợp PayOS.
- `PAYOS_API_KEY`: API Key từ PayOS.
- `PAYOS_CHECKSUM_KEY`: Checksum Key dùng để mã hóa chữ ký giao dịch.

**Nếu dùng Stripe:**
- `STRIPE_SECRET_KEY`: Secret Key của bạn từ Stripe Dashboard (VD: `sk_live_...` hoặc `sk_test_...`).
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret dùng để xác thực gói tin webhook (VD: `whsec_...`).

### Bước 2: Thiết lập Webhook trên Vercel
Sau khi dự án được deploy lên Vercel, hãy copy URL ứng dụng (VD: `https://lumenforge.vercel.app`) và cấu hình đường dẫn Webhook trong Dashboard nhà phát triển tương ứng:
- **PayOS**: Đặt địa chỉ Webhook thành: `https://lumenforge.vercel.app/api/payos-webhook`
- **Stripe**: Đặt địa chỉ Webhook thành: `https://lumenforge.vercel.app/api/stripe-webhook` (lắng nghe sự kiện `checkout.session.completed`).

---

## 2. Triển khai trên Supabase (Supabase Edge Functions)

Nếu bạn không muốn chạy API trên Vercel, LumenForge đã tích hợp sẵn 3 Edge Functions trong thư mục `supabase/functions`:
- `checkout`: Khởi tạo phiên thanh toán (PayOS / Stripe).
- `payos-webhook`: Xử lý tín hiệu thanh toán thành công từ PayOS.
- `stripe-webhook`: Xử lý tín hiệu thanh toán thành công từ Stripe.

### Bước 1: Cấu hình biến môi trường trên Supabase CLI
Chạy các lệnh sau trong terminal cục bộ của bạn để đưa các biến bảo mật lên Supabase Secret Manager:

```bash
# Đối với PayOS:
supabase secrets set PAYOS_CLIENT_ID="your_client_id"
supabase secrets set PAYOS_API_KEY="your_api_key"
supabase secrets set PAYOS_CHECKSUM_KEY="your_checksum_key"

# Đối với Stripe:
supabase secrets set STRIPE_SECRET_KEY="sk_live_..."
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..."

# Cấu hình cổng mặc định cho Edge Function checkout (payos hoặc stripe):
supabase secrets set LIVE_GATEWAY_PROVIDER="payos"
```

### Bước 2: Deploy Edge Functions lên Cloud
Chạy lệnh CLI sau từ thư mục gốc dự án:

```bash
supabase functions deploy checkout
supabase functions deploy payos-webhook
supabase functions deploy stripe-webhook
```

### Bước 3: Cấu hình Webhook URL
- **PayOS**: Đặt địa chỉ Webhook nhận tin thành:
  `https://<project-ref>.supabase.co/functions/v1/payos-webhook`
- **Stripe**: Đặt địa chỉ Webhook trong Stripe Dashboard thành:
  `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` (Lắng nghe sự kiện `checkout.session.completed`).

---

## 3. Cấu hình Cổng Client (Dành cho Creator testing)
Để chuyển đổi linh hoạt giữa các cổng và môi trường test/live, bạn có thể click vào **Indicator trạng thái Database** ở góc dưới bên trái màn hình ứng dụng để mở **Bảng Cấu Hình Modals**:
1. Chọn cổng thanh toán mong muốn (VietQR thủ công, PayOS hoặc Stripe).
2. Nhập URL API checkout tùy chỉnh (nếu dùng Edge Function, nhập `https://<project-ref>.supabase.co/functions/v1/checkout`).
3. Nhập Supabase URL & Anon Key để kết nối Real Database.
