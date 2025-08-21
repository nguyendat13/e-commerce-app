  import emailjs from '@emailjs/browser';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

  // Hardcode admin + API + EmailJS
  const ADMIN_EMAIL = "dat48421@gmail.com";
  const ADMIN_PASSWORD = "123";
  const API_BASE_URL = "http://10.196.85.41:8080/api";

  const EMAILJS_SERVICE_ID = "service_cahqnmx";
  const EMAILJS_TEMPLATE_ID = "template_hb0paig";
  const EMAILJS_PUBLIC_KEY = "hzpwmt7YlMAMi2P5B";

  const ResetPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

    const handleResetPassword = async () => {
      if (!email.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập email');
        return;
      }

      setLoading(true);
      try {
        // 1. Đăng nhập admin để lấy token
        const loginRes = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });

        if (!loginRes.ok) throw new Error('Không thể đăng nhập admin');

        const loginData = await loginRes.json();
        const token = loginData.token || loginData['jwt-token'] || loginData.accessToken;
        if (!token) throw new Error('Không lấy được token admin');

        // 2. Lấy thông tin user theo email
        const encodedEmail = encodeURIComponent(email.trim());
        const resUser = await fetch(`${API_BASE_URL}/public/users/email/${encodedEmail}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resUser.ok) {
          Alert.alert('Lỗi', 'Không tìm thấy email này');
          return;
        }

        const userData = await resUser.json();

        // 3. Tạo mật khẩu mới
        const newPassword = Math.random().toString(36).slice(-8);

        // 4. Cập nhật mật khẩu
        const updatedUser = { ...userData, password: newPassword };
        const resUpdate = await fetch(`${API_BASE_URL}/public/users/${userData.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        });

        if (!resUpdate.ok) throw new Error('Không thể cập nhật mật khẩu');

        // 5. Gửi email trực tiếp từ RN
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          { to_email: email.trim(), new_password: newPassword },
          EMAILJS_PUBLIC_KEY
        );

        Alert.alert('Thành công', 'Mật khẩu mới đã được gửi qua email!');
        setEmail('');
      } catch (error: unknown) {
        console.error(error);
        Alert.alert('Lỗi', error instanceof Error ? error.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={styles.container}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email của bạn"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Gửi mật khẩu mới</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  export default ResetPasswordScreen;

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 15 },
    button: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  });
