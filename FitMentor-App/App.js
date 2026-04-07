import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen'; 
import RoutinesScreen from './src/screens/RoutinesScreen';
import RecipesScreen from './src/screens/RecipesScreen';

const Tab = createBottomTabNavigator();


export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al arrancar, miramos si ya había un token guardado
  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      setToken(savedToken);
      setLoading(false);
    };
    loadToken();
  }, []);

  const handleLogin = async (userToken) => {
    await AsyncStorage.setItem('userToken', userToken); // Guardamos en memoria
    setToken(userToken); // Actualizamos el estado para navegar
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setToken(null);
  };

  if (loading) return null; // O una pantalla de carga

  return (
    <View style={styles.container}>
      {!token ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <NavigationContainer>
          <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2ECC71' }}>
            <Tab.Screen name="Entrenamiento">
              {props => <RoutinesScreen {...props} token={token} />}
            </Tab.Screen>
            <Tab.Screen name="Nutrición">
              {props => <RecipesScreen {...props} token={token} />}
            </Tab.Screen>
          </Tab.Navigator>
        </NavigationContainer>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#FFF' } });