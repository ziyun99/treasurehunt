import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Title from "./components/Home/Title";
import Menubar from "./components/Home/Menubar";
import Badges from "./components/Home/Badges";
import LandmarkModal from "./components/Home/LandmarkModal";
import AchievementNotification from "./components/Home/AchievementNotification";
import HotspotsOverlay from "./components/Home/HotspotsOverlay";
import CheckInButton from "./components/Home/CheckInButton";
import { GAME_RULES } from "./config/gameRules";
import { updateDiamondPoints } from "./utils/pointsManager";

const START_DATE = new Date("2025-04-21T00:00:00");

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [showDiamondBonus, setShowDiamondBonus] = useState(false);
  const [diamondBonusType, setDiamondBonusType] = useState(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [diamondPoints, setDiamondPoints] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        setDiamondPoints(data.diamondPoints || 0);
        if (!data.profileCompleted) navigate("/profile");
      } else {
        await setDoc(ref, { progress: {}, diamondPoints: 0 });
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

  const handleProgressUpdate = async (newProgress) => {
    setProgress(newProgress);
    // Calculate if a new landmark was just unlocked
    const oldCompleted = Object.values(progress || {}).filter(Boolean).length;
    const newCompleted = Object.values(newProgress || {}).filter(Boolean).length;
    
    if (newCompleted > oldCompleted) {
      // Update points using the points manager
      await updateDiamondPoints({
        user,
        taskId: 'landmarkUnlock',
        currentPoints: diamondPoints,
        setDiamondPoints,
        setShowDiamondBonus,
        setDiamondBonusType
      });
      
      // Update Firebase with new progress
      if (user) {
        await setDoc(doc(db, "users", user.uid), { 
          progress: newProgress
        }, { merge: true });
      }
    }
  };

  const handleModalClose = () => {
    setActiveLandmark(null);
    setTimeout(() => {
      setShowAchievement(true);
    }, 500);
  };

  if (!user || !userData?.profileCompleted) return null;

  return (
    <div className="min-h-screen bg-yellow-50 relative overflow-hidden">
      {/* Floating Title */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
        <Title countdown={countdown} />
      </div>

      {/* Floating Menubar */}
      <div className="fixed top-4 right-4 z-20">
        <div className="md:block hidden">
          <Menubar user={user} />
        </div>
        <div className="md:hidden block">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/20 z-20"
                onClick={() => setIsMenuOpen(false)}
              />
              {/* Menu Dropdown */}
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white/95 shadow-xl transform transition-all duration-200 ease-in-out z-30">
                <div className="p-3">
                  <Menubar user={user} isVertical={true} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diamond Bonus Notification */}
      {showDiamondBonus && (
        <div className="fixed top-24 left-4 z-30 animate-bounce">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 flex items-center gap-2">
            <span className="text-lg">💎</span>
            <span className="text-lg font-semibold text-indigo-600">
              +{GAME_RULES.tasks[diamondBonusType === 'landmark' ? 'landmarkUnlock' : 'dailyCheckIn'].points}
            </span>
          </div>
        </div>
      )}

      {/* Floating Badges */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className="md:w-64 w-48">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 md:p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm md:text-lg font-semibold text-gray-800">{userData?.name || '玩家'} 的成就</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-indigo-600">💎 {diamondPoints}</span>
                <button 
                  onClick={() => setIsBadgesOpen(!isBadgesOpen)}
                  className="md:hidden block p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-gray-500 transform transition-transform duration-200 ${isBadgesOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={`md:block ${isBadgesOpen ? 'block' : 'hidden'}`}>
              <Badges progress={progress} />
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Button */}
      <div className="fixed bottom-4 right-4 z-20">
        <CheckInButton 
          user={user} 
          diamondPoints={diamondPoints}
          setDiamondPoints={setDiamondPoints}
          setShowDiamondBonus={setShowDiamondBonus}
          setDiamondBonusType={setDiamondBonusType}
        />
      </div>

      {/* Map Background */}
      <div className="w-full h-screen absolute inset-0 overflow-hidden">
        <svg 
          className="w-full h-full"
          viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
          <image
            href={`${process.env.PUBLIC_URL}/${isPortrait ? 'map-vertical.svg' : 'map.svg'}`}
            x="0"
            y="0"
            width={viewportSize.width}
            height={viewportSize.height}
            preserveAspectRatio="none"
          />
        </svg>
      </div>

      {/* Hotspots Overlay */}
      <div className="w-full h-screen absolute inset-0">
        <HotspotsOverlay
          progress={progress}
          unlockedIndex={getUnlockedIndex()}
          onClickMarker={handleLandmarkClick}
        />
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
