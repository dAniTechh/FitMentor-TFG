import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import axios from 'axios';
// Importamos iconos
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3000/recipes';

const COLORS = {
  bg: '#FFFFFF',
  textHeader: '#1A1A1A',
  textCard: '#2D3436',
  textSub: '#7F8C8D',
  cardBg: '#FFFFFF',
  inputBg: '#F1F2F6', // Gris muy claro para el input
  shadow: '#000000',
  accent: '#27AE60' // Verde sutil para macros
};

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
      console.error(error);
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
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Nutrición</Text>
      </View>
      
      {/* Buscador estilo Pill */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Buscar ingrediente..." 
            placeholderTextColor="#A0A0A0"
            value={text} 
            onChangeText={setText}
            onSubmitEditing={() => fetchRecipes(text)}
            returnKeyType="search"
          />
          {text.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={18} color="#C0C0C0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="small" color="#CCC" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CCC" />}
          ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron recetas.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              
              {/* Macros minimalistas */}
              <View style={styles.macrosRow}>
                <View style={styles.macroPill}>
                  <MaterialCommunityIcons name="fire" size={14} color={COLORS.accent} />
                  <Text style={styles.macroText}>{item.calories} <Text style={styles.macroUnit}>kcal</Text></Text>
                </View>
                <View style={styles.macroPill}>
                  <MaterialCommunityIcons name="food-drumstick-outline" size={14} color={COLORS.accent} />
                  <Text style={styles.macroText}>{item.protein}g <Text style={styles.macroUnit}>prot</Text></Text>
                </View>
              </View>

              <Text style={styles.ingredients} numberOfLines={2}>
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerContainer: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textHeader, letterSpacing: -0.5 },
  
  // Estilo del buscador integrado
  searchWrapper: { paddingHorizontal: 20, marginBottom: 15 },
  searchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.inputBg, 
    borderRadius: 100, // Hace forma de pastilla total
    paddingHorizontal: 15
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: COLORS.textCard, fontWeight: '400' },
  clearIcon: { padding: 5 },

  emptyText: { textAlign: 'center', color: COLORS.textSub, marginTop: 40, fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  
  // Tarjeta elegante
  card: { 
    backgroundColor: COLORS.cardBg, 
    marginBottom: 12, 
    padding: 20, 
    borderRadius: 16, 
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5, 
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textCard, marginBottom: 8 },
  
  // Macros con estilo "pill" sutil
  macrosRow: { flexDirection: 'row', marginBottom: 12 },
  macroPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 10 },
  macroText: { marginLeft: 5, fontWeight: '700', color: COLORS.accent, fontSize: 13 },
  macroUnit: { fontWeight: '400', color: COLORS.accent, fontSize: 12 },

  ingredients: { fontSize: 13, color: COLORS.textSub, lineHeight: 18, fontWeight: '400' }
});