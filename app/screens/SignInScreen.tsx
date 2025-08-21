import { FontAwesome } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../helpers/auth/AuthContext';
import { POST_LOGIN } from '../../helpers/services/apiService';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation<any>();
const { login } = useAuth(); 

const handleLogin = async () => {
  const token = await POST_LOGIN(email, password); // token là string | null

  if (token) {
    await login(token); // ✅ đúng kiểu string
    Alert.alert('Đăng nhập thành công');
    navigation.replace('Home');
  } else {
    Alert.alert('Đăng nhập thất bại', 'Sai email hoặc mật khẩu');
  }
};



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập tài khoản</Text>
      <Text style={styles.subtitle}>Rất vui khi gặp lại bạn.</Text>

      {/* Email input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập địa chỉ email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password input */}
      <Text style={styles.label}>Mật khẩu</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Nhập mật khẩu của bạn"
          secureTextEntry={secureText}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setSecureText(!secureText)}>
          <Ionicons
            name={secureText ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#666"
          />
        </Pressable>
      </View>

      {/* Reset password */}
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
  <Text style={styles.reset}>
    Quên mật khẩu? <Text style={styles.resetLink}>Đặt lại mật khẩu</Text>
  </Text>
</TouchableOpacity>


      {/* Login button */}
      <TouchableOpacity
        style={styles.loginButton}
        // onPress={() => navigation.navigate('Home')}
          onPress={handleLogin}

      >
        <Text style={styles.loginText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Or */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>Hoặc</Text>
        <View style={styles.line} />
      </View>

      {/* Google Login */}
      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="google" size={20} color="#EA4335" />
        <Text style={styles.socialText}>Đăng nhập với Google</Text>
      </TouchableOpacity>

      {/* Facebook Login */}
      <TouchableOpacity style={[styles.socialButton, styles.fbButton]}>
        <FontAwesome name="facebook" size={20} color="#fff" />
        <Text style={[styles.socialText, { color: '#fff' }]}>
          Đăng nhập với Facebook
        </Text>
      </TouchableOpacity>

      {/* Join link */}
      <Text style={styles.joinText}>
        Chưa có tài khoản? <Text style={styles.joinLink} onPress={()=>{navigation.navigate('SignUp')}}>Đăng ký</Text>
      </Text>
    </View>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
  },
  reset: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  resetLink: {
    color: '#000',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#c21313',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  or: {
    marginHorizontal: 10,
    color: '#999',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 15,
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fbButton: {
    backgroundColor: '#1877f2',
    borderColor: 'transparent',
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
