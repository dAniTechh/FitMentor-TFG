import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, 
  StyleSheet, ActivityIndicator, RefreshControl, StatusBar, ScrollView, Modal, Alert, Image 
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// IMPORTANTE: Asegúrate de que esta IP sea la de tu PC actual
const API_URL = 'http://192.168.178.73:3000/recipes';

const COLORS = {
  bg: '#F8F9FA',
  primary: '#2ECC71',
  secondary: '#34495E',
  card: '#FFFFFF',
  textMain: '#2D3436',
  textSub: '#95A5A6',
  white: '#FFFFFF',
  accent: '#E67E22',
  carbs: '#3498DB',
  fat: '#F1C40F'
};

const CATEGORIES = ['Todas', 'Alta Proteína', 'Bajo Carb', 'Desayuno', 'Comida', 'Cena'];

export default function RecipesScreen({ token }) {
  const [recipes, setRecipes] = useState([]);
  const [activeCat, setActiveCat] = useState('Todas');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchRecipes = async (ing = '') => {
    setLoading(true);
    try {
      // ENVIAMOS EL TOKEN PARA PASAR EL MIDDLEWARE DEL BACKEND
      const res = await axios.get(ing ? `${API_URL}?ingredient=${ing}` : API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRecipes(res.data);
    } catch (error) {
      console.error("Error al obtener recetas:", error);
      if (error.response?.status === 401) {
        Alert.alert("Sesión expirada", "Por favor, vuelve a iniciar sesión.");
      } else {
        Alert.alert("Error", "No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    if (token) fetchRecipes(); 
  }, [token]);

  // FILTRADO INTELIGENTE: Busca por texto, categorías especiales o tipo de comida
  const filteredRecipes = useMemo(() => {
    let result = recipes;

    if (text) {
      result = result.filter(r => r.title.toLowerCase().includes(text.toLowerCase()));
    }

    if (activeCat === 'Todas') return result;
    if (activeCat === 'Alta Proteína') return result.filter(r => r.protein >= 30);
    if (activeCat === 'Bajo Carb') return result.filter(r => (r.carbs || 0) < 15);
    
    return result.filter(r => r.type === activeCat);
  }, [recipes, activeCat, text]);

  const addToShoppingList = (recipe) => {
    Alert.alert("Lista de la Compra", `Ingredientes de "${recipe.title}" añadidos correctamente.`);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Tu Dieta</Text>
          <Text style={styles.mainTitle}>Recetas Saludables</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      {/* DASHBOARD DE MACROS */}
      <View style={styles.macroCard}>
        <Text style={styles.macroTitle}>Progreso Diario</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '65%' }]} /> 
        </View>
        <View style={styles.macroStatsRow}>
          <Text style={styles.macroStatText}>1,450 / 2,200 kcal</Text>
          <Text style={styles.macroStatText}>Faltan: 750 kcal</Text>
        </View>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSub} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Busca una receta..."
          value={text}
          onChangeText={setText}
        />
      </View>

      {/* CATEGORÍAS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity 
            key={cat} 
            onPress={() => setActiveCat(cat)}
            style={[styles.catChip, activeCat === cat && styles.catChipActive]}
          >
            <Text style={[styles.catText, activeCat === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={filteredRecipes}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchRecipes()} />}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.card}
              onPress={() => setSelectedRecipe(item)}
            >
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              )}
              
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <TouchableOpacity onPress={() => addToShoppingList(item)}>
                    <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons name="fire" size={14} color={COLORS.primary} />
                    <Text style={styles.statVal}>{item.calories} kcal</Text>
                  </View>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.textSub} />
                    <Text style={styles.statVal}>{item.prepTime} min</Text>
                  </View>
                </View>

                <View style={styles.macrosRow}>
                  <Text style={[styles.macroTag, { backgroundColor: '#E8F8F5', color: COLORS.primary }]}>P: {item.protein}g</Text>
                  <Text style={[styles.macroTag, { backgroundColor: '#EBF5FB', color: COLORS.carbs }]}>C: {item.carbs}g</Text>
                  <Text style={[styles.macroTag, { backgroundColor: '#FEF9E7', color: COLORS.fat }]}>G: {item.fat}g</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron recetas disponibles.</Text>
          }
        />
      )}

      {/* MODAL DE DETALLES */}
      <Modal visible={!!selectedRecipe} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {selectedRecipe?.imageUrl && (
              <Image source={{ uri: selectedRecipe.imageUrl }} style={styles.modalImage} />
            )}
            <TouchableOpacity onPress={() => setSelectedRecipe(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedRecipe?.title}</Text>
              <Text style={styles.modalSubtitle}>{selectedRecipe?.type} • {selectedRecipe?.calories} kcal</Text>
              
              <View style={styles.sectionDivider} />
              
              <Text style={styles.sectionTitle}>Ingredientes</Text>
              {selectedRecipe?.ingredients?.length > 0 ? (
                selectedRecipe.ingredients.map((ing, idx) => (
                  <Text key={idx} style={styles.modalText}>• {ing.name}</Text>
                ))
              ) : (
                <Text style={styles.modalText}>Lista de ingredientes no disponible.</Text>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Instrucciones</Text>
              <Text style={styles.modalText}>{selectedRecipe?.instructions || "Sin instrucciones detalladas."}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerSection: { padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: COLORS.textSub, fontWeight: '500' },
  mainTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textMain },
  profileBtn: { padding: 10, backgroundColor: COLORS.white, borderRadius: 12, elevation: 2 },
  macroCard: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 24, marginBottom: 20 },
  macroTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  progressBarBg: { height: 6, backgroundColor: '#333', borderRadius: 10, marginBottom: 12 },
  progressBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 10 },
  macroStatText: { color: '#999', fontSize: 12, fontWeight: '600' },
  macroStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 15, paddingHorizontal: 15, height: 50, marginBottom: 20, elevation: 1 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.textMain },
  searchIcon: { marginRight: 10 },
  categoriesScroll: { marginBottom: 10 },
  catChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10, height: 40, justifyContent: 'center' },
  catChipActive: { backgroundColor: COLORS.primary },
  catText: { fontWeight: '600', color: COLORS.textSub },
  catTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.card, marginHorizontal: 20, marginBottom: 20, borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardImage: { width: '100%', height: 160 },
  cardInfo: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, flex: 1 },
  statsRow: { flexDirection: 'row', marginTop: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  statVal: { fontSize: 13, color: COLORS.textSub, marginLeft: 4 },
  macrosRow: { flexDirection: 'row', marginTop: 12 },
  macroTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 11, fontWeight: '800', marginRight: 8 },
  modalImage: { width: '100%', height: 300 },
  closeBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 5 },
  modalContent: { padding: 25, marginTop: -30, backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalTitle: { fontSize: 26, fontWeight: '800', color: COLORS.textMain },
  modalSubtitle: { fontSize: 15, color: COLORS.primary, fontWeight: '700', marginTop: 5, textTransform: 'uppercase' },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: COLORS.textMain, marginBottom: 10 },
  modalText: { fontSize: 15, color: COLORS.secondary, lineHeight: 24, marginBottom: 5 },
  sectionDivider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textSub, fontSize: 16 }
});