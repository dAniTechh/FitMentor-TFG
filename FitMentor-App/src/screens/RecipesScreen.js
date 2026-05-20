import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView,
  StyleSheet, ActivityIndicator, RefreshControl, StatusBar,
  ScrollView, Modal, Alert, Image
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'http://192.168.178.73:3000/recipes';

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
  blue: '#4FC3F7',
  orange: '#FF6B35',
};

const CATEGORIES = [
  { id: 'Todas',          icon: 'apps-outline' },
  { id: 'Alta Proteína',  icon: 'barbell-outline' },
  { id: 'Bajo Carb',      icon: 'leaf-outline' },
  { id: 'Desayuno',       icon: 'sunny-outline' },
  { id: 'Comida',         icon: 'restaurant-outline' },
  { id: 'Cena',           icon: 'moon-outline' },
];

// Fallback demo data
const DEMO_RECIPES = [
  {
    id: 1, title: 'Bowl de Pollo y Quinoa', type: 'Comida', calories: 480,
    protein: 42, carbs: 38, fat: 12, prepTime: 25, imageUrl: null,
    instructions: 'Cocina la quinoa según instrucciones. Asa el pollo con especias. Combina con vegetales frescos y aliña con limón.',
    ingredients: [
      { name: 'Pechuga de pollo (200g)' },
      { name: 'Quinoa (80g)' },
      { name: 'Pimiento rojo' },
      { name: 'Espinacas' },
      { name: 'Aceite de oliva' },
    ]
  },
  {
    id: 2, title: 'Tortilla de Claras con Avena', type: 'Desayuno', calories: 320,
    protein: 35, carbs: 28, fat: 7, prepTime: 10, imageUrl: null,
    instructions: 'Bate las claras con la avena. Cocina en sartén antiadherente. Sirve con fruta fresca.',
    ingredients: [
      { name: '6 claras de huevo' },
      { name: 'Avena (50g)' },
      { name: 'Canela' },
      { name: 'Fresas' },
    ]
  },
  {
    id: 3, title: 'Salmón con Espárragos', type: 'Cena', calories: 420,
    protein: 38, carbs: 8, fat: 22, prepTime: 20, imageUrl: null,
    instructions: 'Hornea el salmón a 180°C durante 15min. Saltea los espárragos con ajo y aceite de oliva.',
    ingredients: [
      { name: 'Filete de salmón (200g)' },
      { name: 'Espárragos verdes' },
      { name: 'Ajo' },
      { name: 'Limón' },
    ]
  },
  {
    id: 4, title: 'Batido de Proteínas Verde', type: 'Desayuno', calories: 280,
    protein: 32, carbs: 22, fat: 6, prepTime: 5, imageUrl: null,
    instructions: 'Licua todos los ingredientes hasta obtener una textura cremosa.',
    ingredients: [
      { name: 'Proteína en polvo (1 scoop)' },
      { name: 'Espinacas (handful)' },
      { name: 'Plátano congelado' },
      { name: 'Leche de almendras' },
    ]
  },
];

