// types.ts
export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
  Home: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  Payment: { paymentUrl: string }; // paymentUrl sẽ lấy từ route.params
  ChangePassword: undefined;
  OrderSuccess: { txnRef?: string; amount?: string }; // 👈 cần khai báo đúng
  MyOrders: undefined; 
  VNPayWebView: { paymentUrl: string };
};
