// AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; 
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthStatus: (status: boolean) => void; // bắt buộc phải truyền vào Provider
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true, 
  login: async () => {},
  logout: async () => {},
  setAuthStatus: () => {}, // 👈 thêm default
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('jwt-token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    checkToken();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem('jwt-token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('jwt-token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        setAuthStatus: setIsAuthenticated, // 👈 fix lỗi
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