// Macro circle component
function MacroCircle({ value, max, label, color, unit = 'g' }) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
        <View style={[modalStyles.macroCircleBg, { borderColor: color + '30' }]}>
          <Text style={[modalStyles.macroCircleVal, { color }]}>{value}{unit}</Text>
        </View>
      </View>
      <Text style={modalStyles.macroCircleLabel}>{label}</Text>
    </View>
  );
}

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState([]);
  const [activeCat, setActiveCat] = useState('Todas');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchRecipes = async (ing = '') => {
    setLoading(true);
    try {
      const res = await axios.get(ing ? `${API_URL}?ingredient=${ing}` : API_URL);
      setRecipes(res.data.length > 0 ? res.data : DEMO_RECIPES);
    } catch (error) {
      setRecipes(DEMO_RECIPES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRecipes(); }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (text) result = result.filter(r => r.title.toLowerCase().includes(text.toLowerCase()));
    if (activeCat === 'Todas') return result;
    if (activeCat === 'Alta Proteína') return result.filter(r => r.protein >= 30);
    if (activeCat === 'Bajo Carb') return result.filter(r => (r.carbs || 0) < 15);
    return result.filter(r => r.type === activeCat);
  }, [recipes, activeCat, text]);

  const totalMacros = useMemo(() => ({
    calories: filteredRecipes.reduce((s, r) => s + (r.calories || 0), 0),
    protein: filteredRecipes.reduce((s, r) => s + (r.protein || 0), 0),
  }), [filteredRecipes]);

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>NUTRICIÓN</Text>
          <Text style={styles.mainTitle}>Recetas Fit</Text>
        </View>
        <View style={styles.favCount}>
          <Ionicons name="heart" size={16} color={THEME.danger} />
          <Text style={styles.favCountText}>{favorites.size}</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{filteredRecipes.length}</Text>
          <Text style={styles.statLbl}>recetas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: THEME.accent }]}>{Math.round(totalMacros.protein / Math.max(filteredRecipes.length, 1))}g</Text>
          <Text style={styles.statLbl}>prot. media</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: THEME.warning }]}>{Math.round(totalMacros.calories / Math.max(filteredRecipes.length, 1))}</Text>
          <Text style={styles.statLbl}>kcal media</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, searchFocused && styles.searchFocused]}>
        <Ionicons name="search" size={18} color={searchFocused ? THEME.accent : THEME.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar receta..."
          placeholderTextColor={THEME.textMuted}
          value={text}
          onChangeText={setText}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {text.length > 0 && (
          <TouchableOpacity onPress={() => setText('')}>
            <Ionicons name="close-circle" size={18} color={THEME.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setActiveCat(cat.id)}
            style={[styles.catChip, activeCat === cat.id && styles.catChipActive]}
          >
            <Ionicons
              name={cat.icon}
              size={14}
              color={activeCat === cat.id ? '#000' : THEME.textMuted}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.catText, activeCat === cat.id && styles.catTextActive]}>{cat.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }) => {
    const isFav = favorites.has(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.card}
        onPress={() => setSelectedRecipe(item)}
      >
        {/* Image / Placeholder */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <LinearGradient
            colors={['#1A1A2E', '#16213E']}
            style={[styles.cardImage, { justifyContent: 'center', alignItems: 'center' }]}
          >
            <MaterialCommunityIcons name="food" size={44} color={THEME.accent + '50'} />
          </LinearGradient>
        )}

        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>

        {/* Favorite */}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? THEME.danger : THEME.text}
          />
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="fire" size={13} color={THEME.orange} />
              <Text style={styles.infoText}>{item.calories} kcal</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={13} color={THEME.textMuted} />
              <Text style={styles.infoText}>{item.prepTime} min</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="food-steak" size={13} color={THEME.accent} />
              <Text style={[styles.infoText, { color: THEME.accent }]}>{item.protein}g prot</Text>
            </View>
          </View>

          <View style={styles.macroBar}>
            {/* Protein bar */}
            <View style={[styles.macroSegment, { flex: item.protein, backgroundColor: THEME.accent }]} />
            {/* Carbs bar */}
            <View style={[styles.macroSegment, { flex: item.carbs, backgroundColor: THEME.blue }]} />
            {/* Fat bar */}
            <View style={[styles.macroSegment, { flex: item.fat, backgroundColor: THEME.warning }]} />
          </View>
          <View style={styles.macroLegend}>
            <Text style={[styles.macroLegendText, { color: THEME.accent }]}>P:{item.protein}g</Text>
            <Text style={[styles.macroLegendText, { color: THEME.blue }]}>C:{item.carbs}g</Text>
            <Text style={[styles.macroLegendText, { color: THEME.warning }]}>G:{item.fat}g</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.dark} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.accent} />
          <Text style={styles.loadingText}>Cargando recetas...</Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={filteredRecipes}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRecipes(); }}
              tintColor={THEME.accent}
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="food-off" size={50} color={THEME.border} />
              <Text style={styles.emptyText}>No hay recetas para este filtro</Text>
            </View>
          }
        />
      )}

      {/* Recipe Detail Modal */}
      <Modal visible={!!selectedRecipe} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: THEME.dark }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Image/header */}
            {selectedRecipe?.imageUrl ? (
              <Image source={{ uri: selectedRecipe.imageUrl }} style={modalStyles.image} />
            ) : (
              <LinearGradient colors={['#0A0A0F', '#13131A']} style={modalStyles.imagePlaceholder}>
                <MaterialCommunityIcons name="food" size={80} color={THEME.accent + '40'} />
              </LinearGradient>
            )}

            <TouchableOpacity onPress={() => setSelectedRecipe(null)} style={modalStyles.closeBtn}>
              <Ionicons name="arrow-back" size={22} color={THEME.text} />
            </TouchableOpacity>

            <View style={modalStyles.content}>
              <View style={modalStyles.titleRow}>
                <Text style={modalStyles.title}>{selectedRecipe?.title}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(selectedRecipe?.id)}>
                  <Ionicons
                    name={favorites.has(selectedRecipe?.id) ? 'heart' : 'heart-outline'}
                    size={26}
                    color={favorites.has(selectedRecipe?.id) ? THEME.danger : THEME.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={modalStyles.typeLabel}>{selectedRecipe?.type?.toUpperCase()}</Text>

              {/* Macro circles */}
              <View style={modalStyles.macroCircles}>
                <MacroCircle value={selectedRecipe?.calories} max={800} label="Calorías" color={THEME.orange} unit="kcal" />
                <MacroCircle value={selectedRecipe?.protein} max={60} label="Proteína" color={THEME.accent} />
                <MacroCircle value={selectedRecipe?.carbs} max={100} label="Carbos" color={THEME.blue} />
                <MacroCircle value={selectedRecipe?.fat} max={50} label="Grasas" color={THEME.warning} />
              </View>

              <View style={modalStyles.infoRow}>
                <View style={modalStyles.infoChip}>
                  <Ionicons name="time-outline" size={16} color={THEME.textMuted} />
                  <Text style={modalStyles.infoChipText}>{selectedRecipe?.prepTime} min</Text>
                </View>
                <View style={modalStyles.infoChip}>
                  <MaterialCommunityIcons name="fire" size={16} color={THEME.orange} />
                  <Text style={modalStyles.infoChipText}>{selectedRecipe?.calories} kcal</Text>
                </View>
              </View>

              <View style={modalStyles.divider} />

              <Text style={modalStyles.sectionTitle}>🥦 Ingredientes</Text>
              {selectedRecipe?.ingredients?.length > 0 ? (
                selectedRecipe.ingredients.map((ing, idx) => (
                  <View key={idx} style={modalStyles.ingredientRow}>
                    <View style={modalStyles.ingredientDot} />
                    <Text style={modalStyles.ingredientText}>{ing.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={modalStyles.bodyText}>Lista no disponible.</Text>
              )}

              <View style={modalStyles.divider} />

              <Text style={modalStyles.sectionTitle}>👨‍🍳 Preparación</Text>
              <Text style={modalStyles.bodyText}>{selectedRecipe?.instructions || 'Sin instrucciones.'}</Text>

              <TouchableOpacity style={modalStyles.addBtn}>
                <LinearGradient colors={[THEME.accent, '#00CC6A']} style={modalStyles.addBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  <Ionicons name="add" size={20} color="#000" />
                  <Text style={modalStyles.addBtnText}>AÑADIR AL PLAN SEMANAL</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.dark },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: THEME.textMuted, marginTop: 14, fontSize: 15 },

  headerSection: { padding: 20, paddingBottom: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 11, color: THEME.accent, fontWeight: '800', letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: THEME.text, letterSpacing: -0.5 },
  favCount: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: THEME.border },
  favCountText: { color: THEME.text, fontWeight: '700', marginLeft: 6 },

  statsBar: { flexDirection: 'row', backgroundColor: THEME.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: THEME.text },
  statLbl: { fontSize: 11, color: THEME.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: THEME.border },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, borderRadius: 14, paddingHorizontal: 14, height: 48, marginBottom: 16, borderWidth: 1, borderColor: THEME.border },
  searchFocused: { borderColor: THEME.accent },
  searchInput: { flex: 1, fontSize: 15, color: THEME.text },

  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: THEME.card, marginRight: 8, borderWidth: 1, borderColor: THEME.border, marginBottom: 8 },
  catChipActive: { backgroundColor: THEME.accent, borderColor: THEME.accent },
  catText: { fontWeight: '600', color: THEME.textMuted, fontSize: 12 },
  catTextActive: { color: '#000' },

  card: { backgroundColor: THEME.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: THEME.border },
  cardImage: { width: '100%', height: 160 },
  typeBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  typeBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  favBtn: { position: 'absolute', top: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 18, padding: 6 },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: THEME.text, marginBottom: 10 },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  infoText: { fontSize: 12, color: THEME.textMuted, marginLeft: 4, fontWeight: '600' },
  macroBar: { flexDirection: 'row', height: 5, borderRadius: 10, overflow: 'hidden', marginBottom: 6 },
  macroSegment: { height: 5 },
  macroLegend: { flexDirection: 'row' },
  macroLegendText: { fontSize: 11, fontWeight: '700', marginRight: 10 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: THEME.textMuted, marginTop: 14 },
});

