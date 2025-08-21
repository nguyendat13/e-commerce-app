// @ts-nocheck
// không để expo-router hiểu nhầm là route


import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosResponse } from 'axios';
// let API_URL = "http://localhost:8080/api";
let API_URL = "http://10.196.85.41:8080/api";


async function getToken() {
    return await AsyncStorage.getItem('jwt-token');
}
const overlayKey = (cartId: string | number) => `cart-qty-overlay:${cartId}`;

export async function callApi(endpoint: string, method: string, data: any = null): Promise<AxiosResponse<any>> {
    const token = await getToken();

    return axios({
        method,
        url: `${API_URL}/${endpoint}`,
        data,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '', // Include token if available
        }
    });
}

export const GET_ALL_PAGE = (
  resource: string,
  page = 0,
  size = 10,
  sortBy = 'id',
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  const url = `public/${resource}?pageNumber=${page}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
  return callApi(url, 'GET');
};


export function GET_PAGE(endpoint: string, page: number = 0, size: number = 10, categoryId: string | null = null): Promise<AxiosResponse<any>> {
    let url = `${endpoint}?page=${page}&size=${size}`;
    if (categoryId !== null) {
        url += `&categoryId=${categoryId}`;
    }
    return callApi(url, "GET");
}

export function GET_ID(endpoint: string, id: string | number): Promise<AxiosResponse<any>> {
    return callApi(`${endpoint}/${id}`, "GET");
}

export function POST_ADD(endpoint: string, data: any): Promise<AxiosResponse<any>> {
    return callApi(endpoint, "POST", data);
}

export function PUT_EDIT(endpoint: string, data: any): Promise<AxiosResponse<any>> {
    return callApi(endpoint, "PUT", data);
}

export function DELETE_ID(endpoint: string, id: string | number): Promise<AxiosResponse<any>> {
    return callApi(`${endpoint}/${id}`, "DELETE");
}

export function GET_IMG(endpoint: string, imgName: string): string {
    // http://localhost:8080/api/public/products/image/bcff5da9-7714-45eb-99b5-625ca8835341.png
    return `${API_URL}/public/${endpoint}/image/${imgName}`;
}
export async function POST_REGISTER(userData: {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  address: {
    street: string;
    buildingName: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}): Promise<boolean> {
  try {
    const requestBody = {
      userId: 0, // mặc định
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobileNumber: userData.mobileNumber,
      email: userData.email,
      password: userData.password,
      roles: [
        {
          roleId: 102,
          roleName: "USER"
        }
      ],
      address: {
        addressId: 0, // mặc định
        street: userData.address.street,
        buildingName: userData.address.buildingName,
        city: userData.address.city,
        state: userData.address.state,
        country: userData.address.country,
        pincode: userData.address.pincode
      }
    };

    const response = await axios.post(`${API_URL}/register`, requestBody);

    if (response.status === 200 || response.status === 201) {
      console.log("Đăng ký thành công:", response.data);
      return true;
    } else {
      console.warn("Đăng ký thất bại với status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return false;
  }
}

// export async function POST_LOGIN(email: string, password: string): Promise<string | null> {
//     try {
//         const response = await axios.post(`${API_URL}/login`, { email, password });
//         const token = response.data["jwt-token"];

//         if (token) {
//             await AsyncStorage.setItem("jwt-token", token);
//             await AsyncStorage.setItem("user-email", email);

//             const userResponse = await GET_ID(`public/users/email`, encodeURIComponent(email));
//             const cartId = userResponse.data.cart.cartId;
//             await AsyncStorage.setItem("cart-id", String(cartId));

//             return token; // ✅ Trả về token thay vì true
//         } else {
//             return null;
//         }
//     } catch (error) {
//         console.error("Login error:", error);
//         return null;
//     }
// }
export async function POST_LOGIN(email: string, password: string): Promise<string | null> {
  try {
    // 👉 Chỉ gọi backend để login
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const token = response.data["jwt-token"];

    if (token) {
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("user-email", email);

      // Lấy user info (kèm cartId)
      const userResponse = await GET_ID(`public/users/email`, encodeURIComponent(email));
      const cartId = userResponse.data.cart?.cartId;
      if (cartId) {
        await AsyncStorage.setItem("cart-id", String(cartId));
      }

      return token;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    return null;
  }
}


export  async function handleLogout(navigation: any): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['jwt-token', 'user-email', 'cart-id']);
    console.log("✅ Đã đăng xuất và xóa dữ liệu người dùng.");

  } catch (error) {
    console.error("❌ Lỗi khi đăng xuất:", error);
  }
}

export function GET_PRODUCTS_BY_CATEGORY(categoryId: number, page = 0, size = 10): Promise<AxiosResponse<any>> {
  const url = `public/categories/${categoryId}/products?pageNumber=${page}&pageSize=${size}&sortBy=productId&sortOrder=asc`;
  return callApi(url, "GET");
}


//CART 
export function UPDATE_PRODUCT_QUANTITY(cartId: number, productId: number, quantity: number): Promise<AxiosResponse<any>> {
  const url = `public/carts/${cartId}/products/${productId}/quantity/${quantity}`;
  return callApi(url, 'PUT');
}
export function REMOVE_PRODUCT_FROM_CART(cartId: number, productId: number): Promise<AxiosResponse<any>> {
  const url = `public/carts/${cartId}/product/${productId}`;
  return callApi(url, 'DELETE');
}
export function GET_CART_BY_USER_EMAIL_AND_ID(email: string, cartId: number): Promise<AxiosResponse<any>> {
  const encodedEmail = encodeURIComponent(email);
  const url = `public/users/${encodedEmail}/carts/${cartId}`;
  return callApi(url, 'GET');
}
export function ADD_TO_CART(cartId: number, productId: number, quantity: number): Promise<AxiosResponse<any>> {
  const url = `public/carts/${cartId}/products/${productId}/quantity/${quantity}`;
  return callApi(url, 'POST', {}); // gửi rỗng nếu backend yêu cầu body
}

// Create order from cart
export async function createOrder(
  email: string,
  cartId: string | number,
  paymentMethod: string
) {
  const path = `public/users/${encodeURIComponent(
    email
  )}/carts/${cartId}/payments/${encodeURIComponent(paymentMethod)}/order`;
  return callApi(path, "POST").then((r) => r.data);
}

export async function getCartQtyOverlay(
  cartId: string | number
): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(overlayKey(cartId));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export async function setCartQtyOverlay(
  cartId: string | number,
  overlay: Record<string, number>
) {
  await AsyncStorage.setItem(overlayKey(cartId), JSON.stringify(overlay));
}

export async function updateCartItem(
  cartId: string | number,
  productId: string | number,
  quantity: number
) {
  return callApi(
    `public/carts/${cartId}/products/${productId}/quantity/${quantity}`,
    "PUT"
  ).then((r) => r.data);
}

export async function removeCartItem(
  cartId: string | number,
  productId: string | number
) {
  // Swagger shows DELETE path uses singular 'product'
  return callApi(`public/carts/${cartId}/product/${productId}`, "DELETE").then(
    (r) => r.data
  );
}
export async function getCartByEmailAndId(
  email: string,
  cartId: string | number
) {
  return callApi(
    `public/users/${encodeURIComponent(email)}/carts/${cartId}`,
    "GET"
  ).then((r) => r.data);
}
