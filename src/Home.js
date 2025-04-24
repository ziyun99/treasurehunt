import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Title from "./components/Home/Title";
import Menubar from "./components/Home/Menubar";
import MainContent from "./components/Home/MainContent";
import LandmarkModal from "./components/Home/LandmarkModal";

const START_DATE = new Date("2025-04-23T00:00:00");

export default function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setProgress(data.progress || {});
        if (!data.profileCompleted) navigate("/profile");
      } else {
        await setDoc(ref, { progress: {} });
        navigate("/profile");
      }
    });
  }, [navigate]);

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

  const handleLandmarkClick = (id) => {
    setActiveLandmark(id);
  };

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress);
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <Title countdown={countdown} />
      <Menubar user={user} />
      <MainContent
        user={user}
        userData={userData}
        progress={progress}
        onLandmarkClick={handleLandmarkClick}
      />
      <LandmarkModal
        user={user}
        activeLandmark={activeLandmark}
        progress={progress}
        onClose={() => setActiveLandmark(null)}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}
