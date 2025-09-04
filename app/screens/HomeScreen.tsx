import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import Cart from './hometabs/Cart';
import ChatAI from './hometabs/ChatAI';
import Home from './hometabs/Home';
import Search from './hometabs/Search';
import AccountStack from './hometabs/tabviews/account/AccountStack';

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Trang chủ"
        component={Home}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Tìm kiếm"
        component={Search}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ChatAI"
        component={ChatAI}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'chatbox' : 'chatbox-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Giỏ hàng"
        component={Cart}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Tài khoản"
        component={AccountStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeScreen;
