import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Modal, ScrollView, Animated, Alert, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const API_URL = 'http://192.168.178.73:3000/routines';

const THEME = {
  dark: '#0A0A0F',
  card: '#13131A',
  border: '#1E1E2E',
  accent: '#00FF88',
  accentDim: 'rgba(0,255,136,0.12)',
  text: '#FFFFFF',
  textMuted: '#6B7280',
  danger: '#FF4757',
  warning: '#FFB74D',
};

const LEVEL_CONFIG = {
  principiante: { color: '#4FC3F7', icon: 'speedometer-slow', label: 'PRINCIPIANTE' },
  intermedio:   { color: '#FFB74D', icon: 'speedometer-medium', label: 'INTERMEDIO' },
  avanzado:     { color: '#FF4757', icon: 'speedometer', label: 'AVANZADO' },
  general:      { color: THEME.accent, icon: 'speedometer-medium', label: 'GENERAL' },
};

const MUSCLE_GROUPS = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

// --- Workout Timer Component ---
function WorkoutTimer({ routine, onClose }) {
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restMode, setRestMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const exercises = routine?.exercises || [];
  const currentEx = exercises[currentExIdx];
  const totalSets = currentEx?.sets || 3;

  useEffect(() => {
    if (isRunning && !restMode) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (restMode) {
      intervalRef.current = setInterval(() => {
        setRestSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRestMode(false);
            setSeconds(0);
            setIsRunning(true);
            return 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, restMode]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const completeSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet(s => s + 1);
      setIsRunning(false);
      setRestMode(true);
      setRestSeconds(60);
    } else if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(i => i + 1);
      setCurrentSet(1);
      setIsRunning(false);
      setRestMode(true);
      setRestSeconds(90);
    } else {
      Alert.alert('🏆 ¡Entrenamiento completado!', '¡Increíble trabajo! Has terminado todas las series.', [
        { text: 'Genial', onPress: onClose }
      ]);
    }
  };

  return (
    <View style={timerStyles.container}>
      <LinearGradient colors={['#0A0A0F', '#13131A']} style={timerStyles.bg}>
        <TouchableOpacity onPress={onClose} style={timerStyles.closeBtn}>
          <Ionicons name="close" size={26} color={THEME.textMuted} />
        </TouchableOpacity>

        <Text style={timerStyles.routineName}>{routine?.name}</Text>

        {/* Progress dots */}
        <View style={timerStyles.progressDots}>
          {exercises.map((_, i) => (
            <View key={i} style={[
              timerStyles.dot,
              i < currentExIdx && timerStyles.dotDone,
              i === currentExIdx && timerStyles.dotActive,
            ]} />
          ))}
        </View>

        {restMode ? (
          <View style={timerStyles.restContainer}>
            <Text style={timerStyles.restLabel}>DESCANSO</Text>
            <Text style={timerStyles.restTimer}>{formatTime(restSeconds)}</Text>
            <Text style={timerStyles.nextLabel}>Siguiente: {currentEx?.exercise?.name}</Text>
            <TouchableOpacity onPress={() => { setRestMode(false); setIsRunning(true); }} style={timerStyles.skipBtn}>
              <Text style={timerStyles.skipBtnText}>Saltar descanso →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={timerStyles.workContainer}>
            <Text style={timerStyles.exName}>{currentEx?.exercise?.name}</Text>
            <Text style={timerStyles.setInfo}>
              Serie {currentSet} de {totalSets}  ·  {currentEx?.reps} reps
            </Text>

            <View style={timerStyles.timerCircle}>
              <LinearGradient colors={['#1E1E2E', '#13131A']} style={timerStyles.timerInner}>
                <Text style={timerStyles.timerText}>{formatTime(seconds)}</Text>
                <Text style={timerStyles.timerSub}>cronómetro</Text>
              </LinearGradient>
            </View>

            <View style={timerStyles.controls}>
              <TouchableOpacity
                onPress={() => setIsRunning(r => !r)}
                style={timerStyles.playBtn}
              >
                <Ionicons name={isRunning ? 'pause' : 'play'} size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={completeSet} style={timerStyles.doneBtn}>
              <LinearGradient colors={[THEME.accent, '#00CC6A']} style={timerStyles.doneBtnGrad}>
                <Ionicons name="checkmark" size={20} color="#000" />
                <Text style={timerStyles.doneBtnText}>
                  {currentSet < totalSets ? 'SERIE COMPLETADA' :
                   currentExIdx < exercises.length - 1 ? 'EJERCICIO COMPLETADO' : 'FINALIZAR'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <Text style={timerStyles.exProgress}>
          Ejercicio {currentExIdx + 1} / {exercises.length}
        </Text>
      </LinearGradient>
    </View>
  );
}

// --- Main Screen ---
export default function RoutinesScreen() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [timerRoutine, setTimerRoutine] = useState(null);

  const fetchRoutines = async () => {
    try {
      const res = await axios.get(API_URL);
      setRoutines(res.data);
    } catch (err) {
      // Demo data si no hay backend
      setRoutines([
        {
          id: 1, name: 'Tren Superior A', level: 'intermedio', objective: 'Fuerza e hipertrofia',
          exercises: [
            { id:1, sets:4, reps:'8-10', exercise: { name:'Press de Banca', muscleGroup:'Pecho' } },
            { id:2, sets:3, reps:'6-8', exercise: { name:'Dominadas', muscleGroup:'Espalda' } },
            { id:3, sets:4, reps:'10', exercise: { name:'Remo con Barra', muscleGroup:'Espalda' } },
            { id:4, sets:3, reps:'12', exercise: { name:'Press Militar', muscleGroup:'Hombros' } },
          ]
        },
        {
          id: 2, name: 'Tren Inferior B', level: 'avanzado', objective: 'Piernas y glúteos',
          exercises: [
            { id:5, sets:5, reps:'5', exercise: { name:'Sentadilla', muscleGroup:'Piernas' } },
            { id:6, sets:4, reps:'8', exercise: { name:'Peso Muerto', muscleGroup:'Piernas' } },
            { id:7, sets:3, reps:'12', exercise: { name:'Prensa', muscleGroup:'Piernas' } },
          ]
        },
        {
          id: 3, name: 'Full Body C', level: 'principiante', objective: 'Acondicionamiento general',
          exercises: [
            { id:8, sets:3, reps:'15', exercise: { name:'Flexiones', muscleGroup:'Pecho' } },
            { id:9, sets:3, reps:'15', exercise: { name:'Sentadilla Libre', muscleGroup:'Piernas' } },
            { id:10, sets:3, reps:'12', exercise: { name:'Plancha', muscleGroup:'Core' } },
          ]
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRoutines(); }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const getLevelConfig = (level) =>
    LEVEL_CONFIG[level?.toLowerCase()] || LEVEL_CONFIG.general;

  const renderRoutineCard = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const lvl = getLevelConfig(item.level);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
        style={styles.card}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.levelIndicator, { backgroundColor: lvl.color + '20' }]}>
            <MaterialCommunityIcons name={lvl.icon} size={16} color={lvl.color} />
          </View>

          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.levelBadge, { borderColor: lvl.color + '40' }]}>
                <Text style={[styles.levelText, { color: lvl.color }]}>{lvl.label}</Text>
              </View>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{item.exercises?.length || 0} ejercicios</Text>
            </View>
          </View>

          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={THEME.textMuted}
          />
        </View>

        {/* Objective tag */}
        {item.objective && (
          <View style={styles.objectivePill}>
            <Ionicons name="flag-outline" size={12} color={THEME.accent} />
            <Text style={styles.objectiveText}>{item.objective}</Text>
          </View>
        )}

        {/* Exercise Preview (collapsed) */}
        {!isExpanded && (
          <View style={styles.exercisePreview}>
            {item.exercises?.slice(0, 3).map((ex, i) => (
              <View key={i} style={styles.exRow}>
                <View style={styles.exDot} />
                <Text style={styles.exName}>{ex.exercise?.name || 'Ejercicio'}</Text>
                <Text style={styles.exDetail}>{ex.sets}×{ex.reps}</Text>
              </View>
            ))}
            {item.exercises?.length > 3 && (
              <Text style={styles.moreText}>+{item.exercises.length - 3} más · toca para ver todo</Text>
            )}
          </View>
        )}

        {/* Expanded Detail */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />
            <Text style={styles.expandedTitle}>EJERCICIOS</Text>
            {item.exercises?.map((ex, i) => (
              <View key={ex.id || i} style={styles.exRowExpanded}>
                <View style={styles.exNumberCircle}>
                  <Text style={styles.exNumber}>{i + 1}</Text>
                </View>
                <View style={styles.exInfo}>
                  <Text style={styles.exNameExpanded}>{ex.exercise?.name || 'Ejercicio'}</Text>
                  {ex.exercise?.muscleGroup && (
                    <Text style={styles.exMuscle}>{ex.exercise.muscleGroup}</Text>
                  )}
                </View>
                <View style={styles.exBadge}>
                  <Text style={styles.exBadgeText}>{ex.sets} series</Text>
                  <Text style={styles.exBadgeSub}>{ex.reps} reps</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => setTimerRoutine(item)}
            >
              <LinearGradient
                colors={[THEME.accent, '#00CC6A']}
                style={styles.startBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="play" size={18} color="#000" />
                <Text style={styles.startBtnText}>INICIAR ENTRENAMIENTO</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.dark} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Entrenamientos</Text>
          <Text style={styles.headerSub}>{routines.length} rutinas disponibles</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={THEME.text} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
      >
        {MUSCLE_GROUPS.map(g => (
          <TouchableOpacity
            key={g}
            onPress={() => setActiveFilter(g)}
            style={[styles.filterChip, activeFilter === g && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, activeFilter === g && styles.filterTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="dumbbell" size={40} color={THEME.accent} />
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={item => item.id.toString()}
          renderItem={renderRoutineCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRoutines(); }}
              tintColor={THEME.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="dumbbell" size={50} color={THEME.border} />
              <Text style={styles.emptyText}>Sin rutinas asignadas</Text>
              <Text style={styles.emptySubtext}>Consulta a tu entrenador</Text>
            </View>
          }
        />
      )}

      {/* Workout Timer Modal */}
      <Modal visible={!!timerRoutine} animationType="slide" statusBarTranslucent>
        {timerRoutine && (
          <WorkoutTimer
            routine={timerRoutine}
            onClose={() => setTimerRoutine(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: THEME.text },
  headerSub: { fontSize: 13, color: THEME.textMuted, marginTop: 2 },
  searchBtn: { width: 44, height: 44, backgroundColor: THEME.card, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },

  filterScroll: { maxHeight: 52 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: THEME.card, marginRight: 8, borderWidth: 1, borderColor: THEME.border },
  filterChipActive: { backgroundColor: THEME.accent, borderColor: THEME.accent },
  filterText: { color: THEME.textMuted, fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#000' },

  card: { backgroundColor: THEME.card, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: THEME.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelIndicator: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: THEME.text, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  levelText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  metaDot: { color: THEME.textMuted, marginHorizontal: 6 },
  metaText: { fontSize: 12, color: THEME.textMuted },

  objectivePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.accentDim, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12, alignSelf: 'flex-start' },
  objectiveText: { fontSize: 12, color: THEME.accent, marginLeft: 6, fontWeight: '600' },

  exercisePreview: { borderTopWidth: 1, borderTopColor: THEME.border, paddingTop: 12 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  exDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.accent, marginRight: 10 },
  exName: { flex: 1, fontSize: 14, color: '#D1D5DB', fontWeight: '500' },
  exDetail: { fontSize: 13, color: THEME.accent, fontWeight: '700' },
  moreText: { fontSize: 11, color: THEME.textMuted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },

  expandedSection: {},
  divider: { height: 1, backgroundColor: THEME.border, marginBottom: 16 },
  expandedTitle: { fontSize: 10, color: THEME.textMuted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  exRowExpanded: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.border + '60' },
  exNumberCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: THEME.accentDim, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  exNumber: { fontSize: 12, fontWeight: '800', color: THEME.accent },
  exInfo: { flex: 1 },
  exNameExpanded: { fontSize: 15, fontWeight: '600', color: THEME.text },
  exMuscle: { fontSize: 11, color: THEME.textMuted, marginTop: 2 },
  exBadge: { alignItems: 'flex-end' },
  exBadgeText: { fontSize: 13, color: THEME.text, fontWeight: '700' },
  exBadgeSub: { fontSize: 11, color: THEME.textMuted },

  startBtn: { marginTop: 18, borderRadius: 14, overflow: 'hidden' },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  startBtnText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1, marginLeft: 8 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: THEME.textMuted, marginTop: 14, fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, color: THEME.textMuted, fontWeight: '600', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: THEME.border, marginTop: 6 },
});

const timerStyles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1, paddingTop: 60, paddingHorizontal: 24, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 54, right: 24, padding: 8 },
  routineName: { fontSize: 16, color: THEME.textMuted, fontWeight: '600', marginBottom: 20 },
  progressDots: { flexDirection: 'row', marginBottom: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.border, marginHorizontal: 4 },
  dotDone: { backgroundColor: THEME.accent + '60' },
  dotActive: { backgroundColor: THEME.accent, width: 24, borderRadius: 5 },

  restContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  restLabel: { fontSize: 12, color: THEME.warning, fontWeight: '800', letterSpacing: 3, marginBottom: 16 },
  restTimer: { fontSize: 80, fontWeight: '800', color: THEME.text, letterSpacing: -3, marginBottom: 16 },
  nextLabel: { fontSize: 16, color: THEME.textMuted },
  skipBtn: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 24 },
  skipBtnText: { color: THEME.accent, fontWeight: '700', fontSize: 15 },

  workContainer: { width: '100%', alignItems: 'center', flex: 1, justifyContent: 'center' },
  exName: { fontSize: 26, fontWeight: '800', color: THEME.text, textAlign: 'center', marginBottom: 8 },
  setInfo: { fontSize: 15, color: THEME.textMuted, marginBottom: 36 },
  timerCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: THEME.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 36 },
  timerInner: { width: 188, height: 188, borderRadius: 94, justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 46, fontWeight: '800', color: THEME.text, letterSpacing: -2 },
  timerSub: { fontSize: 11, color: THEME.textMuted, letterSpacing: 2, marginTop: 4 },
  controls: { marginBottom: 24 },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: THEME.accent, justifyContent: 'center', alignItems: 'center' },
  doneBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  doneBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  doneBtnText: { color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 1, marginLeft: 8 },

  exProgress: { fontSize: 12, color: THEME.textMuted, paddingBottom: 40 },
});