  const express = require("express");
  const cors = require("cors");
  const app = express();
  const port = 3000;

  const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");
  const axios = require("axios");
  const API_URL = "http://localhost:8080/api";

  // Lưu trữ tạm thông tin order (thay bằng DB trong thực tế)
  const pendingOrders = new Map();

  // Cấu hình CORS
  app.use(cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:3000",
      "exp://10.196.85.41:8081",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));
  app.use(express.json());

  // Lấy totalPrice từ cart API nếu amount không có sẵn
  async function resolveAmount({ amount, email, cartId, token }) {
    const parsed = Number(amount);
    if (!Number.isNaN(parsed) && parsed > 0) return Math.round(parsed);

    if (email && cartId && token) {
      try {
        const url = `${API_URL}/public/users/${encodeURIComponent(email)}/carts/${cartId}`;
        const resp = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        const total = Number(resp?.data?.totalPrice);
        if (!Number.isNaN(total) && total > 0) return Math.round(total);
      } catch (e) {
        console.log("Failed to fetch cart totalPrice:", e.message);
      }
    }

    return 1; // fallback
  }

  // Build VNPay payment URL
  async function buildPaymentUrl(opts = {}) {
    const vnpay = new VNPay({
      tmnCode: "6Y4EG4KX",
      secureSecret: "BXVWWPA41OX70UKRK20AJV872380FFHT",
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const amount = await resolveAmount(opts);
    const txnRef = String(opts.txnRef ?? Date.now());
    const orderInfo = String(opts.orderInfo ?? `Thanh toan don hang ${txnRef}`);
    const ip = String(opts.ip ?? "10.196.85.41");
    const returnUrl = String(opts.returnUrl ?? "http://localhost:3000/api/check-payment-vnpay");
  // const returnUrl = String(
  //   opts.returnUrl ?? "http://localhost:8081/OrderSuccess"
  // );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return vnpay.buildPaymentUrl({
      vnp_Amount: Math.max(1, Math.round(Number(amount))) * 100,
      vnp_IpAddr: ip,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
  }

  // POST create QR
  app.post("/api/create-qr", async (req, res) => {
    try {
      const clientIpRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "10.196.85.41";
      const clientIp = String(clientIpRaw).includes("::1") ? "10.196.85.41" : String(clientIpRaw).split(",")[0].trim();
      const { amount, txnRef, orderInfo, returnUrl, email, cartId, token } = req.body || {};

      if (email && cartId) {
        pendingOrders.set(txnRef, { email, cartId, paymentMethod: "chuyenkhoan", token });
      }

      const url = await buildPaymentUrl({ amount, txnRef, orderInfo, returnUrl, ip: clientIp, email, cartId, token });
      return res.status(200).json({ paymentUrl: url });
    } catch (error) {
      console.error("Error in POST /api/create-qr:", error);
      res.status(500).send("Internal server error");
    }
  });

  // GET create QR
  app.get("/api/create-qr", async (req, res) => {
    try {
      const { amount, txnRef, orderInfo, returnUrl, email, cartId, token } = req.query || {};
      const clientIpRaw = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "10.196.85.41";
      const clientIp = String(clientIpRaw).includes("::1") ? "10.196.85.41" : String(clientIpRaw).split(",")[0].trim();

      if (email && cartId) {
        pendingOrders.set(txnRef, { email, cartId, paymentMethod: "chuyenkhoan", token });
      }

      const url = await buildPaymentUrl({ amount, txnRef, orderInfo, returnUrl, ip: clientIp, email, cartId, token });
      return res.status(200).json({ paymentUrl: url });
    } catch (error) {
      console.error("Error in GET /api/create-qr:", error);
      res.status(500).send("Internal server error");
    }
  });

  // VNPay callback
//   app.get("/api/check-payment-vnpay", async (req, res) => {
//     try {
//       const { vnp_Amount, vnp_ResponseCode, vnp_TxnRef, vnp_TransactionStatus } = req.query;

//       if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
//         const orderInfo = pendingOrders.get(vnp_TxnRef);
//         if (!orderInfo) return res.redirect("http://localhost:8081/orders?payment=error&reason=no_order_info");

//         const { email, cartId, paymentMethod, token } = orderInfo;
//         const orderUrl = `${API_URL}/public/users/${encodeURIComponent(email)}/carts/${cartId}/payments/${encodeURIComponent(paymentMethod)}/order`;

//         await axios.post(orderUrl, {}, {
//           headers: {
//             "Content-Type": "application/json",
//             ...(token && { Authorization: `Bearer ${token}` }),
//           },
//         });

//         // Xóa giỏ hàng
//         await axios.delete(`${API_URL}/public/users/${encodeURIComponent(email)}/carts/${cartId}`).catch(console.log);

//         pendingOrders.delete(vnp_TxnRef);

//       // return res.redirect(`http://localhost:8081/orders?payment=success&amount=${Number(vnp_Amount) / 100}`);
// //       return res.redirect(
// //   `projectandroidnew://OrderSuccess?payment=success&txnRef=${vnp_TxnRef}&amount=${Number(vnp_Amount) / 100}`
// // );
//       return res.redirect(`http://localhost:8081/OrderSuccess`);

//       } else {
//         // return res.redirect(`http://localhost:8081/orders?payment=failed&reason=${vnp_ResponseCode || "unknown"}`);
//      return res.redirect(
//   `projectandroidnew://OrderSuccess?payment=failed&reason=${vnp_ResponseCode || "unknown"}`
// );

//       }
//     } catch (error) {
//       console.error("Error processing payment callback:", error);
//       return res.redirect("http://localhost:8081/orders?payment=error");
//     }
//   });
app.get("/api/check-payment-vnpay", async (req, res) => {
  try {
    const { vnp_Amount, vnp_ResponseCode, vnp_TxnRef, vnp_TransactionStatus } = req.query;

    if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
      const orderInfo = pendingOrders.get(vnp_TxnRef);

      if (!orderInfo) {
        return res.send(`
          <html><body>
            <script>
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: "error",
                reason: "no_order_info"
              }));
            </script>
          </body></html>
        `);
      }

      const { email, cartId, paymentMethod, token } = orderInfo;

      try {
        const orderUrl = `${API_URL}/public/users/${encodeURIComponent(email)}/carts/${cartId}/payments/${encodeURIComponent(paymentMethod)}/order`;

        await axios.post(orderUrl, {}, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        await axios.delete(`${API_URL}/public/users/${encodeURIComponent(email)}/carts/${cartId}`).catch(console.warn);
        pendingOrders.delete(vnp_TxnRef);

        // ✅ Gửi về WebView status success
    return res.send(`
<html>
  <body>
    <script>
      // Gửi status về React Native WebView nếu có
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          status: "success",
          txnRef: "${vnp_TxnRef}",
          amount: ${vnp_Amount / 100}
        }));
      }

      // Redirect về trang chính web Expo ngay lập tức
      if (!window.ReactNativeWebView) {
        window.location.href = 'http://localhost:8081'; // quay về trang chính
      }
    </script>
  </body>
</html>
`);



      } catch (err) {
        return res.send(`
          <html><body>
            <script>
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: "error",
                reason: "order_failed"
              }));
            </script>
          </body></html>
        `);
      }

    } else {
      return res.send(`
        <html><body>
          <script>
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: "failed",
              reason: "${vnp_ResponseCode || 'unknown'}"
            }));
          </script>
        </body></html>
      `);
    }
  } catch (error) {
    return res.send(`
      <html><body>
        <script>
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: "error",
            reason: "server_error"
          }));
        </script>
      </body></html>
    `);
  }
});



  // START SERVER
  app.listen(port, () => {
    console.log(`VNPay service listening on port ${port}`);
  }); 