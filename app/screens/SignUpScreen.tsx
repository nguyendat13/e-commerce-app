import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { POST_REGISTER } from '../../helpers/services/apiService';

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    street: '',
    buildingName: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  const navigation = useNavigation<any>();

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      street,
      buildingName,
      city,
      state,
      country,
      pincode,
    } = formData;

    const success = await POST_REGISTER({
      firstName,
      lastName,
      mobileNumber,
      email,
      password,
      address: {
        street,
        buildingName,
        city,
        state,
        country,
        pincode
      }
    });

    if (success) {
      Alert.alert("Thành công", "Đăng ký thành công. Mời bạn đăng nhập.");
      navigation.navigate("SignIn");
    } else {
      Alert.alert("Thất bại", "Không thể đăng ký. Vui lòng thử lại.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>

      <TextInput placeholder="Họ" style={styles.input} onChangeText={(text) => handleChange('lastName', text)} />
      <TextInput placeholder="Tên" style={styles.input} onChangeText={(text) => handleChange('firstName', text)} />
      <TextInput placeholder="Email" keyboardType="email-address" style={styles.input} onChangeText={(text) => handleChange('email', text)} />
      <TextInput placeholder="Số điện thoại" keyboardType="phone-pad" style={styles.input} onChangeText={(text) => handleChange('mobileNumber', text)} />
      <TextInput placeholder="Mật khẩu" secureTextEntry style={styles.input} onChangeText={(text) => handleChange('password', text)} />

      <Text style={styles.section}>Địa chỉ</Text>
      <TextInput placeholder="Tên tòa nhà / Số nhà" style={styles.input} onChangeText={(text) => handleChange('buildingName', text)} />
      <TextInput placeholder="Tên đường" style={styles.input} onChangeText={(text) => handleChange('street', text)} />
      <TextInput placeholder="Thành phố" style={styles.input} onChangeText={(text) => handleChange('city', text)} />
      <TextInput placeholder="Tiểu bang" style={styles.input} onChangeText={(text) => handleChange('state', text)} />
      <TextInput placeholder="Quốc gia" style={styles.input} onChangeText={(text) => handleChange('country', text)} />
      <TextInput placeholder="Mã bưu điện" style={styles.input} keyboardType="numeric" onChangeText={(text) => handleChange('pincode', text)} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Tạo tài khoản</Text>
      </TouchableOpacity>

      <Text style={styles.joinText}>
        Đã có tài khoản? <Text style={styles.joinLink} onPress={() => navigation.navigate('SignIn')}>Đăng nhập</Text>
      </Text>
    </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  joinText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 13,
  },
  joinLink: {
    color: '#000',
    fontWeight: 'bold',
  },
});
