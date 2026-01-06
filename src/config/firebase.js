import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBTAesmzhOphAsNUOgPlTSzto4KKjl2J4I',
  authDomain: 'pulsewave-5a7b5.firebaseapp.com',
  projectId: 'pulsewave-5a7b5',
  storageBucket: 'pulsewave-5a7b5.firebasestorage.app',
  messagingSenderId: '964344295958',
  appId: '1:964344295958:web:94ff7b1c1ec3fff0fefb37',
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { app, auth };
