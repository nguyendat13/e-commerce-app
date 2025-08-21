  import OrderSuccessModal from "@/app/screens/modal/OrderSuccessModal";
import {
  GET_IMG,
  createOrder,
  getCartByEmailAndId,
  removeCartItem,
  setCartQtyOverlay,
  updateCartItem,
} from "@/helpers/services/apiService";
import { RootStackParamList } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { Image } from "expo-image";
import React from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
  type CheckoutScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Checkout"
  >;
  interface CartProduct {
    productId: number;
    productName: string;
    image: string;
    price?: number;
    specialPrice?: number;
    quantity?: number;
    cartQuantity?: number;
  }

  interface CheckoutScreenProps {
    cartItems?: CartProduct[]; // optional
  }

  const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ cartItems }) => {
    const navigation = useNavigation<CheckoutScreenNavigationProp>();
    const [qtyById, setQtyById] = React.useState<Record<number, number>>({});
    const [note, setNote] = React.useState("");
    const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "transfer">("cash");
    const [confirmVisible, setConfirmVisible] = React.useState(false);
    const [orderSuccessVisible, setOrderSuccessVisible] = React.useState(false);
    const [lastOrderId, setLastOrderId] = React.useState<string | null>(null);
    const [isPaying, setIsPaying] = React.useState(false);
    const [cartItemsState, setCartItemsState] = React.useState<CartProduct[]>(cartItems ?? []);

    React.useEffect(() => {
      const loadCart = async () => {
        try {
          const email = await AsyncStorage.getItem("user-email");
          const cartId = await AsyncStorage.getItem("cart-id");
          if (!email || !cartId) return;

          const cart = await getCartByEmailAndId(email, cartId);
          const products: CartProduct[] = cart.products ?? [];
          setCartItemsState(products);

          const initialQty: Record<number, number> = {};
          products.forEach((p) => {
            initialQty[p.productId] = p.quantity ?? 1;
          });
          setQtyById(initialQty);
        } catch (err) {
          console.log("Load cart error:", err);
          Alert.alert("Lỗi", "Không thể load giỏ hàng");
        }
      };
      loadCart();
    }, []);

    const subtotal = React.useMemo(() => {
      return cartItemsState.reduce((sum, p) => {
        const unit = p.specialPrice ?? p.price ?? 0;
        const q = qtyById[p.productId] ?? (p.quantity ?? 1);
        return sum + unit * q;
      }, 0);
    }, [cartItemsState, qtyById]);

    const updateQuantity = async (productId: number, nextQty: number) => {
      setQtyById((prev) => ({ ...prev, [productId]: nextQty }));
      try {
        const cartId = await AsyncStorage.getItem("cart-id");
        if (!cartId) return;
        await updateCartItem(cartId, productId, nextQty);
      } catch {
        Alert.alert("Lỗi", "Không cập nhật được số lượng.");
      }
    };

    const removeItem = async (productId: number) => {
      try {
        const cartId = await AsyncStorage.getItem("cart-id");
        if (!cartId) return;
        await removeCartItem(cartId, productId);
        setQtyById((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      } catch {
        Alert.alert("Lỗi", "Không xóa được sản phẩm.");
      }
    };

    const handleTransferPayment = async () => {
      if (isPaying) return;
      setIsPaying(true);
      try {
        const txnRef = `ORD_${Date.now()}`;
        const email = await AsyncStorage.getItem("user-email");
        const cartId = await AsyncStorage.getItem("cart-id");
        const token = await AsyncStorage.getItem("jwt-token");
        if (!email || !cartId) return;

        const resp = await axios.get("http://localhost:3000/api/create-qr", {
          params: { txnRef, email, cartId, token, paymentMethod: "transfer" },
        });
        const url = resp.data.paymentUrl;
        if (!url) return Alert.alert("Lỗi", "Không tạo được liên kết thanh toán");

        setConfirmVisible(false);
            navigation.navigate("VNPayWebView", { paymentUrl: url });

        // if (Platform.OS === "web") window.open(url, "_blank");
        // else await WebBrowser.openBrowserAsync(url);

//         if (Platform.OS === "web") {
//   window.open(url, "_blank"); // mở sandbox VNPay
// } else {
//   navigation.navigate("VNPayWebView", { paymentUrl: url });
// }

      } catch (err: any) {
        Alert.alert("Lỗi", err?.response?.data?.message || "Không thể tạo URL thanh toán");
      } finally {
        setIsPaying(false);
      }
    };

    const handleCashPayment = async () => {
      try {
        const email = await AsyncStorage.getItem("user-email");
        const cartId = await AsyncStorage.getItem("cart-id");
        if (!email || !cartId) return;

        const order = await createOrder(email, cartId, "cash");
        await setCartQtyOverlay(cartId, {});
        setLastOrderId(order.orderId);
        setConfirmVisible(false);
        setOrderSuccessVisible(true);
      } catch (err: any) {
        Alert.alert("Lỗi", err?.response?.data?.message || "Không thể thanh toán");
      }
    };


    return (
      <SafeAreaView style={styles.container}>
          <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={30} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
  <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home" size={24} />
          </TouchableOpacity>
                    </View>
        

        <SwipeListView
          data={cartItemsState}
          keyExtractor={(item) => String(item.productId)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const q = qtyById[item.productId] ?? 1;
            return (
              <View style={styles.rowFront}>
                <Image source={{ uri: GET_IMG("products", item.image) }} style={styles.productImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <Text style={styles.productPrice}>
                    ${(item.specialPrice ?? item.price ?? 0).toLocaleString()}
                  </Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity onPress={() => updateQuantity(item.productId, Math.max(1, q - 1))}>
                      <Ionicons name="remove" size={20} color="#2E7D32" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{q}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.productId, q + 1)}>
                      <Ionicons name="add" size={20} color="#2E7D32" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeItem(item.productId)} style={{ marginLeft: 20 }}>
                      <Ionicons name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          renderHiddenItem={() => null}
        />

        <View style={styles.summaryContainer}>
          <Text style={styles.label}>Ghi chú:</Text>
          <TextInput style={styles.noteInput} multiline value={note} onChangeText={setNote} placeholder="Nhập ghi chú..." />
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Tổng cộng:</Text>
          <Text style={styles.totalText}>Tổng cộng: {subtotal.toLocaleString('vi-VN')}₫</Text>
          </View>
          <TouchableOpacity style={styles.payButton} onPress={() => setConfirmVisible(true)}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Modal */}
        <Modal transparent visible={confirmVisible} onRequestClose={() => setConfirmVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={{ fontWeight: "700", fontSize: 18 }}>Xác nhận thanh toán</Text>
              <View style={{ flexDirection: "row", marginVertical: 10 }}>
                <Pressable
                  style={[styles.payMethodBtn, paymentMethod === "cash" && styles.payMethodActive]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Text>Tiền mặt</Text>
                </Pressable>
                <Pressable
                  style={[styles.payMethodBtn, paymentMethod === "transfer" && styles.payMethodActive]}
                  onPress={() => setPaymentMethod("transfer")}
                >
                  <Text>Chuyển khoản</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
                <TouchableOpacity onPress={() => setConfirmVisible(false)} style={[styles.modalBtn, { backgroundColor: "#ccc" }]}>
                  <Text>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => paymentMethod === "cash" ? handleCashPayment() : handleTransferPayment()}
                  style={[styles.modalBtn, { backgroundColor: "#2E7D32" }]}
                >
                  <Text style={{ color: "#fff" }}>Thanh toán</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <OrderSuccessModal
          visible={orderSuccessVisible}
          onClose={() => setOrderSuccessVisible(false)}
          onTrackOrder={() => {
            setOrderSuccessVisible(false);
            navigation.navigate("MyOrders");
          }}
        />
      </SafeAreaView>
    );
  };

  export default CheckoutScreen;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
          paddingVertical:50,

      paddingBottom: 50,
      borderBottomWidth: 1,
      borderColor: '#eee',
    },
    headerTitle: {
      fontSize: 25,
      fontWeight: 'bold',

    },
    rowFront: { flexDirection: "row", marginBottom: 10, alignItems: "center", backgroundColor: "#fff", borderRadius: 10, padding: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    productImage: { width: 64, height: 64, borderRadius: 10 },
    productName: { fontSize: 16, fontWeight: "500" },
    productPrice: { fontSize: 14, color: "#333", marginTop: 4 },
    qtyContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
    qtyText: { marginHorizontal: 10 },
    summaryContainer: { padding: 16, borderTopWidth: 1, borderColor: "#eee", backgroundColor: "#fff" },
    label: { fontSize: 14, fontWeight: "500" },
    noteInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 8, marginVertical: 8 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
    totalText: { fontSize: 18, fontWeight: "700" },
    payButton: { backgroundColor: "#070e07", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 10 },
    modalBackdrop: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.35)" },
    modalCard: { width: "85%", backgroundColor: "#fff", borderRadius: 12, padding: 16 },
    payMethodBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
    payMethodActive: { borderColor: "#0d180d", backgroundColor: "#F2F8F2" },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  });


