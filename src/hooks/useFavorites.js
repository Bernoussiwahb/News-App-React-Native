import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const getFavoriteDocId = (article) => encodeURIComponent(article.url || article.title || '');

const getFavoritePayload = (article) => ({
  title: article.title ?? '',
  description: article.description ?? '',
  content: article.content ?? '',
  author: article.author ?? '',
  source: article.source ?? null,
  url: article.url ?? '',
  urlToImage: article.urlToImage ?? '',
  publishedAt: article.publishedAt ?? '',
  savedAt: serverTimestamp(),
});

export const useFavorites = (user) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      return undefined;
    }

    const favoritesRef = collection(db, 'users', user.uid, 'favorites');
    const favoritesQuery = query(favoritesRef, orderBy('savedAt', 'desc'));
    const unsubscribe = onSnapshot(favoritesQuery, (snapshot) => {
      const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setFavorites(items);
    });

    return unsubscribe;
  }, [user?.uid]);

  const favoriteIds = useMemo(() => {
    const ids = new Set();
    favorites.forEach((item) => {
      if (item.url) {
        ids.add(item.url);
      }
    });
    return ids;
  }, [favorites]);

  const toggleFavorite = useCallback(
    async (article) => {
      if (!user?.uid) return;
      const docId = getFavoriteDocId(article);
      if (!docId) return;

      const docRef = doc(db, 'users', user.uid, 'favorites', docId);
      if (favoriteIds.has(article.url)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, getFavoritePayload(article), { merge: true });
      }
    },
    [favoriteIds, user?.uid]
  );

  const isFavorite = useCallback(
    (article) => {
      return !!article?.url && favoriteIds.has(article.url);
    },
    [favoriteIds]
  );

  return { favorites, toggleFavorite, isFavorite };
};
