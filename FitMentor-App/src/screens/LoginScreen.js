import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
  SafeAreaView, StatusBar, Animated, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.178.73:3000';

const THEME = {
  dark: '#0A0A0F',
  card: '#13131A',
  border: '#1E1E2E',
  accent: '#00FF88',
  text: '#FFFFFF',
  textMuted: '#6B7280',
  danger: '#FF4757',
};

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const switchMode = () => {
    Animated.sequence([
      Animated.timing(formAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setMode(m => m === 'login' ? 'register' : 'login');
    setEmail(''); setPassword(''); setName('');
  };

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      Alert.alert('Campos requeridos', 'Por favor rellena todos los campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'Mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const response = await axios.post(`${API_URL}/login`, {
          email: email.trim().toLowerCase(),
          password,
        });
        const userData = response.data.user || { email: email.trim(), name: 'Atleta' };
        onLogin(userData);
      } else {
        await axios.post(`${API_URL}/register`, {
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        });
        Alert.alert('¡Cuenta creada!', 'Ya puedes iniciar sesión.', [
          { text: 'OK', onPress: () => setMode('login') }
        ]);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'No se pudo conectar con el servidor.';
      Alert.alert(mode === 'login' ? 'Error de acceso' : 'Error de registro', msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo quick login
  const demoLogin = () => {
    onLogin({ name: 'Demo Atleta', email: 'demo@fitmentor.com' });
  };

  const inputStyle = (field) => [
    styles.inputContainer,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.dark} />

      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>

          {/* Logo */}
          <Animated.View style={[styles.logoSection, {
            opacity: logoAnim,
            transform: [{
              translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] })
            }]
          }]}>
            <View style={styles.logoWrapper}>
              <LinearGradient colors={['#00FF88', '#00CC6A']} style={styles.logoCircle} start={{x:0,y:0}} end={{x:1,y:1}}>
                <MaterialCommunityIcons name="dumbbell" size={38} color="#000" />
              </LinearGradient>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.logoTitle}>FitMentor</Text>
            <Text style={styles.logoSubtitle}>Tu entrenador personal inteligente</Text>
          </Animated.View>

          {/* Form card */}
          <Animated.View style={[styles.formCard, {
            opacity: formAnim,
            transform: [{
              translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] })
            }]
          }]}>
            {/* Mode tabs */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
                onPress={() => mode !== 'login' && switchMode()}
              >
                <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
                onPress={() => mode !== 'register' && switchMode()}
              >
                <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
                  Crear cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name (register only) */}
            {mode === 'register' && (
              <View style={inputStyle('name')}>
                <Ionicons name="person-outline" size={18} color={focusedField === 'name' ? THEME.accent : THEME.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor={THEME.textMuted}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            {/* Email */}
            <View style={inputStyle('email')}>
              <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? THEME.accent : THEME.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={THEME.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password */}
            <View style={inputStyle('password')}>
              <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? THEME.accent : THEME.textMuted} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Contraseña"
                placeholderTextColor={THEME.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowPass(s => !s)}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={THEME.textMuted}
                />
              </TouchableOpacity>
            </View>

            {mode === 'login' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitBtnWrapper}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={loading ? ['#555', '#444'] : ['#00FF88', '#00CC6A']}
                style={styles.submitBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo access */}
            <TouchableOpacity onPress={demoLogin} style={styles.demoBtn}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color={THEME.accent} />
              <Text style={styles.demoBtnText}>Acceso demo (sin cuenta)</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footerText}>
            FitMentor — Trabajo de Fin de Grado 2026
          </Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(0,255,136,0.04)', top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(0,255,136,0.03)', bottom: 100, left: -60,
  },

  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },

  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoWrapper: { position: 'relative', marginBottom: 16 },
  logoCircle: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  logoGlow: {
    position: 'absolute', width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(0,255,136,0.2)', top: 4, zIndex: -1,
  },
  logoTitle: { fontSize: 34, fontWeight: '800', color: THEME.text, letterSpacing: -1 },
  logoSubtitle: { fontSize: 14, color: THEME.textMuted, marginTop: 6 },

  formCard: { backgroundColor: THEME.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: THEME.border },

  modeTabs: { flexDirection: 'row', backgroundColor: THEME.dark, borderRadius: 14, padding: 4, marginBottom: 24 },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modeTabActive: { backgroundColor: THEME.accent },
  modeTabText: { fontSize: 13, fontWeight: '700', color: THEME.textMuted },
  modeTabTextActive: { color: '#000' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: THEME.dark, borderRadius: 14,
    paddingHorizontal: 14, height: 52, marginBottom: 12,
    borderWidth: 1, borderColor: THEME.border,
  },
  inputFocused: { borderColor: THEME.accent },
  input: { flex: 1, fontSize: 15, color: THEME.text, marginLeft: 10 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 12, color: THEME.textMuted },

  submitBtnWrapper: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  submitBtn: { height: 54, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 1.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: THEME.border },
  dividerText: { marginHorizontal: 12, color: THEME.textMuted, fontSize: 13 },

  demoBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,255,136,0.07)', borderRadius: 14, height: 48,
    borderWidth: 1, borderColor: 'rgba(0,255,136,0.2)',
  },
  demoBtnText: { color: THEME.accent, fontWeight: '700', fontSize: 14, marginLeft: 6 },

  footerText: { textAlign: 'center', color: THEME.border, fontSize: 11, marginTop: 24 },
});