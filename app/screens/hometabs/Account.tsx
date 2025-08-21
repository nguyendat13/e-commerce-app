import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { handleLogout } from '../../../helpers/services/apiService';

const Account = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <Ionicons name="notifications-outline" size={30} />
      </View>

      {/* Nội dung */}
      <ScrollView>
        <View style={styles.section}>
          <MenuItem
            icon="cube-outline"
            label="Đơn hàng của tôi"
            onPress={() => navigation.navigate('MyOrders')}
          />
        </View>

        <View style={styles.section}>
          <MenuItem icon="person-outline" label="Thông tin cá nhân" 
          onPress={() => navigation.navigate('MyDetails')}/>

          <MenuItem icon="home-outline" label="Sổ địa chỉ" onPress={() => navigation.navigate('Address')}/>
          <MenuItem icon="card-outline" label="Phương thức thanh toán" />
          <MenuItem icon="notifications-outline" label="Thông báo" />
        </View>

        <View style={styles.section}>
          <MenuItem icon="help-circle-outline" label="Câu hỏi thường gặp" />
          <MenuItem icon="headset-outline" label="Trung tâm hỗ trợ" />
        </View>

        <View style={[styles.section, styles.logoutSection]}>
          <MenuItem
            icon="log-out-outline"
            label="Đăng xuất"
            isLogout
            onPress={() =>handleLogout(navigation)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isLogout?: boolean;
  onPress?: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, isLogout, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons
      name={icon}
      size={20}
      color={isLogout ? 'red' : '#333'}
      style={styles.menuIcon}
    />
    <Text style={[styles.menuText, isLogout && { color: 'red' }]}>{label}</Text>
    {!isLogout && (
      <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
    )}
  </TouchableOpacity>
);

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical:25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 15,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutSection: {
    marginBottom: 40,
  },
});
