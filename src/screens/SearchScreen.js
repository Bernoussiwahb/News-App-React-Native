import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { ArticleCard } from '../components/ArticleCard';
import { fetchEverything } from '../services/newsApi';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

export const SearchScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites(user);
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetchEverything({ query: query.trim(), pageSize: 20 });
      setArticles(response.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch results.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search news, topics, authors..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonLabel}>Go</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

      <FlatList
        data={articles}
        keyExtractor={(item, index) => item.url || `${item.title}-${index}`}
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
          !loading && !error ? <Text style={styles.emptyText}>Search to discover articles.</Text> : null
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  searchButtonLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
  loader: {
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
