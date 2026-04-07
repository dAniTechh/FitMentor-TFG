import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, Text, FlatList, ActivityIndicator, SafeAreaView, StyleSheet, 
  RefreshControl, StatusBar, TouchableOpacity, LayoutAnimation, 
  Platform, UIManager, Alert, TextInput, Modal
} from 'react-native';
import axios from 'axios';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = 'http://192.168.178.73:3000/routines';

const COLORS = {
  bg: '#F8F9FA',
  primary: '#27AE60',
  secondary: '#2D3436',
  accent: '#E67E22',
  white: '#FFFFFF',
  border: '#EEE',
  textSub: '#636E72',
  rest: '#3498DB'
};

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  
  // LOGICA DE ENTRENAMIENTO
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [weights, setWeights] = useState({});
  
  // LOGICA DE DESCANSO
  const [restTimer, setRestTimer] = useState(0);
  const [showRestModal, setShowRestModal] = useState(false);

  const intervalRef = useRef(null);
  const restIntervalRef = useRef(null);

  useEffect(() => {
    fetchRoutines();
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(restIntervalRef.current);
    };
  }, []);

  // Cronómetro de sesión
  useEffect(() => {
    if (activeRoutineId && !isPaused) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [activeRoutineId, isPaused]);

  // Cronómetro de descanso
  useEffect(() => {
    if (restTimer > 0) {
      restIntervalRef.current = setInterval(() => setRestTimer(t => t - 1), 1000);
    } else {
      clearInterval(restIntervalRef.current);
      setShowRestModal(false);
    }
    return () => clearInterval(restIntervalRef.current);
  }, [restTimer]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      
      // SEGURIDAD: Validamos que los datos tengan la estructura de rutina
      if (res.data.length > 0 && res.data[0].title) {
         console.error("DEBUG: Estás recibiendo recetas en lugar de rutinas.");
         Alert.alert("Error de Datos", "El servidor envió recetas. Verifica la tabla de la BD.");
         return;
      }
      setRoutines(res.data);
    } catch (err) {
      Alert.alert("Error de Conexión", "Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const activeRoutine = routines.find(r => r.id === activeRoutineId);
  
  // Cálculo de progreso
  const totalSets = activeRoutine?.exercises.reduce((acc, ex) => acc + ex.sets, 0) || 0;
  const doneSets = Object.values(completedSets).filter(v => v).length;
  const progress = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const handleSetToggle = (key) => {
    const isNowDone = !completedSets[key];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedSets({...completedSets, [key]: isNowDone});

    if (isNowDone) {
      setRestTimer(60); // 60 segundos de descanso
      setShowRestModal(true);
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  // --- SUB-COMPONENTE: MODAL DE DESCANSO ---
  const RestModal = () => (
    <Modal visible={showRestModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.restCard}>
          <Text style={styles.restTitle}>TIEMPO DE DESCANSO</Text>
          <Text style={styles.restClock}>{restTimer}s</Text>
          <TouchableOpacity style={styles.skipBtn} onPress={() => setRestTimer(0)}>
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (activeRoutine) {
    return (
      <SafeAreaView style={styles.activeContainer}>
        <RestModal />
        <View style={styles.sessionHeader}>
          <TouchableOpacity onPress={() => Alert.alert("Abandonar", "¿Seguro?", [{text: "No"}, {text: "Sí", onPress: () => setActiveRoutineId(null)}])}>
            <Feather name="x" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsPaused(!isPaused)}>
            <Ionicons name={isPaused ? "play-circle" : "pause-circle"} size={28} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <FlatList
          data={activeRoutine.exercises}
          ListHeaderComponent={<Text style={styles.sessionTitle}>{activeRoutine.name}</Text>}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item: ex }) => (
            <View style={styles.exActiveCard}>
              <View style={styles.exActiveHeader}>
                <Text style={styles.exActiveName}>{ex.exercise.name}</Text>
                <TouchableOpacity onPress={() => Alert.alert("Guía", "Realiza el movimiento controlado.")}>
                  <Feather name="help-circle" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.tableHeader}>
                <Text style={styles.colSmall}>SERIE</Text>
                <Text style={styles.col}>PESO</Text>
                <Text style={styles.col}>REPS</Text>
                <Text style={styles.colSmall}>OK</Text>
              </View>

              {[...Array(ex.sets)].map((_, i) => {
                const key = `${ex.id}-${i}`;
                return (
                  <View key={i} style={[styles.setRow, completedSets[key] && styles.setRowDone]}>
                    <Text style={styles.colSmallText}>{i + 1}</Text>
                    <TextInput 
                      style={styles.weightInput} 
                      placeholder="0" 
                      keyboardType="numeric"
                      onChangeText={(v) => setWeights({...weights, [key]: v})}
                    />
                    <Text style={styles.colText}>{ex.reps}</Text>
                    <TouchableOpacity 
                      style={[styles.checkBtn, completedSets[key] && styles.checkBtnDone]}
                      onPress={() => handleSetToggle(key)}
                    >
                      <Feather name="check" size={14} color={completedSets[key] ? "white" : "#DDD"} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Entrenar</Text>
          <Text style={styles.subtitle}>Elige tu objetivo de hoy</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert("Nueva Rutina", "Función disponible en la versión Pro.")}>
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setActiveRoutineId(item.id)}>
            <View style={styles.iconBox}>
               <MaterialCommunityIcons name="weight-lifter" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.level} • {item.exercises.length} Ejercicios</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  title: { fontSize: 30, fontWeight: '900', color: COLORS.secondary },
  subtitle: { color: COLORS.textSub, fontSize: 14 },
  addBtn: { backgroundColor: COLORS.secondary, width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  iconBox: { width: 45, height: 45, backgroundColor: '#E8F8F5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.secondary },
  cardMeta: { fontSize: 12, color: COLORS.textSub, marginTop: 2 },

  // Sesión Activa
  activeContainer: { flex: 1, backgroundColor: 'white' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  timerBadge: { backgroundColor: '#F8F9FA', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 10 },
  timerText: { fontWeight: '800', color: COLORS.secondary, fontSize: 16 },
  progressContainer: { height: 4, backgroundColor: '#EEE', width: '100%' },
  progressBar: { height: 4, backgroundColor: COLORS.primary },
  sessionTitle: { fontSize: 24, fontWeight: '900', color: COLORS.secondary, marginTop: 10 },
  exActiveCard: { marginBottom: 30 },
  exActiveHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  exActiveName: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
  col: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '800', color: COLORS.textSub },
  colSmall: { flex: 0.5, textAlign: 'center', fontSize: 10, fontWeight: '800', color: COLORS.textSub },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9F9F9' },
  setRowDone: { backgroundColor: '#F0FFF4' },
  weightInput: { flex: 1, textAlign: 'center', backgroundColor: '#F4F4F4', borderRadius: 6, marginHorizontal: 10, padding: 4, fontWeight: '700' },
  colText: { flex: 1, textAlign: 'center', fontWeight: '600' },
  colSmallText: { flex: 0.5, textAlign: 'center', fontWeight: '800', color: COLORS.textSub },
  checkBtn: { flex: 0.5, height: 26, backgroundColor: '#F0F0F0', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkBtnDone: { backgroundColor: COLORS.primary },

  // Modal de Descanso
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  restCard: { backgroundColor: 'white', padding: 30, borderRadius: 25, alignItems: 'center', width: '80%' },
  restTitle: { fontSize: 12, fontWeight: '800', color: COLORS.rest, letterSpacing: 1 },
  restClock: { fontSize: 60, fontWeight: '900', color: COLORS.secondary, marginVertical: 10 },
  skipBtn: { marginTop: 10, padding: 10 },
  skipText: { color: COLORS.textSub, fontWeight: '700' }
});