import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ArticleCard } from '../components/ArticleCard';
import { fetchTopHeadlines } from '../services/newsApi';
import { useFavorites } from '../hooks/useFavorites';

const FALLBACK_CATEGORIES = ['technology', 'business', 'sports', 'health', 'science', 'entertainment'];

const normalizeCategory = (category) => category.toLowerCase().replace(/\s+/g, '');

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites(user);
  const [featured, setFeatured] = useState([]);
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const categories = useMemo(() => {
    if (user?.preferredGenres?.length) {
      return user.preferredGenres.map(normalizeCategory);
    }
    return FALLBACK_CATEGORIES;
  }, [user?.preferredGenres]);

  const loadFeatured = useCallback(async () => {
    try {
      const results = await Promise.all(
        categories.map(async (category) => {
          const response = await fetchTopHeadlines({ category, pageSize: 1 });
          return { category, article: response.articles?.[0] };
        })
      );
      setFeatured(results.filter((item) => item.article));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load featured articles.');
    }
  }, [categories]);

  const loadArticles = useCallback(
    async (nextPage = 1, append = false) => {
      const pageSize = 12;
      try {
        const response = await fetchTopHeadlines({ page: nextPage, pageSize });
        const nextArticles = response.articles || [];
        setArticles((prev) => (append ? [...prev, ...nextArticles] : nextArticles));
        setPage(nextPage);
        const total = response.totalResults ?? 0;
        const maxAllowed = Math.min(total || 100, 100);
        const loadedCount = nextPage * pageSize;
        setHasMore(loadedCount < maxAllowed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load articles.');
      }
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([loadFeatured(), loadArticles(1, false)]).finally(() => setLoading(false));
  }, [loadFeatured, loadArticles]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeatured(), loadArticles(1, false)]);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadArticles(page + 1, true);
    setLoadingMore(false);
  };

  const renderFeatured = ({ item }) => (
    <Pressable
      style={styles.featureCard}
      onPress={() => navigation.navigate('ArticleDetails', { article: item.article })}
    >
      {item.article?.urlToImage ? (
        <Image source={{ uri: item.article.urlToImage }} style={styles.featureImage} />
      ) : (
        <View style={styles.featureImageFallback}>
          <Text style={styles.featureFallbackText}>No image</Text>
        </View>
      )}
      <View style={styles.featureOverlay}>
        <Text style={styles.featureCategory}>{item.category}</Text>
        <Text numberOfLines={2} style={styles.featureTitle}>
          {item.article?.title}
        </Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top stories</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={featured}
        keyExtractor={(item) => item.article?.url || item.category}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderFeatured}
        style={styles.featureList}
      />

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
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color={colors.primary} />
          ) : !hasMore ? (
            <Text style={styles.footerText}>Fin des resultats pour le plan gratuit.</Text>
          ) : (
            <Pressable style={styles.loadMoreButton} onPress={handleLoadMore}>
              <Text style={styles.loadMoreLabel}>Charger plus</Text>
            </Pressable>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
  featureList: {
    marginBottom: 12,
  },
  featureCard: {
    width: 220,
    height: 140,
    borderRadius: 18,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  featureImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureFallbackText: {
    color: colors.textSecondary,
  },
  featureOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(11,16,32,0.45)',
    padding: 12,
    justifyContent: 'flex-end',
  },
  featureCategory: {
    color: colors.accent,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  gridContent: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    marginVertical: 16,
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  loadMoreButton: {
    marginVertical: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadMoreLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
