import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ADD_TO_CART, GET_IMG } from '../../helpers/services/apiService';

const ProductDetailsScreen = () => {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  useEffect(() => {
    if (route.params?.product) {
      setProduct(route.params.product);
    }
  }, [route.params]);

const handleAddToCart = async () => {
  setLoading(true);

  try {
    const email = await AsyncStorage.getItem('user-email');
    const cartIdStr = await AsyncStorage.getItem('cart-id');

    if (!email || !cartIdStr) {
      Alert.alert('Thông báo', '❌ Bạn chưa đăng nhập');
      return;
    }

    const cartId = parseInt(cartIdStr);

    // Kiểm tra dữ liệu sản phẩm
    if (!product || !product.productId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm');
      return;
    }

    await ADD_TO_CART(cartId, product.productId, quantity);

    Alert.alert('✅ Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
  } catch (error: any) {
    console.error('❌ Lỗi khi thêm vào giỏ:', error);

    // Nếu lỗi từ backend có message
    if (error?.response?.data?.message) {
      Alert.alert('❌ Lỗi', error.response.data.message);
    } else {
      Alert.alert('❌ Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
    }
  } finally {
    setLoading(false);
  }
};
  

  if (!product) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} />
        </TouchableOpacity>
      </View>

      {/* Hình ảnh */}
      <Image
        source={{ uri: GET_IMG('products', product.image) }}
        style={styles.image}
      />

      {/* Biểu tượng yêu thích */}
      <TouchableOpacity style={styles.heartIcon}>
        <FontAwesome name="heart-o" size={24} color="#000" />
      </TouchableOpacity>

      {/* Thông tin chi tiết */}
      <View style={styles.details}>
        <Text style={styles.name}>{product.productName}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>
            <Text style={{ color: '#f6c200' }}>★</Text> 4.0/5
          </Text>
          <Text style={styles.reviews}>(45 đánh giá)</Text>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        {/* Số lượng */}
       <View style={styles.quantityContainer}>
        <Text style={styles.sectionTitle}>Số lượng trong kho: {product.quantity}</Text>
      </View> 


        {/* Chọn kích cỡ */}
        <Text style={styles.sectionTitle}>Chọn kích cỡ</Text>
        <View style={styles.sizeRow}>
          {['S', 'M', 'L'].map((size) => (
            <Pressable
              key={size}
              style={[
                styles.sizeBox,
                selectedSize === size && styles.selectedSizeBox,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === size && styles.selectedSizeText,
                ]}
              >
                {size}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Giá + Nút giỏ hàng */}
        <View style={styles.footer}>
          <Text style={styles.price}>
            ₫{product.specialPrice?.toLocaleString() || product.price?.toLocaleString()}
          </Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleAddToCart}
            disabled={loading}
          >
            <Text style={styles.cartText}>
              {loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProductDetailsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  heartIcon: {
    position: 'absolute',
    top: 280,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 100,
    padding: 8,
    elevation: 4,
  },
  details: {
    padding: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  rating: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviews: {
    color: '#666',
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginVertical: 10,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  qtyButton: {
    padding: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  sizeBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  selectedSizeBox: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sizeText: {
    fontSize: 14,
    color: '#000',
  },
  selectedSizeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cartText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
