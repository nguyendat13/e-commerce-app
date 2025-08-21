import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { GET_CART_BY_USER_EMAIL_AND_ID, GET_ID, GET_IMG, REMOVE_PRODUCT_FROM_CART, UPDATE_PRODUCT_QUANTITY } from '../../../helpers/services/apiService';

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

const fetchProductStock = async (productId: number) => {
  try {
    const response = await GET_ID('public/products', productId);
    if (response.status === 200) {
      return response.data.quantity; // giả sử tồn kho nằm ở field này
    }
  } catch (err) {
    console.error("❌ Lỗi khi lấy tồn kho:", err);
  }
  return null;
};
  // Fetch cart data
const fetchCartItems = async () => {
  setLoading(true);
  try {
    const email = await AsyncStorage.getItem('user-email');
    const cartIdStr = await AsyncStorage.getItem('cart-id');

    if (!email || !cartIdStr) {
      Alert.alert('Bạn chưa đăng nhập');
      setCartItems([]);
      return;
    }

    const cartId = parseInt(cartIdStr);
    const response = await GET_CART_BY_USER_EMAIL_AND_ID(email, cartId);

    if (response.status === 200) {
      const items = response.data.products || [];

      // Gọi tồn kho song song
      const itemsWithStock = await Promise.all(
        items.map(async (item: any) => {
          const stock = await fetchProductStock(item.productId);
          return {
            ...item,
            stockQuantity: stock ?? 0, // nếu không có thì cho là 0
          };
        })
      );

      setCartItems(itemsWithStock);
    } else {
      Alert.alert('Không thể lấy giỏ hàng');
    }
  } catch (error) {
    console.error('❌ Lỗi khi lấy giỏ hàng:', error);
    Alert.alert('Đã có lỗi xảy ra khi tải giỏ hàng');
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchCartItems();
  }, []);

const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
  if (newQuantity < 1) return;

  try {
    const cartIdStr = await AsyncStorage.getItem('cart-id');
    if (!cartIdStr) return;
    const cartId = parseInt(cartIdStr);

    // ✅ Gọi API trước
    await UPDATE_PRODUCT_QUANTITY(cartId, productId, newQuantity);

    // ✅ Rồi mới update lại state local nếu API thành công
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  } catch (err) {
    console.error("❌ Lỗi cập nhật:", err);
    Alert.alert("Lỗi", "Không thể cập nhật số lượng.");
  }
};




const handleRemoveProduct = async (productId: number) => {
  try {
    const cartIdStr = await AsyncStorage.getItem('cart-id');
    if (!cartIdStr) return;
    const cartId = parseInt(cartIdStr);

    // Xóa ngay trong state
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));

    // Gọi API xóa
    await REMOVE_PRODUCT_FROM_CART(cartId, productId);
  } catch (err) {
    console.error("❌ Lỗi xoá:", err);
    Alert.alert("Lỗi", "Không thể xoá sản phẩm.");
  }
};


  // Tính tổng tiền
const subtotal = useMemo(() => {
  return cartItems.reduce((sum, item) => {
    if (item.stockQuantity === 0) return sum; // bỏ sản phẩm hết hàng
    const price = item.specialPrice ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
}, [cartItems]);





  // const shipping = 10_000;
  const vat =0;
  const total = subtotal  + vat;

const renderItem = ({ item }: { item: any }) => (
  <View style={styles.rowFront}>
    <Image source={{ uri: GET_IMG("products", item.image) }} style={styles.image} />
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{item.productName}</Text>
      <Text style={styles.price}>
        {(item.specialPrice * item.quantity).toLocaleString('vi-VN')}₫
      </Text>
      <Text style={{ color: '#888', fontSize: 12 }}>
        Tồn kho: {item.stockQuantity}
      </Text>

      {/* Nếu hết hàng thì báo đỏ, còn hàng thì hiển thị nút +/- */}
      <View style={styles.quantityRow}>
        {item.stockQuantity > 0 ? (
          <>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyNumber}>{item.quantity}</Text>

            <TouchableOpacity
              style={[
                styles.qtyButton,
                { backgroundColor: item.quantity >= item.stockQuantity ? '#ccc' : '#ddd' }
              ]}
              onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stockQuantity}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Hết hàng</Text>
        )}
      </View>
    </View>
  </View>
);

  const renderHiddenItem = ({ item }: { item: any }) => (
    <View style={styles.hiddenItem}>
      <TouchableOpacity
        style={styles.hiddenDeleteButton}
        onPress={() => handleRemoveProduct(item.productId)}
      >
        <Text style={styles.hiddenDeleteText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng của tôi</Text>
        <Ionicons name="notifications-outline" size={30} />
      </View>

      {/* Danh sách sản phẩm */}
    <SwipeListView
  data={cartItems}
  keyExtractor={(item) => String(item.cartItemId)}
  renderItem={renderItem}
  renderHiddenItem={renderHiddenItem}
  rightOpenValue={-75} // Vuốt sang trái hiện nút Xóa
  disableRightSwipe
  previewRowKey={cartItems.length > 0 ? String(cartItems[0].cartItemId) : undefined}
  previewOpenValue={-40}
  previewOpenDelay={3000}
/>



      {/* Tóm tắt thanh toán */}
      <View style={styles.summary}>
        <Text>Tạm tính: {subtotal.toLocaleString('vi-VN')}₫</Text>
        {/* <Text>Phí vận chuyển: {shipping.toLocaleString('vi-VN')}₫</Text> */}
        <Text>VAT (10%): {vat.toLocaleString('vi-VN')}₫</Text>
        <Text style={styles.total}>Tổng cộng: {total.toLocaleString('vi-VN')}₫</Text>
      </View>

      {/* Nút thanh toán */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Checkout', { cartItems, total })}
      >
        <Text style={styles.buttonText}>Tiến hành thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  rowFront: {
  backgroundColor: '#f4f4f4',
  borderRadius: 8,
  marginBottom: 12,
  padding: 8,
  flexDirection: 'row',
  alignItems: 'center',
},


  hiddenItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  hiddenDeleteButton: {
    backgroundColor: "#ff4757",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    height: "100%",
    borderRadius: 12,
  },
  hiddenDeleteText: {
    color: "#fff",
    fontWeight: "bold",
  },

   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
        paddingVertical:25,

    paddingBottom: 50,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',

  },

  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 40,
    padding:12
  },
  
  list: {
    flexGrow: 0,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  details: {
    color: '#555',
    marginTop: 4,
  },
  price: {
    marginTop: 6,
    fontWeight: 'bold',
    color: '#333',
  },
  summary: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 12,
    marginTop: 12,
  },
  total: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
    quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyNumber: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 20,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
