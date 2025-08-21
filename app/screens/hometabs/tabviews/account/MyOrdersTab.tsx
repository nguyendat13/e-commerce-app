import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GET_ID } from '../../../../../helpers/services/apiService';

const { width } = Dimensions.get('window');

const MyOrdersTab = () => {
  const [activeTab, setActiveTab] = useState<'Ongoing' | 'Completed'>('Ongoing');
  const navigation = useNavigation<any>();

  type OrderItem = {
    id: number;
    name: string;
    image: { uri: string };
    size: string;
    price: number;
    status: string;
    paymentMethod: string;
    orderStatus: string;
  };

  const [orders, setOrders] = useState<OrderItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchOrders = async () => {
        try {
          const email = await AsyncStorage.getItem('user-email');
          if (!email) return;

          const encodedEmail = encodeURIComponent(email);
          const response = await GET_ID('public/users', `${encodedEmail}/orders`);

          const allOrderItems = response.data.flatMap((order: any) =>
            order.orderItems.map((item: any) => ({
              id: item.orderItemId,
              name: item.product.productName,
              image: { uri: `http://10.196.85.41:8080/api/public/products/image/${item.product.image}` },
              size: item.size || "M",
              price: item.product.price,
              status: order.orderStatus,   // lấy orderStatus từ order
              paymentMethod: order.payment?.paymentMethod || "N/A", // lấy paymentMethod
              orderStatus: order.orderStatus,
            }))
          );

          setOrders(allOrderItems);
        } catch (err) {
          console.error('❌ Lỗi khi lấy đơn hàng:', err);
        }
      };

      fetchOrders();
    }, [])
  );

  const renderOrder = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.size}>Size {item.size}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
     <Text style={styles.extra}>Phương thức thanh toán: {item.paymentMethod}</Text>
        <Text style={styles.extra}>Trạng thái: {item.orderStatus}</Text>
      </View>
      <View style={styles.right}>
        <View style={[styles.statusBadge, statusColor(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <TouchableOpacity style={styles.trackBtn}>
          <Text style={styles.trackText}>Theo dõi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <Ionicons name="notifications-outline" size={30} />
        
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Ongoing' && styles.activeTab]}
          onPress={() => setActiveTab('Ongoing')}
        >
          <Text style={activeTab === 'Ongoing' ? styles.activeTabText : styles.tabText}>Đang xử lý</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Completed' && styles.activeTab]}
          onPress={() => setActiveTab('Completed')}
        >
          <Text style={activeTab === 'Completed' ? styles.activeTabText : styles.tabText}>Đã hoàn tất</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders.filter((item) =>
          activeTab === 'Ongoing'
            ? item.orderStatus !== 'Đã hoàn tất'
            : item.orderStatus === 'Đã hoàn tất'
        )}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default MyOrdersTab;

const statusColor = (status: string) => {
  switch (status) {
    case 'Đang vận chuyển':
      return { backgroundColor: '#E0F0FF' };
    case 'Đã lấy hàng':
      return { backgroundColor: '#FDEEDC' };
    case 'Đang đóng gói':
      return { backgroundColor: '#EEE5FF' };
    default:
      return { backgroundColor: '#DDD' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, alignItems: 'center', marginBottom: 50 },
  headerTitle: { fontWeight: 'bold', fontSize: 25 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F2F2F2', borderRadius: 10, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { backgroundColor: '#fff', borderRadius: 10 },
  tabText: { color: '#999', fontWeight: '500' },
  activeTabText: { color: '#000', fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 12, borderRadius: 12, marginBottom: 12 },
  image: { width: 60, height: 70, resizeMode: 'contain', marginRight: 10 },
  info: { flex: 1 },
  name: { fontWeight: '600', fontSize: 15 },
  size: { fontSize: 13, color: '#666' },
  price: { fontSize: 14, fontWeight: '600', marginTop: 4 },
extra: {
  fontSize: 16,
  fontWeight: "500",
  color: "#333",
  marginTop: 4,
  marginBottom: 2,
},
  right: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  trackBtn: { backgroundColor: '#000', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  trackText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
