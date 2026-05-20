import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.178.73:3000';

const THEME = {
  dark: '#0A0A0F',
  card: '#13131A',
  cardAlt: '#16161F',
  border: '#1E1E2E',
  accent: '#00FF88',
  accentDim: 'rgba(0,255,136,0.15)',
  text: '#FFFFFF',
  textMuted: '#6B7280',
  textDim: '#9CA3AF',
  danger: '#FF4757',
  warning: '#FFB74D',
  blue: '#4FC3F7',
};

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function DashboardScreen({ user }) {
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [todayRoutine, setTodayRoutine] = useState(null);
  const [weekActivity, setWeekActivity] = useState([true, true, false, true, false, false, false]);
  const [calories, setCalories] = useState({ consumed: 1450, goal: 2200 });
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const hour = today.getHours();
  const greeting = hour < 13 ? '¡Buenos días' : hour < 20 ? '¡Buenas tardes' : '¡Buenas noches';
  const firstName = user?.name?.split(' ')[0] || 'Campeón';

  const streak = weekActivity.filter(Boolean).length;
  const waterGoal = 8;
  const calorieProgress = calories.consumed / calories.goal;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: calorieProgress,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    fetchTodayRoutine();
  }, []);

  const fetchTodayRoutine = async () => {
    try {
      const res = await axios.get(`${API_URL}/routines`);
      if (res.data.length > 0) {
        setTodayRoutine(res.data[dayOfWeek % res.data.length]);
      }
    } catch (e) {
      // Fallback: usar datos de demostración
      setTodayRoutine({
        name: 'Tren Superior A',
        level: 'intermedio',
        exercises: [
          { exercise: { name: 'Press de Banca' }, sets: 4, reps: '8-10' },
          { exercise: { name: 'Dominadas' }, sets: 3, reps: '6-8' },
          { exercise: { name: 'Remo con Barra' }, sets: 4, reps: '10' },
        ]
      });
    }
  };

  const addWater = () => {
    if (waterGlasses < waterGoal) setWaterGlasses(w => w + 1);
  };
  const removeWater = () => {
    if (waterGlasses > 0) setWaterGlasses(w => w - 1);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.dark} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{firstName} 💪</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications" size={22} color={THEME.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* Streak + Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
            <LinearGradient colors={['#FF6B35', '#FF4757']} style={styles.statGradient} start={{x:0,y:0}} end={{x:1,y:1}}>
              <MaterialCommunityIcons name="fire" size={28} color="#FFF" />
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statLabel}>Racha días</Text>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { flex: 1, marginHorizontal: 4 }]}>
            <View style={[styles.statGradient, { backgroundColor: THEME.card }]}>
              <MaterialCommunityIcons name="dumbbell" size={24} color={THEME.accent} />
              <Text style={[styles.statNumber, { color: THEME.accent }]}>12</Text>
              <Text style={styles.statLabel}>Sesiones mes</Text>
            </View>
          </View>

          <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
            <View style={[styles.statGradient, { backgroundColor: THEME.card }]}>
              <Ionicons name="time" size={24} color={THEME.blue} />
              <Text style={[styles.statNumber, { color: THEME.blue }]}>4.2h</Text>
              <Text style={styles.statLabel}>Esta semana</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Actividad Semanal</Text>
          <View style={styles.weekRow}>
            {DAYS.map((day, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  const updated = [...weekActivity];
                  updated[i] = !updated[i];
                  setWeekActivity(updated);
                }}
                style={[
                  styles.dayCircle,
                  weekActivity[i] && styles.dayCircleActive,
                  i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1) && styles.dayCircleToday,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  weekActivity[i] && styles.dayTextActive
                ]}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.streakNote}>
            {streak >= 5 ? '🔥 ¡Semana increíble! Sigue así.' :
             streak >= 3 ? '💪 ¡Buen ritmo! No pares.' :
             '👟 ¡Arranca la semana con fuerza!'}
          </Text>
        </View>

        {/* Calorie Tracker */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Calorías de Hoy</Text>
            <Text style={styles.calorieCount}>
              <Text style={{ color: THEME.accent }}>{calories.consumed}</Text>
              <Text style={styles.calorieGoal}> / {calories.goal} kcal</Text>
            </Text>
          </View>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.macroRow}>
            {[
              { label: 'Proteína', val: '142g', color: THEME.accent },
              { label: 'Carbos', val: '180g', color: THEME.blue },
              { label: 'Grasas', val: '52g', color: THEME.warning },
            ].map((m) => (
              <View key={m.label} style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={[styles.macroVal, { color: m.color }]}>{m.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Water Tracker */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>💧 Hidratación</Text>
            <Text style={styles.waterCount}>{waterGlasses}/{waterGoal} vasos</Text>
          </View>
          <View style={styles.waterGlasses}>
            {Array.from({ length: waterGoal }).map((_, i) => (
              <TouchableOpacity key={i} onPress={i < waterGlasses ? removeWater : addWater}>
                <Ionicons
                  name={i < waterGlasses ? 'water' : 'water-outline'}
                  size={32}
                  color={i < waterGlasses ? THEME.blue : THEME.border}
                  style={{ marginHorizontal: 3 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.waterNote}>
            {waterGlasses >= waterGoal ? '✅ ¡Meta de hidratación alcanzada!' :
             `Faltan ${waterGoal - waterGlasses} vaso${waterGoal - waterGlasses !== 1 ? 's' : ''} para tu objetivo`}
          </Text>
        </View>

        {/* Today's Workout */}
        {todayRoutine && (
          <View style={styles.workoutCard}>
            <LinearGradient
              colors={['#00FF88', '#00CC6A']}
              style={styles.workoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.workoutHeader}>
                <View>
                  <Text style={styles.workoutLabel}>ENTRENAMIENTO DE HOY</Text>
                  <Text style={styles.workoutName}>{todayRoutine.name}</Text>
                  <Text style={styles.workoutLevel}>
                    {todayRoutine.level?.toUpperCase()} • {todayRoutine.exercises?.length || 0} ejercicios
                  </Text>
                </View>
                <MaterialCommunityIcons name="play-circle" size={52} color="rgba(0,0,0,0.3)" />
              </View>

              <View style={styles.exercisePreview}>
                {todayRoutine.exercises?.slice(0, 3).map((ex, i) => (
                  <View key={i} style={styles.exPill}>
                    <Text style={styles.exPillText}>
                      {ex.exercise?.name || 'Ejercicio'} · {ex.sets}×{ex.reps}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.startBtn}>
                <Text style={styles.startBtnText}>COMENZAR ENTRENAMIENTO →</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Motivational Quote */}
        <View style={[styles.sectionCard, styles.quoteCard]}>
          <Ionicons name="quote" size={20} color={THEME.accent} />
          <Text style={styles.quoteText}>
            "El dolor que sientes hoy será la fuerza que sentirás mañana."
          </Text>
          <Text style={styles.quoteAuthor}>— Arnold Schwarzenegger</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  greeting: { fontSize: 14, color: THEME.textMuted, fontWeight: '500' },
  userName: { fontSize: 26, color: THEME.text, fontWeight: '800', letterSpacing: -0.5 },
  notifBtn: { width: 44, height: 44, backgroundColor: THEME.card, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.danger, borderWidth: 1.5, borderColor: THEME.dark },

  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statCard: { borderRadius: 16, overflow: 'hidden' },
  statGradient: { padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#FFF', marginVertical: 4 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },

  sectionCard: { backgroundColor: THEME.card, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.text, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  dayCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: THEME.dark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  dayCircleActive: { backgroundColor: THEME.accent, borderColor: THEME.accent },
  dayCircleToday: { borderColor: THEME.accent, borderWidth: 2 },
  dayText: { fontSize: 12, fontWeight: '700', color: THEME.textMuted },
  dayTextActive: { color: '#000' },
  streakNote: { fontSize: 12, color: THEME.textMuted, textAlign: 'center', fontStyle: 'italic' },

  calorieCount: { fontSize: 14, fontWeight: '700', color: THEME.text },
  calorieGoal: { color: THEME.textMuted, fontWeight: '400' },
  progressBg: { height: 8, backgroundColor: THEME.dark, borderRadius: 10, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: 8, backgroundColor: THEME.accent, borderRadius: 10 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  macroLabel: { fontSize: 10, color: THEME.textMuted, marginBottom: 2 },
  macroVal: { fontSize: 14, fontWeight: '700' },

  waterCount: { fontSize: 14, color: THEME.textMuted },
  waterGlasses: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 },
  waterNote: { fontSize: 12, color: THEME.textMuted, textAlign: 'center' },

  workoutCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 16 },
  workoutGradient: { padding: 22 },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  workoutLabel: { fontSize: 10, color: 'rgba(0,0,0,0.6)', fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  workoutName: { fontSize: 22, fontWeight: '800', color: '#000', marginBottom: 4 },
  workoutLevel: { fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: '600' },
  exercisePreview: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  exPill: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  exPillText: { fontSize: 12, color: 'rgba(0,0,0,0.7)', fontWeight: '600' },
  startBtn: { backgroundColor: '#000', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  startBtnText: { color: THEME.accent, fontWeight: '800', fontSize: 14, letterSpacing: 1 },

  quoteCard: { borderColor: 'rgba(0,255,136,0.2)', backgroundColor: 'rgba(0,255,136,0.05)' },
  quoteText: { fontSize: 15, color: THEME.text, fontStyle: 'italic', lineHeight: 24, marginVertical: 10 },
  quoteAuthor: { fontSize: 12, color: THEME.accent, fontWeight: '700' },
});