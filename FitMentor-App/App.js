import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Importación de pantallas
import LoginScreen from './src/screens/LoginScreen'; 
import RoutinesScreen from './src/screens/RoutinesScreen';
import RecipesScreen from './src/screens/RecipesScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  // Eliminamos la restricción: Iniciamos con un estado que permite ver todo
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  return (
    <View style={styles.container}>
      {/* Cambiamos la lógica: Si isLoggedIn es true, entramos directo.
          He quitado la dependencia del 'token' para las peticiones.
      */}
      {!isLoggedIn ? (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <NavigationContainer>
          <Tab.Navigator 
            screenOptions={{ 
              tabBarActiveTintColor: '#2ECC71',
              headerShown: true,
              tabBarStyle: { height: 60, paddingBottom: 10 }
            }}
          >
            <Tab.Screen 
              name="Entrenamiento" 
              component={RoutinesScreen}
              options={{ 
                tabBarIcon: ({color, size}) => <Ionicons name="barbell" size={size} color={color} /> 
              }}
            />
            
            <Tab.Screen 
              name="Nutrición"
              component={RecipesScreen}
              options={{ 
                tabBarIcon: ({color, size}) => <Ionicons name="restaurant" size={size} color={color} /> 
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});