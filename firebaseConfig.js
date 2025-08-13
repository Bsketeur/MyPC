// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getAuth, 
  getReactNativePersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhq93KdbrLF2VfcWiu6po6MAf3SYDrp8g",
  authDomain: "mypc-a3317.firebaseapp.com",
  projectId: "mypc-a3317",
  storageBucket: "mypc-a3317.appspot.com",
  messagingSenderId: "566380137822",
  appId: "1:566380137822:android:541befdb8bc8ff7c9613cf",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Auth différemment selon la plateforme
let auth;
if (Platform.OS === "web") {
  // Sur le web → utiliser browserLocalPersistence
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  // Sur mobile → utiliser AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialiser Firestore
const db = getFirestore(app);

export { auth, db };
