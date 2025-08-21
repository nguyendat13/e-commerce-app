import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAuth } from '../../helpers/auth/AuthContext';

const SplashScreen = () => {
  const { setAuthStatus } = useAuth(); // 👈 cần thêm setAuthStatus vào AuthContext
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwt-token');
      setAuthStatus(!!token);

      // Sau 2s thì chuyển sang SignIn hoặc Home
      setTimeout(() => {
        if (token) {
          navigation.replace('Home');
        } else {
          navigation.replace('SignIn');
        }
      }, 2000);
    };
    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/logo.png')} style={styles.logo} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1919',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 1000,
    height: 1000,
    marginBottom: 30,
    resizeMode: 'contain',
  },
});
