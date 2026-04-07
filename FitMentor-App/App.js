import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RoutinesScreen from './src/screens/RoutinesScreen';
import RecipesScreen from './src/screens/RecipesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Entrenamiento" component={RoutinesScreen} 
          options={{ tabBarIcon: ({size,color}) => <Ionicons name="barbell" size={size} color={color} /> }} />
        <Tab.Screen name="Nutrición" component={RecipesScreen} 
          options={{ tabBarIcon: ({size,color}) => <Ionicons name="restaurant" size={size} color={color} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
