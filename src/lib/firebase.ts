import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove, query, where, Timestamp, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const app = initializeApp({
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId
});

export const auth = getAuth(app);
const firestoreDatabaseId = (firebaseConfigData as typeof firebaseConfigData & { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase auth persistence could not be enabled:', err);
});

enableIndexedDbPersistence(db).catch((err: any) => {
  if (err?.code === 'failed-precondition') {
    console.warn('Firestore persistence is already enabled in another tab.');
  } else if (err?.code === 'unimplemented') {
    console.warn('Firestore persistence is not supported in this browser.');
  }
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
  onSnapshot
};

export type { User };
