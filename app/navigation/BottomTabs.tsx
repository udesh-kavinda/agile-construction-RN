import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the MaterialIcons component

import MainList from '../screens/MainList';
import Profile from '../screens/Profile';
import Dashboard from '../screens/Dashboard';
import PendingList from '../screens/PendingList';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Set the icon name based on the route name
          if (route.name === 'Dashboard') {
            iconName = focused ? 'dashboard' : 'dashboard';
          } else if (route.name === 'MainList') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'My Jobs') {
            iconName = focused ? 'list' : 'list';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person';
          }

          // Return the appropriate icon component
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: { backgroundColor: '#ffffff' },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      {/* <Tab.Screen name="MainList" component={MainList} /> */}
      <Tab.Screen name="My Jobs" component={PendingList} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
