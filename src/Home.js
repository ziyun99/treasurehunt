import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Title from "./components/Home/Title";
import Menubar from "./components/Home/Menubar";
import Badges from "./components/Home/Badges";
import LandmarkModal from "./components/modals/LandmarkModal";
import AchievementNotification from "./components/Home/AchievementNotification";
import ChestOverlay from "./components/Home/ChestOverlay";
import MusicPlayer from "./components/Home/MusicPlayer";
import { GAME_RULES } from "./config/gameRules";
import { updateDiamondPoints } from "./utils/pointsManager";
import DiamondLogsModal from "./components/modals/DiamondLogsModal";

const START_DATE = new Date("2025-04-24T00:00:00");

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
  const [diamondBonusTask, setdiamondBonusTask] = useState(null);
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [diamondPoints, setDiamondPoints] = useState(0);
  const [isMapAnimationComplete, setIsMapAnimationComplete] = useState(false);
  const audioContextRef = useRef(null);
  const hasPlayedSoundRef = useRef(false);
  const navigate = useNavigate();
  const [showDiamondLogs, setShowDiamondLogs] = useState(false);

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
        setProgress(data.progress || {landmark: {}, diamond: {}});
        setDiamondPoints(data.diamondPoints || 0);
        if (!data.profileCompleted) navigate("/profile");
      } else {
        await setDoc(ref, { progress: {landmark: {}, diamond: {}}, diamondPoints: 0 });
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

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume audio context on any user interaction
    const resumeAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
    
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };
  }, []);

  const playScrollSound = async () => {
    try {
      if (!audioContextRef.current) return;
      
      const response = await fetch(`${process.env.PUBLIC_URL}/scroll-unroll.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = 0.5; // Adjust volume
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.start(0);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

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

  const handleProgressUpdate = async (taskName, taskId) => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const userData = snap.data();
    const currentProgress = userData?.progress || { landmark: {}, diamond: {} };
    setProgress(currentProgress);

    console.log("handleProgressUpdate:setProgress", taskName, taskId);
    // Update points using the points manager
    const newPoints = await updateDiamondPoints({
      user,
      taskId: taskName,
      currentPoints: diamondPoints,
      setDiamondPoints,
      setShowDiamondBonus,
      setdiamondBonusTask
    });

    // Add diamond log entry
    const diamondLogRef = doc(db, "users", user.uid, "diamond_logs", Date.now().toString());
    const logData = {
      timestamp: new Date(),
      task: GAME_RULES.tasks[taskName].id,
      points: GAME_RULES.tasks[taskName].points
    };
    // Only add task_id if it's provided
    if (taskId) {
      logData.task_id = taskId;
    }
    await setDoc(diamondLogRef, logData);
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
        <Title countdown={countdown} progress={progress} />
      </div>

      {/* Floating Menubar */}
      <div className="fixed top-4 right-4 z-20">
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

      {/* Diamond Bonus Notification */}
      {showDiamondBonus && (
        <div className="fixed top-24 left-4 z-30 animate-bounce">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 flex items-center gap-2">
            <span className="text-lg">💎</span>
            <span className="text-lg font-semibold text-indigo-600">
              +{GAME_RULES.tasks[diamondBonusTask].points}
            </span>
          </div>
        </div>
      )}

      {/* Floating Badges */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className="w-[240px] sm:w-[280px]">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1.5 sm:p-3">
            <div 
              className="flex items-center justify-between cursor-pointer whitespace-nowrap px-2 py-1.5 hover:bg-gray-50/50 rounded-lg transition-colors duration-200 group"
              onClick={() => setIsBadgesOpen(!isBadgesOpen)}
            >
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-[140px]">{userData?.name || '玩家'}的徽章牆</h2>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 text-gray-400 transform transition-transform duration-200 ${isBadgesOpen ? 'rotate-180' : ''} group-hover:text-gray-600`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-indigo-50/50 px-1.5 py-0.5 rounded-full border border-indigo-100 relative overflow-hidden cursor-pointer hover:bg-indigo-50/70 transition-colors duration-200"
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowDiamondLogs(true);
                     }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent animate-shine" style={{ animationDelay: `${Math.random() * 5}s` }} />
                  <span className="text-xs sm:text-sm font-semibold text-indigo-600 relative">💎 {diamondPoints}</span>
                </div>
              </div>
            </div>
            <div className={`transition-all duration-200 ease-in-out ${isBadgesOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <Badges 
                progress={progress.landmark} 
                user={user}
                diamondPoints={diamondPoints}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer user={user} />

      {/* Map Background */}
      <div className="w-full h-screen absolute inset-0 overflow-hidden">
        <div className="relative w-full h-full">
          {/* Animated Map */}
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isMapAnimationComplete ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <img
              src={`${process.env.PUBLIC_URL}/${isPortrait ? 'map-vertical.gif' : 'map.gif'}`}
              alt="Map Animation"
              className="w-full h-full"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill'
              }}
              onLoad={() => {
                // Play scroll sound only once when GIF first loads
                if (!hasPlayedSoundRef.current) {
                  playScrollSound();
                  hasPlayedSoundRef.current = true;
                }
                // Wait for the GIF to complete (assuming it's 3 seconds)
                setTimeout(() => {
                  setIsMapAnimationComplete(true);
                }, 3000);
              }}
            />
          </div>
          
          {/* Regular Map */}
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isMapAnimationComplete ? 'opacity-100' : 'opacity-0'
            }`}
          >
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
        </div>
      </div>

      <div className="w-full h-screen absolute inset-0">
        {/* Combined Chest Overlay */}
        {isMapAnimationComplete && (
          <ChestOverlay
            user={user}
            progress={progress}
            unlockedIndex={getUnlockedIndex()}
            onClickMarker={handleLandmarkClick}
            handleProgressUpdate={handleProgressUpdate}
          />
        )}
      </div>

      <LandmarkModal
        user={user}
        activeLandmark={activeLandmark}
        progress={progress.landmark}
        onClose={handleModalClose}
        handleProgressUpdate={handleProgressUpdate}
      />

      {showAchievement && (
        <AchievementNotification earned={earned} prevEarned={prevEarned} />
      )}

      <DiamondLogsModal 
        isOpen={showDiamondLogs}
        onClose={() => setShowDiamondLogs(false)}
        user={user}
      />
    </div>
  );
}
