import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://localhost:3000/recipes';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [text, setText] = useState('');

  const fetchRecipes = (ing = '') => {
    const url = ing ? `${API_URL}?ingredient=${ing}` : API_URL;
    axios.get(url).then(res => setRecipes(res.data)).catch(console.error);
  };

  useEffect(() => { fetchRecipes(); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Nutrición</Text>
      <View style={styles.searchRow}>
        <TextInput style={styles.input} placeholder="Buscar (ej: Pollo)" value={text} onChangeText={setText} />
        <TouchableOpacity style={styles.btn} onPress={() => fetchRecipes(text)}><Text>🔍</Text></TouchableOpacity>
      </View>
      <FlatList
        data={recipes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>Kcal: {item.calories} | Prot: {item.protein}g</Text>
            <Text style={{fontStyle:'italic', marginTop:5}}>
              {item.ingredients.map(i => i.name).join(', ')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', margin: 20 },
  searchRow: { flexDirection: 'row', marginHorizontal: 10 },
  input: { flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 5 },
  btn: { backgroundColor: '#ddd', padding: 10, marginLeft: 5, borderRadius: 5 },
  card: { backgroundColor: 'white', margin: 10, padding: 15, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold' }
});