const modalStyles = StyleSheet.create({
  image: { width: '100%', height: 260 },
  imagePlaceholder: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, padding: 10 },
  content: { padding: 24, marginTop: -20, backgroundColor: THEME.dark, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: THEME.text, marginRight: 12 },
  typeLabel: { fontSize: 11, color: THEME.accent, fontWeight: '800', letterSpacing: 2, marginBottom: 20 },

  macroCircles: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  macroCircleBg: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.card },
  macroCircleVal: { fontSize: 11, fontWeight: '800' },
  macroCircleLabel: { fontSize: 10, color: THEME.textMuted, marginTop: 6, fontWeight: '600' },

  infoRow: { flexDirection: 'row', marginBottom: 20 },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginRight: 10, borderWidth: 1, borderColor: THEME.border },
  infoChipText: { fontSize: 13, color: THEME.text, marginLeft: 6, fontWeight: '600' },

  divider: { height: 1, backgroundColor: THEME.border, marginVertical: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: THEME.text, marginBottom: 14 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: THEME.border + '40' },
  ingredientDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.accent, marginRight: 12 },
  ingredientText: { fontSize: 15, color: '#D1D5DB' },
  bodyText: { fontSize: 15, color: THEME.textMuted, lineHeight: 26 },

  addBtn: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  addBtnText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1, marginLeft: 8 },
});