import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home'; // Adjust paths if necessary
import Profile from '../screens/Profile'; // Adjust paths if necessary
import Settings from '../screens/Settings'; // Adjust paths if necessary
import { Ionicons } from '@expo/vector-icons'; // Ensure you have this package installed

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home':
              iconName = 'home'; // Make sure 'home' is a valid Ionicons icon name
              break;
            case 'Profile':
              iconName = 'person'; // Make sure 'person' is a valid Ionicons icon name
              break;
            case 'Settings':
              iconName = 'settings'; // Make sure 'settings' is a valid Ionicons icon name
              break;
            default:
              iconName = 'home'; // Fallback icon
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 14 },
        tabBarStyle: { paddingBottom: 5 },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
