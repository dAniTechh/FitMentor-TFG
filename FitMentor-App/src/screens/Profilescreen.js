import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Alert, Switch
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const THEME = {
  dark: '#0A0A0F',
  card: '#13131A',
  border: '#1E1E2E',
  accent: '#00FF88',
  accentDim: 'rgba(0,255,136,0.12)',
  text: '#FFFFFF',
  textMuted: '#6B7280',
  blue: '#4FC3F7',
  warning: '#FFB74D',
  danger: '#FF4757',
};

const GOALS = [
  { id: 'perdida', label: 'Pérdida de peso', icon: 'trending-down', color: '#FF6B35' },
  { id: 'volumen', label: 'Ganar masa', icon: 'trending-up', color: THEME.accent },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: 'remove', color: THEME.blue },
  { id: 'resistencia', label: 'Resistencia', icon: 'bicycle', color: THEME.warning },
];

function BMIGauge({ bmi }) {
  const categories = [
    { label: 'Bajo peso', max: 18.5, color: THEME.blue },
    { label: 'Normal', max: 25, color: THEME.accent },
    { label: 'Sobrepeso', max: 30, color: THEME.warning },
    { label: 'Obesidad', max: 40, color: THEME.danger },
  ];
  const clampedBmi = Math.min(Math.max(bmi, 15), 40);
  const percentage = ((clampedBmi - 15) / 25) * 100;

  const currentCat = categories.find(c => bmi < c.max) || categories[categories.length - 1];

  return (
    <View style={bmiStyles.container}>
      <View style={bmiStyles.row}>
        {categories.map((c, i) => (
          <View key={i} style={[bmiStyles.segment, { flex: i === 0 ? 3.5 : i === 1 ? 6.5 : i === 2 ? 5 : 10, backgroundColor: c.color + '40' }]} />
        ))}
      </View>
      <View style={[bmiStyles.needle, { left: `${Math.min(Math.max(percentage, 2), 96)}%` }]} />
      <View style={bmiStyles.info}>
        <Text style={bmiStyles.bmiValue}>{bmi.toFixed(1)}</Text>
        <Text style={[bmiStyles.bmiCat, { color: currentCat.color }]}>{currentCat.label}</Text>
      </View>
      <View style={bmiStyles.labels}>
        {categories.map((c, i) => (
          <Text key={i} style={[bmiStyles.segLabel, { color: c.color }]}>{c.label}</Text>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen({ user, onLogout }) {
  const [weight, setWeight] = useState('77');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('25');
  const [selectedGoal, setSelectedGoal] = useState('volumen');
  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const bmi = weight && height
    ? parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)
    : 0;

  const tdee = weight && height && age
    ? Math.round(
        (10 * parseFloat(weight)) +
        (6.25 * parseFloat(height)) -
        (5 * parseFloat(age)) + 5
      ) * 1.55
    : 0;

  const handleSave = () => {
    setEditMode(false);
    Alert.alert('✅ Guardado', 'Tu perfil ha sido actualizado correctamente.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  const firstName = user?.name?.split(' ')[0] || 'Atleta';
  const initials = (user?.name || 'AT').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.dark} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Header */}
        <LinearGradient
          colors={['#00FF88', '#00CC6A']}
          style={styles.profileHeader}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Tu nombre'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'correo@ejemplo.com'}</Text>

          <View style={styles.profileStatsRow}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNum}>12</Text>
              <Text style={styles.profileStatLabel}>Sesiones</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNum}>{weight} kg</Text>
              <Text style={styles.profileStatLabel}>Peso</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNum}>{height} cm</Text>
              <Text style={styles.profileStatLabel}>Altura</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body Data */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Datos Físicos</Text>
            <TouchableOpacity
              onPress={() => editMode ? handleSave() : setEditMode(true)}
              style={styles.editBtn}
            >
              <Ionicons name={editMode ? 'checkmark' : 'pencil'} size={14} color={THEME.accent} />
              <Text style={styles.editBtnText}>{editMode ? 'Guardar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldsRow}>
            {[
              { label: 'Peso (kg)', value: weight, setter: setWeight, unit: 'kg' },
              { label: 'Altura (cm)', value: height, setter: setHeight, unit: 'cm' },
              { label: 'Edad', value: age, setter: setAge, unit: 'años' },
            ].map((field) => (
              <View key={field.label} style={styles.fieldItem}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {editMode ? (
                  <View style={styles.fieldInputWrapper}>
                    <TextInput
                      style={styles.fieldInput}
                      value={field.value}
                      onChangeText={field.setter}
                      keyboardType="numeric"
                    />
                  </View>
                ) : (
                  <Text style={styles.fieldValue}>
                    {field.value}
                    <Text style={styles.fieldUnit}> {field.unit}</Text>
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* BMI */}
        {bmi > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Índice de Masa Corporal</Text>
            <BMIGauge bmi={bmi} />
          </View>
        )}

        {/* TDEE */}
        {tdee > 0 && (
          <View style={[styles.sectionCard, styles.tdeeCard]}>
            <View style={styles.tdeeLeft}>
              <Text style={styles.tdeeLabel}>CALORÍAS DE MANTENIMIENTO</Text>
              <Text style={styles.tdeeValue}>{Math.round(tdee)}</Text>
              <Text style={styles.tdeeUnit}>kcal / día</Text>
            </View>
            <View style={styles.tdeeSuggestions}>
              <View style={styles.tdeeSug}>
                <Text style={[styles.tdeeSugVal, { color: THEME.danger }]}>
                  {Math.round(tdee - 300)}
                </Text>
                <Text style={styles.tdeeSugLabel}>Pérdida</Text>
              </View>
              <View style={styles.tdeeSug}>
                <Text style={[styles.tdeeSugVal, { color: THEME.accent }]}>
                  {Math.round(tdee + 200)}
                </Text>
                <Text style={styles.tdeeSugLabel}>Volumen</Text>
              </View>
            </View>
          </View>
        )}

        {/* Objectives */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Mi Objetivo</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelectedGoal(g.id)}
                style={[
                  styles.goalCard,
                  selectedGoal === g.id && { borderColor: g.color, backgroundColor: g.color + '15' }
                ]}
              >
                <Ionicons
                  name={g.icon}
                  size={22}
                  color={selectedGoal === g.id ? g.color : THEME.textMuted}
                />
                <Text style={[
                  styles.goalLabel,
                  selectedGoal === g.id && { color: g.color }
                ]}>{g.label}</Text>
                {selectedGoal === g.id && (
                  <View style={[styles.goalCheck, { backgroundColor: g.color }]}>
                    <Ionicons name="checkmark" size={10} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          {[
            {
              icon: 'notifications', label: 'Notificaciones',
              sub: 'Recordatorios de entrenamiento',
              value: notifications, setter: setNotifications
            },
            {
              icon: 'moon', label: 'Modo oscuro',
              sub: 'Tema de la aplicación',
              value: darkMode, setter: setDarkMode
            },
          ].map((setting, i) => (
            <View key={i} style={[styles.settingRow, i < 1 && styles.settingBorder]}>
              <View style={styles.settingIcon}>
                <Ionicons name={setting.icon} size={18} color={THEME.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{setting.label}</Text>
                <Text style={styles.settingSub}>{setting.sub}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.setter}
                trackColor={{ false: THEME.border, true: THEME.accent + '60' }}
                thumbColor={setting.value ? THEME.accent : THEME.textMuted}
              />
            </View>
          ))}

          {[
            { icon: 'shield-checkmark', label: 'Privacidad', sub: 'Gestiona tus datos' },
            { icon: 'help-circle', label: 'Ayuda y soporte', sub: 'FAQ y contacto' },
            { icon: 'information-circle', label: 'Acerca de', sub: 'FitMentor v1.0 — TFG 2026' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.settingRow, styles.settingBorder]}>
              <View style={styles.settingIcon}>
                <Ionicons name={item.icon} size={18} color={THEME.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={THEME.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={THEME.danger} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>FitMentor • TFG 2026 • Made with 💪</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },
  scroll: { paddingBottom: 40 },

  profileHeader: { padding: 28, paddingTop: 36, alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: '#000' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#000', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: 'rgba(0,0,0,0.5)', marginBottom: 20 },
  profileStatsRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, width: '100%', justifyContent: 'space-around' },
  profileStat: { alignItems: 'center' },
  profileStatNum: { fontSize: 18, fontWeight: '800', color: '#000' },
  profileStatLabel: { fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 2 },
  profileStatDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.2)' },

  sectionCard: { backgroundColor: THEME.card, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: THEME.border },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.text, marginBottom: 14 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.accentDim, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { fontSize: 12, color: THEME.accent, fontWeight: '700', marginLeft: 4 },

  fieldsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldItem: { flex: 1, alignItems: 'center' },
  fieldLabel: { fontSize: 10, color: THEME.textMuted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  fieldValue: { fontSize: 20, fontWeight: '800', color: THEME.text },
  fieldUnit: { fontSize: 12, color: THEME.textMuted, fontWeight: '400' },
  fieldInputWrapper: { backgroundColor: THEME.dark, borderRadius: 10, borderWidth: 1, borderColor: THEME.accent, paddingHorizontal: 8 },
  fieldInput: { fontSize: 18, fontWeight: '800', color: THEME.accent, textAlign: 'center', width: 70, paddingVertical: 6 },

  tdeeCard: { flexDirection: 'row', alignItems: 'center' },
  tdeeLeft: { flex: 1 },
  tdeeLabel: { fontSize: 9, color: THEME.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  tdeeValue: { fontSize: 38, fontWeight: '800', color: THEME.text },
  tdeeUnit: { fontSize: 12, color: THEME.textMuted },
  tdeeSuggestions: { alignItems: 'flex-end' },
  tdeeSug: { alignItems: 'center', marginBottom: 8 },
  tdeeSugVal: { fontSize: 18, fontWeight: '800' },
  tdeeSugLabel: { fontSize: 10, color: THEME.textMuted },

  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  goalCard: { width: '46%', margin: '2%', backgroundColor: THEME.dark, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: THEME.border, alignItems: 'flex-start', position: 'relative' },
  goalLabel: { fontSize: 13, fontWeight: '600', color: THEME.textMuted, marginTop: 8 },
  goalCheck: { position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  settingBorder: { borderTopWidth: 1, borderTopColor: THEME.border + '40' },
  settingIcon: { width: 36, height: 36, backgroundColor: THEME.dark, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: THEME.text },
  settingSub: { fontSize: 11, color: THEME.textMuted, marginTop: 1 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 16, backgroundColor: THEME.card, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: THEME.danger + '30' },
  logoutText: { color: THEME.danger, fontWeight: '700', fontSize: 15, marginLeft: 8 },
  footer: { textAlign: 'center', color: THEME.border, fontSize: 11, marginTop: 20 },
});

const bmiStyles = StyleSheet.create({
  container: { marginBottom: 8 },
  row: { flexDirection: 'row', height: 10, borderRadius: 10, overflow: 'hidden', marginBottom: 4 },
  segment: { height: 10 },
  needle: { position: 'absolute', top: 2, width: 3, height: 14, backgroundColor: THEME.text, borderRadius: 2, marginLeft: -1.5 },
  info: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  bmiValue: { fontSize: 32, fontWeight: '800', color: THEME.text },
  bmiCat: { fontSize: 16, fontWeight: '700' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  segLabel: { fontSize: 9, fontWeight: '600' },
});