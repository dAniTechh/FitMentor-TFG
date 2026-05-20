import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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

const TABS = ['Semana', 'Mes', '3 Meses'];

// Simple bar chart component
function BarChart({ data, color }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={chartStyles.container}>
      {data.map((item, i) => (
        <View key={i} style={chartStyles.barWrapper}>
          <View style={chartStyles.barBg}>
            <View
              style={[
                chartStyles.barFill,
                {
                  height: `${(item.value / maxVal) * 100}%`,
                  backgroundColor: item.value > 0 ? color : THEME.border,
                }
              ]}
            />
          </View>
          <Text style={chartStyles.barLabel}>{item.label}</Text>
          {item.value > 0 && (
            <Text style={[chartStyles.barValue, { color }]}>{item.value}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// Weight sparkline
function WeightLine({ data }) {
  const maxW = Math.max(...data.map(d => d.w));
  const minW = Math.min(...data.map(d => d.w));
  const range = maxW - minW || 1;
  const chartH = 80;
  const chartW = width - 80;
  const step = chartW / (data.length - 1);

  const points = data.map((d, i) => ({
    x: i * step,
    y: chartH - ((d.w - minW) / range) * chartH,
  }));

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(0)} ${p.y.toFixed(0)}`
  ).join(' ');

  return (
    <View style={{ marginVertical: 8 }}>
      <View style={{ height: chartH + 20, position: 'relative' }}>
        {/* Simple polyline using views */}
        {points.map((p, i) => i < points.length - 1 && (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: points[i+1].x - p.x,
              height: 2,
              backgroundColor: THEME.accent,
              transformOrigin: 'left center',
              transform: [{
                rotate: `${Math.atan2(
                  points[i+1].y - p.y,
                  points[i+1].x - p.x
                ) * 180 / Math.PI}deg`
              }],
            }}
          />
        ))}
        {points.map((p, i) => (
          <View key={`dot-${i}`} style={{
            position: 'absolute',
            left: p.x - 4,
            top: p.y - 4,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: THEME.accent,
          }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {data.map((d, i) => (
          <Text key={i} style={{ fontSize: 10, color: THEME.textMuted }}>{d.label}</Text>
        ))}
      </View>
    </View>
  );
}

const WEEK_ACTIVITY = [
  { label: 'L', value: 1 }, { label: 'M', value: 1 }, { label: 'X', value: 0 },
  { label: 'J', value: 1 }, { label: 'V', value: 0 }, { label: 'S', value: 0 }, { label: 'D', value: 0 },
];

const MONTH_ACTIVITY = [
  { label: 'S1', value: 3 }, { label: 'S2', value: 4 }, { label: 'S3', value: 2 }, { label: 'S4', value: 4 },
];

const WEIGHT_DATA = [
  { label: 'Ene', w: 82 }, { label: 'Feb', w: 80.5 }, { label: 'Mar', w: 79 },
  { label: 'Abr', w: 78.2 }, { label: 'May', w: 77 },
];

const PERSONAL_RECORDS = [
  { exercise: 'Sentadilla', weight: '100 kg', date: '12 Abr', icon: 'weight-lifter', color: THEME.accent },
  { exercise: 'Press de Banca', weight: '80 kg', date: '5 May', icon: 'arm-flex', color: THEME.blue },
  { exercise: 'Peso Muerto', weight: '120 kg', date: '28 Mar', icon: 'dumbbell', color: THEME.warning },
  { exercise: 'Dominadas', weight: '12 reps', date: '15 May', icon: 'human-handsup', color: THEME.danger },
];

const HISTORY = [
  { date: 'Hoy', routine: 'Tren Superior A', duration: '52 min', exercises: 6, calories: 340 },
  { date: 'Ayer', routine: 'Tren Inferior B', duration: '48 min', exercises: 5, calories: 290 },
  { date: 'Jue', routine: 'Full Body C', duration: '40 min', exercises: 7, calories: 260 },
  { date: 'Mar', routine: 'Tren Superior A', duration: '55 min', exercises: 6, calories: 360 },
];

export default function ProgressScreen({ user }) {
  const [activeTab, setActiveTab] = useState('Semana');
  const [weightGoal] = useState(75);
  const [currentWeight] = useState(77);

  const weightToGoal = currentWeight - weightGoal;
  const weightProgress = Math.max(0, Math.min(1, 1 - (weightToGoal / 10)));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.dark} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progreso</Text>
          <Text style={styles.headerSub}>Mes de Mayo 2026</Text>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <LinearGradient colors={['#00FF88', '#00CC6A']} style={[styles.summaryCard, { flex: 1.2 }]} start={{x:0,y:0}} end={{x:1,y:1}}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="rgba(0,0,0,0.4)" />
            <Text style={styles.summaryNum}>12</Text>
            <Text style={styles.summaryLabel}>Sesiones</Text>
          </LinearGradient>
          <View style={{ flex: 0.1 }} />
          <View style={[styles.summaryCard, { backgroundColor: THEME.card, flex: 1 }]}>
            <Ionicons name="flame" size={22} color={THEME.warning} />
            <Text style={[styles.summaryNum, { color: THEME.warning }]}>3,480</Text>
            <Text style={styles.summaryLabel}>kcal quemadas</Text>
          </View>
          <View style={{ flex: 0.1 }} />
          <View style={[styles.summaryCard, { backgroundColor: THEME.card, flex: 1 }]}>
            <Ionicons name="time" size={22} color={THEME.blue} />
            <Text style={[styles.summaryNum, { color: THEME.blue }]}>9.6h</Text>
            <Text style={styles.summaryLabel}>Entrenado</Text>
          </View>
        </View>

        {/* Activity Chart */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actividad</Text>
            <View style={styles.tabRow}>
              {TABS.map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveTab(t)}
                  style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <BarChart
            data={activeTab === 'Semana' ? WEEK_ACTIVITY : MONTH_ACTIVITY}
            color={THEME.accent}
          />
        </View>

        {/* Weight Progress */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Peso Corporal</Text>
            <View style={styles.weightBadge}>
              <Text style={styles.weightBadgeText}>-5 kg total</Text>
            </View>
          </View>
          <WeightLine data={WEIGHT_DATA} />
          <View style={styles.weightGoalRow}>
            <View style={styles.weightGoalItem}>
              <Text style={styles.weightGoalLabel}>Actual</Text>
              <Text style={styles.weightGoalVal}>{currentWeight} kg</Text>
            </View>
            <View style={styles.weightGoalBar}>
              <View style={[styles.weightGoalFill, { width: `${weightProgress * 100}%` }]} />
            </View>
            <View style={styles.weightGoalItem}>
              <Text style={styles.weightGoalLabel}>Objetivo</Text>
              <Text style={[styles.weightGoalVal, { color: THEME.accent }]}>{weightGoal} kg</Text>
            </View>
          </View>
          <Text style={styles.weightNote}>
            {weightToGoal > 0
              ? `Faltan ${weightToGoal.toFixed(1)} kg para tu objetivo 💪`
              : '🎯 ¡Objetivo de peso alcanzado!'}
          </Text>
        </View>

        {/* Personal Records */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏆 Récords Personales</Text>
          {PERSONAL_RECORDS.map((pr, i) => (
            <View key={i} style={styles.prRow}>
              <View style={[styles.prIcon, { backgroundColor: pr.color + '20' }]}>
                <MaterialCommunityIcons name={pr.icon} size={20} color={pr.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prExercise}>{pr.exercise}</Text>
                <Text style={styles.prDate}>{pr.date}</Text>
              </View>
              <View style={[styles.prWeightBadge, { borderColor: pr.color + '40' }]}>
                <Text style={[styles.prWeight, { color: pr.color }]}>{pr.weight}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Workout History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📋 Historial Reciente</Text>
          {HISTORY.map((h, i) => (
            <View key={i} style={[styles.historyRow, i < HISTORY.length - 1 && styles.historyBorder]}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDateText}>{h.date}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyName}>{h.routine}</Text>
                <View style={styles.historyMeta}>
                  <Ionicons name="time-outline" size={12} color={THEME.textMuted} />
                  <Text style={styles.historyMetaText}>{h.duration}</Text>
                  <Text style={styles.historyMetaDot}>·</Text>
                  <MaterialCommunityIcons name="dumbbell" size={12} color={THEME.textMuted} />
                  <Text style={styles.historyMetaText}>{h.exercises} ej.</Text>
                  <Text style={styles.historyMetaDot}>·</Text>
                  <MaterialCommunityIcons name="fire" size={12} color={THEME.orange} />
                  <Text style={styles.historyMetaText}>{h.calories} kcal</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={THEME.border} />
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },
  scroll: { padding: 16, paddingBottom: 40 },

  header: { marginBottom: 20, paddingTop: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: THEME.text },
  headerSub: { fontSize: 13, color: THEME.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: 'row', marginBottom: 16 },
  summaryCard: { padding: 16, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },
  summaryNum: { fontSize: 22, fontWeight: '800', color: '#000', marginVertical: 4 },
  summaryLabel: { fontSize: 10, color: 'rgba(0,0,0,0.5)', fontWeight: '600', textAlign: 'center' },

  sectionCard: { backgroundColor: THEME.card, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.text },

  tabRow: { flexDirection: 'row', backgroundColor: THEME.dark, borderRadius: 10, padding: 2 },
  tabBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tabBtnActive: { backgroundColor: THEME.accent },
  tabText: { fontSize: 11, color: THEME.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#000' },

  weightBadge: { backgroundColor: THEME.accentDim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  weightBadgeText: { color: THEME.accent, fontSize: 12, fontWeight: '700' },
  weightGoalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  weightGoalItem: { alignItems: 'center' },
  weightGoalLabel: { fontSize: 10, color: THEME.textMuted },
  weightGoalVal: { fontSize: 16, fontWeight: '800', color: THEME.text },
  weightGoalBar: { flex: 1, height: 6, backgroundColor: THEME.dark, borderRadius: 10, marginHorizontal: 12, overflow: 'hidden' },
  weightGoalFill: { height: 6, backgroundColor: THEME.accent, borderRadius: 10 },
  weightNote: { fontSize: 12, color: THEME.textMuted, textAlign: 'center', marginTop: 12 },

  prRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.border + '40' },
  prIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  prExercise: { fontSize: 14, fontWeight: '600', color: THEME.text },
  prDate: { fontSize: 11, color: THEME.textMuted, marginTop: 2 },
  prWeightBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  prWeight: { fontSize: 13, fontWeight: '800' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: THEME.border + '40' },
  historyDate: { width: 36, alignItems: 'center', marginRight: 12 },
  historyDateText: { fontSize: 11, color: THEME.textMuted, fontWeight: '700' },
  historyName: { fontSize: 14, fontWeight: '600', color: THEME.text, marginBottom: 4 },
  historyMeta: { flexDirection: 'row', alignItems: 'center' },
  historyMetaText: { fontSize: 11, color: THEME.textMuted, marginHorizontal: 3 },
  historyMetaDot: { color: THEME.border, fontSize: 12 },
  orange: '#FF6B35',
});

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 110, justifyContent: 'space-around' },
  barWrapper: { alignItems: 'center', flex: 1 },
  barBg: { width: 24, height: 80, backgroundColor: THEME.dark, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11, color: THEME.textMuted, marginTop: 6, fontWeight: '600' },
  barValue: { fontSize: 10, fontWeight: '800', marginTop: 2 },
});