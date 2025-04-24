import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Title from "./components/Home/Title";
import Menubar from "./components/Home/Menubar";
import Map from "./components/Home/Map";
import Badges from "./components/Home/Badges";
import LandmarkModal from "./components/Home/LandmarkModal";
import AchievementNotification from "./components/Home/AchievementNotification";

const START_DATE = new Date("2025-04-22T00:00:00");

export default function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState("");
  const [earned, setEarned] = useState({});
  const [prevEarned, setPrevEarned] = useState({});
  const [showAchievement, setShowAchievement] = useState(false);
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

  useEffect(() => {
    const totalCompleted = Object.values(progress || {}).filter(Boolean).length;
    const newEarned = {
      firstStep: progress?.[0],
      halfWay: totalCompleted >= 3,
      completed: totalCompleted === 7
    };
    
    // Only show achievement if modal is not active
    if (!activeLandmark) {
      setPrevEarned(earned);
      setEarned(newEarned);
      setShowAchievement(true);
    }
  }, [progress, activeLandmark]);

  const handleLandmarkClick = (id) => {
    setActiveLandmark(id);
    setShowAchievement(false);
  };

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress);
  };

  const handleModalClose = () => {
    setActiveLandmark(null);
    // Show achievement after a short delay when modal closes
    setTimeout(() => {
      setShowAchievement(true);
    }, 500);
  };

  if (!user || !userData?.profileCompleted) return null;

  return (
    <div className="min-h-screen bg-yellow-50 relative">
      {/* Floating Title */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20">
        <Title countdown={countdown} />
      </div>

      {/* Floating Menubar */}
      <div className="fixed top-4 right-4 z-20">
        <Menubar user={user} />
      </div>

      {/* Floating Badges */}
      <div className="fixed bottom-4 left-4 z-20 w-64">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">我的成就</h2>
          <Badges progress={progress} />
        </div>
      </div>

      {/* Map as background */}
      <div className="w-full h-screen">
        <Map progress={progress} onClickMarker={handleLandmarkClick} getUnlockedIndex={getUnlockedIndex} />
      </div>

      <LandmarkModal
        user={user}
        activeLandmark={activeLandmark}
        progress={progress}
        onClose={handleModalClose}
        onProgressUpdate={handleProgressUpdate}
      />
      {showAchievement && (
        <AchievementNotification earned={earned} prevEarned={prevEarned} />
      )}
    </div>
  );
}
