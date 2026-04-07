import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, StyleSheet, RefreshControl } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/routines';

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
      setError("No se pudieron cargar las rutinas. Verifica tu conexión.");
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

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{marginTop:50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mis Rutinas (TFG)</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={routines}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading && !error ? <Text style={styles.emptyText}>No tienes rutinas asignadas aún.</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.sub}>{item.level}</Text>
            <View style={styles.exerciseList}>
              {item.exercises.map(ex => (
                <View key={ex.id} style={styles.exContainer}>
                  <Text style={styles.exName}>• {ex.exercise.name}</Text>
                  <Text style={styles.exDetails}>
                    {ex.sets}x{ex.reps} 
                    {/* Soporte para mostrar técnicas o métodos avanzados si vienen del backend */}
                    {ex.method ? ` | Método: ${ex.method}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 20 },
  errorText: { color: 'red', marginHorizontal: 20, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 },
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sub: { color: '#666', marginBottom: 10 },
  exerciseList: { marginTop: 5 },
  exContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  exName: { fontWeight: '500', color: '#444' },
  exDetails: { color: '#777' }
});