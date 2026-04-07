import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, StyleSheet, RefreshControl, StatusBar } from 'react-native';
import axios from 'axios';
// Importamos iconos
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

const API_URL = 'http://192.168.178.73:3000/routines';

// Paleta de colores minimalista
const COLORS = {
  bg: '#FFFFFF',
  textHeader: '#1A1A1A',
  textCard: '#2D3436',
  textSub: '#7F8C8D',
  cardBg: '#FFFFFF',
  shadow: '#000000',
  accent: '#27AE60' // Opcional, un toque verde sutil
};

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutines = async () => {
    try {
      setError(null);
      const res = await axios.get(API_URL);
      setRoutines(res.data);
    } catch (err) {
      setError("No se pudieron cargar las rutinas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRoutines();
  }, []);

  if (loading) return <ActivityIndicator size="small" color="#CCC" style={{marginTop:50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>FitMentor</Text>
        <Text style={styles.headerSub}>Tus entrenamientos</Text>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={routines}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CCC" />}
        ListEmptyComponent={
          !loading && !error ? <Text style={styles.emptyText}>No hay rutinas asignadas.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.levelBadge}>
                    <Octicons name="graph" size={12} color={COLORS.textSub} />
                    <Text style={styles.levelText}>{item.level.toUpperCase()}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#DDD" />
            </View>

            <View style={styles.exerciseList}>
              {item.exercises.slice(0, 3).map(ex => ( // Mostramos solo 3 para mantener el minimalismo
                <View key={ex.id} style={styles.exRow}>
                  <Text style={styles.exName}>{ex.exercise.name}</Text>
                  <Text style={styles.exDetails}>{ex.sets} × {ex.reps}</Text>
                </View>
              ))}
              {item.exercises.length > 3 && (
                <Text style={styles.moreText}>+ {item.exercises.length - 3} ejercicios más</Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  // Header elegante y espaciado
  headerContainer: { paddingHorizontal: 24, paddingVertical: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textHeader, letterSpacing: -0.5 },
  headerSub: { fontSize: 16, color: COLORS.textSub, marginTop: 2, fontWeight: '400' },
  
  errorText: { color: 'red', marginHorizontal: 24, fontSize: 14 },
  emptyText: { textAlign: 'center', color: COLORS.textSub, marginTop: 40, fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  // Tarjeta minimalista: fondo blanco, sombra sutil, mucho padding
  card: { 
    backgroundColor: COLORS.cardBg, 
    marginBottom: 16, 
    padding: 20, 
    borderRadius: 16, 
    // Sombra sutil para iOS
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Sombra sutil para Android
    elevation: 2, 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textCard, marginBottom: 4 },
  
  // Pequeña etiqueta de nivel
  levelBadge: { flexDirection: 'row', alignItems: 'center' },
  levelText: { color: COLORS.textSub, fontSize: 11, fontWeight: '600', marginLeft: 5, letterSpacing: 1 },

  exerciseList: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  exRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  exName: { fontWeight: '500', color: COLORS.textCard, fontSize: 15 },
  exDetails: { color: COLORS.textSub, fontSize: 14, fontWeight: '600' },
  moreText: { textAlign: 'center', color: '#BDBDBD', fontSize: 12, marginTop: 8, fontStyle: 'italic' }
});