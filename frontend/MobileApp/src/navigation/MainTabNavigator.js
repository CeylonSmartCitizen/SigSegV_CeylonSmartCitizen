import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Updated import paths to match folder structure
import AppointmentsScreen from '../screen/appointments/AppointmentsScreen';
import ProfileScreen from '../screen/profile/ProfileScreen';
import QueueScreen from '../screen/queue/QueueScreen';
import ServicesScreen from '../screen/services/ServicesScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Services': iconName = 'apps-outline'; break;
            case 'Appointments': iconName = 'calendar-outline'; break;
            case 'Queue': iconName = 'people-outline'; break;
            case 'Profile': iconName = 'person-outline'; break;
            default: iconName = 'ellipse-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Queue" component={QueueScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}