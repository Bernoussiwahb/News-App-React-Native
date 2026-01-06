import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(undefined);

const normaliseProfile = (uid, fallbackEmail, data = {}) => {
  const preferredGenres = Array.isArray(data.preferredGenres)
    ? data.preferredGenres.filter((genre) => typeof genre === 'string')
    : [];

  return {
    uid,
    firstName: typeof data.firstName === 'string' ? data.firstName : '',
    lastName: typeof data.lastName === 'string' ? data.lastName : '',
    email: typeof data.email === 'string' ? data.email : fallbackEmail ?? '',
    preferredGenres,
  };
};

const fetchUserProfile = async (uid, fallbackEmail) => {
  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return normaliseProfile(uid, fallbackEmail, snapshot.data());
  }
  return normaliseProfile(uid, fallbackEmail);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser.uid, firebaseUser.email);
          setUser(profile);
        } else {
          setUser(null);
        }
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async ({ password, ...profile }) => {
    const credential = await createUserWithEmailAndPassword(auth, profile.email, password);
    const userRef = doc(db, 'users', credential.user.uid);
    const trimmedProfile = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: profile.email,
      preferredGenres: profile.preferredGenres,
    };
    try {
      await setDoc(userRef, trimmedProfile);
    } catch (error) {
      console.warn('Failed to persist profile to Firestore. Check rules.', error);
    }
    setUser({ ...trimmedProfile, uid: credential.user.uid });
  };

  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(credential.user.uid, credential.user.email ?? email);
    setUser(profile);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Logout failed. Clearing local user anyway.', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profile) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user.');
    }

    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, profile, { merge: true });
    setUser((prev) => (prev ? { ...prev, ...profile } : prev));
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      signup,
      login,
      logout,
      updateProfile,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
