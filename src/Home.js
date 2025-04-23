import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection } from "firebase/firestore";
import Map from "./Map";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_VITE_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_VITE_FIREBASE_APP_ID
};

console.log("🔥 Firebase Config:", firebaseConfig); 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const START_DATE = new Date("2025-04-23T00:00:00");

export default function Home() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProgress(snap.data().progress || {});
        } else {
          await setDoc(ref, { progress: {} });
        }
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextUnlock = new Date(START_DATE);
      nextUnlock.setDate(START_DATE.getDate() + getUnlockedIndex() + 1);
      const diff = nextUnlock - now;
      if (diff <= 0) {
        setCountdown("已解鎖下一地標！");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`距離下一地標解鎖：${hours}時 ${minutes}分 ${seconds}秒`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getUnlockedIndex = () => {
    const today = new Date();
    const diff = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const openLandmarkModal = (id) => {
    setActiveLandmark(id);
    setPasswordInput("");
    setMessage("");
  };

  const checkPassword = async () => {
    if (!user || activeLandmark == null) return;
    const ref = doc(db, "treasure_passwords", `${activeLandmark + 1}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const correctPassword = snap.data().keyword;
      if (passwordInput.trim() === correctPassword) {
        const newProgress = { ...progress, [activeLandmark]: true };
        setProgress(newProgress);
        await setDoc(doc(db, "users", user.uid), { progress: newProgress });
        setMessage("✅ 通關成功！");
      } else {
        setMessage("❌ 密語錯誤，請再試一次");
      }
    } else {
      setMessage("⚠️ 此地標尚未設置密語");
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">黃金尋寶秘笈 4.0</h1>
        {user ? (
          <button onClick={handleSignOut} className="text-red-600">登出</button>
        ) : (
          <button onClick={handleSignIn} className="text-blue-600">Google 登入</button>
        )}
      </div>

      {user && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">我的尋寶圖</h2>
          <p className="text-sm text-gray-600 mb-4">{countdown}</p>
          <Map progress={progress} onClickMarker={openLandmarkModal} getUnlockedIndex={getUnlockedIndex} />
        </div>
      )}

      {activeLandmark != null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">地標 {activeLandmark + 1} 通關密語</h2>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <button onClick={checkPassword} className="bg-green-500 text-white px-4 py-2 rounded">確認</button>
              <button onClick={() => setActiveLandmark(null)} className="text-gray-500">取消</button>
            </div>
            {message && <p className="mt-4 text-center">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
