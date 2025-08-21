import { callApi } from '@/helpers/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Address = {
  addressId: number;
  street: string;
  buildingName: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

const AddressTab = () => {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const email = await AsyncStorage.getItem('user-email');
        if (!email) return;

        const res = await callApi(
          `public/users/email/${encodeURIComponent(email)}`,
          'GET'
        );

        if (res?.data?.address) {
          // Nếu backend trả về 1 address duy nhất
          setAddresses([res.data.address]);
          setSelectedAddressId(res.data.address.addressId);
        }
      } catch (err) {
        console.error('Lỗi load địa chỉ:', err);
      }
    };

    fetchAddresses();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ</Text>
        <Ionicons name="notifications-outline" size={30} />
      </View>

      {/* Address List */}
      <Text style={styles.sectionTitle}>Địa chỉ đã lưu</Text>
      <View style={styles.list}>
        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.addressId}
            style={styles.addressItem}
            onPress={() => setSelectedAddressId(addr.addressId)}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={18} />
                <Text style={styles.addressTitle}>
                  {addr.buildingName || 'Địa chỉ'}
                </Text>
              </View>
              <Text style={styles.addressDetail}>
                {addr.street}, {addr.city}, {addr.state}, {addr.country} -{' '}
                {addr.pincode}
              </Text>
            </View>
            <Ionicons
              name={
                selectedAddressId === addr.addressId
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Add New */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="#000" />
        <Text style={styles.addText}>Thêm địa chỉ mới</Text>
      </TouchableOpacity>

      {/* Apply */}
      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitText}>Xác nhận</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddressTab;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  addressTitle: {
    fontWeight: '600',
  },
  addressDetail: {
    color: '#555',
    fontSize: 14,
  },
  addButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
