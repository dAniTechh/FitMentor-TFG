import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import axios from 'axios';

// Si usas emulador Android usa 'http://10.0.2.2:3000/routines'
// Si usas movil fisico, pon TU IP local: 'http://192.168.1.XX:3000/routines'
const API_URL = 'http://localhost:3000/routines';

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setRoutines(res.data))
      .catch(err => alert("Error API: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{marginTop:50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mis Rutinas (TFG)</Text>
      <FlatList
        data={routines}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.sub}>{item.level}</Text>
            {item.exercises.map(ex => (
              <Text key={ex.id} style={styles.ex}>• {ex.exercise.name}: {ex.sets}x{ex.reps}</Text>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 20 },
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  sub: { color: 'gray' },
  ex: { marginTop: 5 }
});
