import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios'; // Necesitamos axios para hablar con el servidor

const COLORS = {
  primary: '#2ECC71',
  textMain: '#2D3436',
  textSub: '#95A5A6',
  inputBg: '#F1F2F6',
  white: '#FFFFFF'
};

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Para el circulito de carga

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, rellena todos los campos.");
      return;
    }

    setLoading(true);
    try {
      // LLAMADA REAL AL BACKEND
      const response = await axios.post('http://192.168.178.73:3000/login', {
        email: email.trim(),
        password: password
      });

      // Si todo va bien, el servidor nos da el token
      const { token } = response.data;
      
      // Enviamos el TOKEN al App.js para que nos deje entrar
      onLogin(token); 

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "No se pudo conectar con el servidor";
      Alert.alert("Error de inicio de sesión", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {marginTop: 50}]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="barbell" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>FitMentor</Text>
          <Text style={styles.subtitle}>Tu entrenador personal inteligente</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textSub} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSub} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && { opacity: 0.7 }]} 
            onPress={handleLoginPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerBtn}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: '#E8F8F5', justifyContent: 'center', 
    alignItems: 'center', marginBottom: 20 
  },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textMain },
  subtitle: { fontSize: 16, color: COLORS.textSub, marginTop: 5 },
  form: { width: '100%' },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: COLORS.inputBg, borderRadius: 15, 
    paddingHorizontal: 15, marginBottom: 15, height: 55 
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.textMain },
  loginBtn: { 
    backgroundColor: COLORS.primary, borderRadius: 15, 
    height: 55, justifyContent: 'center', alignItems: 'center', 
    marginTop: 10, elevation: 3, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
  },
  loginBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  registerBtn: { marginTop: 25, alignItems: 'center' },
  registerText: { color: COLORS.textSub, fontSize: 14 }
});