import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_VITE_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_VITE_FIREBASE_APP_ID
};

console.log("🔥 Firebase Config:", firebaseConfig); 

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'zh-TW'; // Set language to Traditional Chinese
setPersistence(auth, browserLocalPersistence); // Enable persistence
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();