import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  initializeFirestore
} from 'firebase/firestore';

const firebaseConfig = {
  projectId: "maximal-album-q2fsp",
  appId: "1:403062990706:web:ccbcdb1daa604cc6d9dfeb",
  apiKey: "AIzaSyBGDtudqj7mKDC1FTCIEqlR1hcH1E7nwkI",
  authDomain: "maximal-album-q2fsp.firebaseapp.com",
  storageBucket: "maximal-album-q2fsp.firebasestorage.app",
  messagingSenderId: "403062990706",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize firestore with databaseId
const db = initializeFirestore(app, {}, "ai-studio-resqtime-5052ff34-861d-4034-b544-09fd24acdde0");

const googleProvider = new GoogleAuthProvider();

export { 
  app, 
  auth, 
  db, 
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
};
export type { FirebaseUser };
