import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/recipes';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipes = async (ing = '') => {
    setLoading(true);
    const url = ing ? `${API_URL}?ingredient=${ing}` : API_URL;
    try {
      const res = await axios.get(url);
      setRecipes(res.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchRecipes(); 
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecipes(text);
  }, [text]);

  const clearSearch = () => {
    setText('');
    fetchRecipes('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Nutrición</Text>
      
      <View style={styles.searchRow}>
        <TextInput 
          style={styles.input} 
          placeholder="Buscar (ej: Pollo)" 
          value={text} 
          onChangeText={setText}
          onSubmitEditing={() => fetchRecipes(text)} // Permite buscar al presionar "Enter" en el teclado
          returnKeyType="search"
        />
        {text.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}>
            <Text style={{color: 'gray'}}>✖</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btn} onPress={() => fetchRecipes(text)}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron recetas.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.macrosRow}>
                <Text style={styles.macroText}>🔥 {item.calories} Kcal</Text>
                <Text style={styles.macroText}>🍗 {item.protein}g Prot</Text>
              </View>
              <Text style={styles.ingredients}>
                {item.ingredients.map(i => i.name).join(', ')}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 20 },
  searchRow: { flexDirection: 'row', marginHorizontal: 10, alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 8, elevation: 1 },
  clearBtn: { position: 'absolute', right: 60, padding: 10 },
  btn: { backgroundColor: '#e0e0e0', padding: 12, marginLeft: 8, borderRadius: 8, elevation: 1 },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 30 },
  card: { backgroundColor: 'white', marginHorizontal: 10, marginVertical: 6, padding: 15, borderRadius: 10, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  macrosRow: { flexDirection: 'row', marginTop: 8, marginBottom: 5 },
  macroText: { marginRight: 15, fontWeight: '600', color: '#27ae60' },
  ingredients: { fontStyle: 'italic', marginTop: 5, color: '#7f8c8d' }
});