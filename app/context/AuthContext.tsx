import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  password: string | null;
  gender: string;
  nic: string;
  dob: string;
  registeredDate: string | null;
  image: string;
  contact: string;
  userRole: string;
  designation: string;
}

interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null; user: User | null };
  onLogin?: (email: string, password: string) => Promise<any>;
  onLogout?: () => Promise<void>;
}

const TOKEN_KEY = "my-key";
export const API_URL = "http://20.2.211.30:8080/api/user";
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{ token: string | null; authenticated: boolean | null; user: User | null }>({
    token: null,
    authenticated: false,
    user: null,
  });

  // useEffect(() => {
  //   const loadToken = async () => {
  //     const token = await AsyncStorage.getItem(TOKEN_KEY);

  //     if (token) {
  //       try {
  //         const result = await axios.get(`${API_URL}`, { 
  //           headers: { Authorization: `Bearer ${token}` },
  //         });
  //         const userData = result.data; 

  //         setAuthState({
  //           token: token,
  //           authenticated: true,
  //           user: userData,
  //         });
  //         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //       } catch (error) {
  //         console.error('Error fetching user data:', error);
  //       }
  //     }
  //   };
  //   loadToken();
  // }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await axios.post(`${API_URL}/login`, { email, password });
      const authHeader = result.headers['authorization'];
      const token = authHeader ? authHeader.split(' ')[1] : null;
      const userData = result.data; // Assuming user data is returned in the response
      console.log("userData",result)

      if (!token) {
        throw new Error('No token found in the response headers');
      }

      setAuthState({
        token: token,
        authenticated: true,
        user: userData,
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await AsyncStorage.setItem(TOKEN_KEY, token);

      return result;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error('Axios error:', e.message);
        if (e.message === "Network Error") {
          console.error('Network Error: Check if your server is running and accessible.');
          console.error('API URL:', `${API_URL}/login`);
          console.error('Check your network connection and CORS policy.');
        }
        return { error: true, msg: e.response?.data?.msg || 'An error occurred with the request' };
      } else {
        console.error('Unexpected Error:', e.message);
        return { error: true, msg: 'An unexpected error occurred during login' };
      }
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setAuthState({
        token: null,
        authenticated: false,
        user: null,
      });
      console.log('Logout successful: Token removed and headers cleared.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    onLogin: login,
    onLogout: logout,
    authState
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
