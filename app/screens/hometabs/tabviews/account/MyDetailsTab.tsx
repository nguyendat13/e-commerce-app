import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { GET_ID } from '../../../../../helpers/services/apiService';

const MyDetailsTab = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');

  const navigation = useNavigation<any>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('user-email');
        if (!storedEmail) {
          console.log('Không tìm thấy user-email trong AsyncStorage');
          return;
        }

        setEmail(storedEmail);

        const res = await GET_ID('public/users/email', storedEmail);
        if (res?.data) {
          setFirstName(res.data.firstName || '');
          setLastName(res.data.lastName || '');
          setMobileNumber(res.data.mobileNumber || '');
          setEmail(res.data.email || storedEmail);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <Ionicons name="notifications-outline" size={30} />
      </View>

      {/* Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Họ</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Tên</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Lưu thay đổi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: '#007bff', marginTop: 10 }]}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.submitText}>Đặt lại mật khẩu</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default MyDetailsTab;

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
  formGroup: {
    gap: 10,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 20,
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
