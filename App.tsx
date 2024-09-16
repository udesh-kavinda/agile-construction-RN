import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './app/context/AuthContext';
import Login from './app/screens/Login';
import BottomTabs from './app/navigation/BottomTabs'; // Import BottomTabs
import JobDetail from './app/screens/JobDetail';
import MainList from './app/screens/MainList';
import JobVeiw from './app/screens/JobVeiw';
import PendingList from './app/screens/PendingList';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <AuthProvider>
        <NavigationContainer>
          <Layout />
        </NavigationContainer>
      </AuthProvider>
      <Toast />
    </>
  );
}

const Layout = () => {
  const { authState } = useAuth();

  return (
    <>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {authState?.authenticated ? (
          <>
            <Stack.Screen
              name="BottomTabs"
              component={BottomTabs}
              options={{ headerShown: false }} // Hide the header for BottomTabs
            />
            <Stack.Screen name="JobDetail" component={JobDetail} />
            <Stack.Screen name="JobVeiw" component={JobVeiw} />
            <Stack.Screen name="MainList" component={MainList} />
            <Stack.Screen name="PendingList" component={PendingList} />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </>
  );
};
