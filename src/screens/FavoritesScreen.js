import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { ArticleCard } from '../components/ArticleCard';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

export const FavoritesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { favorites, toggleFavorite, isFavorite } = useFavorites(user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.url || item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => navigation.navigate('ArticleDetails', { article: item })}
            onToggleFavorite={() => toggleFavorite(item)}
            isFavorite={isFavorite(item)}
          />
        )}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No favorites yet. Tap hearts to save articles.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  gridContent: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 24,
    textAlign: 'center',
  },
});
