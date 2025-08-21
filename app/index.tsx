import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { AuthProvider, useAuth } from '../helpers/auth/AuthContext';
import { RootStackParamList } from '../types';

import ChangePasswordScreen from './screens/ChangePasswordScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import HomeScreen from './screens/HomeScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import SplashScreen from './screens/SplashScreen';
import VNPayWebView from './screens/VNPayWebView';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailsScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="VNPayWebView" component={VNPayWebView} />

        </>
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Component xử lý deep link
const DeepLinkHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation<any>();

  useEffect(() => {
   const handleDeepLink = (event: { url: string }) => {
  try {
    const parsedUrl = new URL(event.url);
    const screen = parsedUrl.host || parsedUrl.pathname.replace("/", ""); // lấy "OrderSuccess"

    if (screen === "OrderSuccess") {
      const payment = parsedUrl.searchParams.get("payment");
      const txnRef = parsedUrl.searchParams.get("txnRef");
      const amount = parsedUrl.searchParams.get("amount");

      navigation.navigate("OrderSuccess", { txnRef, amount });
    }
  } catch (err) {
    console.warn("Invalid deep link URL", err);
  }
};


    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [navigation]);

  return <>{children}</>;
};

export default function AppNavigator() {
  return (
    <AuthProvider>
      <DeepLinkHandler>
        <RootNavigator />
      </DeepLinkHandler>
    </AuthProvider>
  );
}
